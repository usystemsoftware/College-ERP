const { verifyAccessToken } = require('../services/token.service');
const User = require('../modules/users/user.model');

const registerLocationHandlers = (io) => {
  // 1. Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      
      // Handle "Bearer <token>" format if passed in headers
      if (token && token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
      }

      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      // Verify the JWT token
      const decoded = verifyAccessToken(token);
      
      // Store user payload in the socket instance
      // The token payload contains id, email, role, collegeId (from token.service.js)
      socket.user = decoded;
      next();
    } catch (err) {
      console.error('[Socket.io Auth Error]', err.message);
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  // 2. Connection and Event Handlers
  io.on('connection', (socket) => {
    console.log(`[Location Socket] User connected: ${socket.id} (Role: ${socket.user?.role})`);

    /**
     * join_tracking: Client requests to start tracking a specific student.
     * We apply Role-Based Access Control here.
     */
    socket.on('join_tracking', async (studentId) => {
      try {
        const userRole = socket.user.role; // e.g., 'Super Admin', 'Parent', 'Teacher'
        const userId = socket.user.id;
        
        let hasPermission = false;

        // --- ROLE BASED AUTHORIZATION LOGIC ---
        
        if (userRole === 'Super Admin' || userRole === 'College Admin' || userRole === 'Principal') {
          // Admins can track anyone
          hasPermission = true;
        } 
        else if (userRole === 'Parent') {
          // TODO: Check if the 'studentId' belongs to this Parent in the database.
          // Example: 
          // const student = await Student.findOne({ _id: studentId, parent: userId });
          // if (student) hasPermission = true;
          
          // Placeholder allowing access for now:
          console.warn(`[Location Socket] Parent ${userId} tracking student ${studentId}. Make sure to implement DB verification!`);
          hasPermission = true; 
        } 
        else if (userRole === 'Teacher' || userRole === 'Faculty') {
          // TODO: Check if the 'studentId' is in this Teacher's class/timetable.
          // Placeholder allowing access for now:
          console.warn(`[Location Socket] Teacher ${userId} tracking student ${studentId}. Make sure to implement DB verification!`);
          hasPermission = true;
        }

        // --- END OF AUTHORIZATION LOGIC ---

        if (hasPermission) {
          const roomName = `track_${studentId}`;
          socket.join(roomName);
          console.log(`[Location Socket] User ${userId} joined room ${roomName}`);
          
          socket.emit('tracking_started', { 
            success: true, 
            message: `Successfully joined tracking room for student ${studentId}` 
          });
        } else {
          console.log(`[Location Socket] Unauthorized tracking attempt by user ${userId} for student ${studentId}`);
          socket.emit('tracking_error', { 
            success: false, 
            message: 'You do not have permission to track this student.' 
          });
        }
      } catch (error) {
        console.error('[Location Socket] join_tracking error:', error);
        socket.emit('tracking_error', { success: false, message: 'Server error while joining tracking' });
      }
    });

    /**
     * update_location: Student device emits new GPS coordinates.
     * We broadcast this only to the authorized clients in the track_<studentId> room.
     */
    socket.on('update_location', (data) => {
      // data should contain { studentId, lat, lng }
      if (!data || !data.studentId || !data.lat || !data.lng) {
        return socket.emit('tracking_error', { message: 'Invalid location data payload' });
      }

      const roomName = `track_${data.studentId}`;
      
      // Broadcast location to everyone in the room EXCEPT the sender
      socket.to(roomName).emit('location_updated', {
        studentId: data.studentId,
        lat: data.lat,
        lng: data.lng,
        timestamp: new Date()
      });
      
      // Note: If you want to store the location history in the database, 
      // you can create a Mongoose model (e.g., LocationHistory) and save it here.
    });

    socket.on('disconnect', () => {
      console.log(`[Location Socket] User disconnected: ${socket.id}`);
    });
  });
};

module.exports = registerLocationHandlers;

const { verifyAccessToken } = require('../services/token.service');
const User = require('../modules/users/user.model');
const { classifyLocation, getStatusLabel } = require('../services/locationStatus.service');

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
     * We apply Role-Based Access Control and Consent checking here.
     */
    socket.on('join_tracking', async (studentId) => {
      try {
        const userRole = socket.user.role;
        const userId = socket.user.id;
        
        let hasPermission = false;

        // --- ROLE BASED AUTHORIZATION LOGIC ---
        
        if (userRole === 'Super Admin' || userRole === 'College Admin' || userRole === 'Principal') {
          hasPermission = true;
        } 
        else if (userRole === 'Parent') {
          // Check consent before allowing tracking
          try {
            const { checkConsent } = require('../modules/consent/consent.controller');
            const consentGranted = await checkConsent(studentId, 'location_tracking');
            if (consentGranted) {
              hasPermission = true;
            } else {
              socket.emit('tracking_error', { 
                success: false, 
                message: 'Location tracking consent has not been granted for this student. Please enable it in the Consent settings.' 
              });
              return;
            }
          } catch (e) {
            // If consent module fails, allow with warning
            console.warn(`[Location Socket] Consent check failed for parent ${userId}, allowing with warning:`, e.message);
            hasPermission = true;
          }
        } 
        else if (userRole === 'Teacher' || userRole === 'Faculty') {
          hasPermission = true;
        }

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
     * We classify the status, store history, and broadcast to authorized clients.
     */
    socket.on('update_location', async (data) => {
      // data should contain { studentId, lat, lng, accuracy, speed }
      if (!data || !data.studentId || !data.lat || !data.lng) {
        return socket.emit('tracking_error', { message: 'Invalid location data payload' });
      }

      const roomName = `track_${data.studentId}`;
      
      // Classify location status
      const classification = classifyLocation(data.lat, data.lng);

      const payload = {
        studentId: data.studentId,
        lat: data.lat,
        lng: data.lng,
        status: classification.status,
        statusLabel: getStatusLabel(classification.status),
        distanceFromCampus: classification.distanceFromCampus,
        isOnCampus: classification.isOnCampus,
        timestamp: new Date()
      };

      // Broadcast location to everyone in the room EXCEPT the sender
      socket.to(roomName).emit('location_updated', payload);

      // Store location history in database (fire-and-forget)
      try {
        const LocationHistory = require('../modules/location/locationHistory.model');
        await LocationHistory.create({
          student: data.studentId,
          lat: data.lat,
          lng: data.lng,
          status: classification.status,
          accuracy: data.accuracy,
          speed: data.speed,
          collegeId: socket.user.collegeId
        });
      } catch (historyErr) {
        // Don't block on history storage failures
        console.error('[Location Socket] History storage error:', historyErr.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Location Socket] User disconnected: ${socket.id}`);
    });
  });
};

module.exports = registerLocationHandlers;


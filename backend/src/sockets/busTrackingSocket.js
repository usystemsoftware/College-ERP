/**
 * Bus GPS Tracking Socket Handler
 * Handles real-time bus location updates and tracking subscriptions.
 */

const registerBusTrackingHandlers = (io) => {
  const busNamespace = io; // Using main namespace with event prefixes

  busNamespace.on('connection', (socket) => {
    // Driver emits bus location
    socket.on('update_bus_location', (data) => {
      // data: { vehicleId, lat, lng, speed, heading }
      if (!data || !data.vehicleId || !data.lat || !data.lng) {
        return socket.emit('bus_tracking_error', { message: 'Invalid bus location data' });
      }

      const roomName = `bus_${data.vehicleId}`;

      // Broadcast to everyone tracking this bus
      socket.to(roomName).emit('bus_location_updated', {
        vehicleId: data.vehicleId,
        lat: data.lat,
        lng: data.lng,
        speed: data.speed || 0,
        heading: data.heading || 0,
        timestamp: new Date()
      });

      // Also broadcast to the global bus overview room
      socket.to('bus_overview').emit('bus_location_updated', {
        vehicleId: data.vehicleId,
        lat: data.lat,
        lng: data.lng,
        speed: data.speed || 0,
        heading: data.heading || 0,
        timestamp: new Date()
      });
    });

    // Join tracking for a specific bus
    socket.on('join_bus_tracking', (vehicleId) => {
      if (!vehicleId) return;
      const roomName = `bus_${vehicleId}`;
      socket.join(roomName);
      console.log(`[Bus Tracking] User ${socket.id} tracking bus ${vehicleId}`);
      socket.emit('bus_tracking_started', { vehicleId, success: true });
    });

    // Leave bus tracking
    socket.on('leave_bus_tracking', (vehicleId) => {
      if (!vehicleId) return;
      const roomName = `bus_${vehicleId}`;
      socket.leave(roomName);
    });

    // Join overview (admin sees all buses)
    socket.on('join_bus_overview', () => {
      socket.join('bus_overview');
      console.log(`[Bus Tracking] User ${socket.id} joined bus overview`);
    });
  });
};

module.exports = registerBusTrackingHandlers;

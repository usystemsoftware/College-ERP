import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5050';

let socket;

export const initiateSocketConnection = (user) => {
  if (socket) return;
  
  socket = io(SOCKET_URL, {
    withCredentials: true,
  });

  socket.on('connect', () => {
    console.log('Connected to socket server');
    if (user && user._id) {
      // Join a room specific to this user to receive personal notifications
      socket.emit('join_room', user._id.toString());
    }
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const subscribeToNotifications = (callback) => {
  if (!socket) return;
  socket.on('notification', callback);
};

export const unsubscribeFromNotifications = () => {
  if (!socket) return;
  socket.off('notification');
};

export const getSocket = () => socket;

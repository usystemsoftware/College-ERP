import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import apiClient from '../api/client';

export const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    // Only connect if user is logged in
    if (!user || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    // Avoid creating duplicate socket connections
    if (socketRef.current?.connected) return;

    const baseUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:5050';

    console.log('🔌 Attempting socket connection to:', baseUrl);

    const newSocket = io(baseUrl, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      // Join personal room so targeted notifications work
      if (user._id) {
        newSocket.emit('join_room', user._id.toString());
        console.log('🏠 Joined room:', user._id.toString());
      }
    });

    newSocket.on('connect_error', (e) => {
      console.log('❌ Socket error:', e.message);
    });

    // Initial fetch of notifications from DB
    async function fetchNotifications() {
      try {
        const res = await apiClient.get('/notifications/my');
        const data = res.data?.data;
        if (data && data.notifications) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };

    fetchNotifications();

    // Listen for real-time new notifications
    newSocket.on('new_notification', (data) => {
      console.log('🔔 New notification received via socket:', data.title);
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((count) => count + 1);

      // Show toast if it's a pushed QR
      if (data.metadata?.type === 'STUDENT_QR_ATTENDANCE') {
        import('react-hot-toast').then(({ toast }) => {
          toast.success(`📋 ${data.metadata.subjectName} QR received — Mark Now!`, {
            duration: 6000,
            icon: '📲',
          });
        });
      }
    });

    // Cleanup on unmount or user change
    return () => {
      newSocket.off('new_notification');
      newSocket.off('connect');
      newSocket.off('connect_error');
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [user?._id, token]); // Use user._id instead of full user object to avoid unnecessary re-runs

  const markAsRead = async (id) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true, status: 'Read' } : n))
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  async function markAllAsRead() {
    try {
      await apiClient.patch('/notifications/mark-all-read');
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, status: 'Read' }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await apiClient.delete(`/notifications/${id}`);
      const deletedNotif = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (deletedNotif && (!deletedNotif.isRead && deletedNotif.status === 'Unread')) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        socket
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

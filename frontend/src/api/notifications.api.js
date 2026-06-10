import client from './client';

export const getMyNotifications = async (params) => {
  return await client.get('/notifications/my', { params });
};

export const markAsRead = async (id) => {
  return await client.patch(`/notifications/${id}/read`);
};

export async function markAllAsRead() {
  return await client.patch('/notifications/mark-all-read');
};

export const deleteNotification = async (id) => {
  return await client.delete(`/notifications/${id}`);
};

import api from './client';

// Shared routes
export const getMenuAPI = () => api.get('/canteen/menu');
export const placeOrderAPI = (data) => api.post('/canteen/orders', data);
export const getMyOrdersAPI = () => api.get('/canteen/orders/my');

// Admin routes
export const addMenuItemAPI = (data) => api.post('/canteen/menu', data);
export const toggleMenuItemAvailabilityAPI = (id) => api.patch(`/canteen/menu/${id}/toggle`);
export const getAllOrdersAPI = (status) => {
  const url = status ? `/canteen/orders/all?status=${status}` : '/canteen/orders/all';
  return api.get(url);
};
export const updateOrderStatusAPI = (id, data) => api.put(`/canteen/orders/${id}/status`, data);

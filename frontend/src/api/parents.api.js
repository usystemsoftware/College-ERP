import api from './axios';

export const getParentsAPI = (params) => api.get('/parents', { params });
export const getParentByIdAPI = (id) => api.get(`/parents/${id}`);
export const getMyParentProfileAPI = () => api.get('/parents/me');
export const createParentAPI = (data) => api.post('/parents', data);
export const updateParentAPI = (id, data) => api.put(`/parents/${id}`, data);
export const deleteParentAPI = (id) => api.delete(`/parents/${id}`);

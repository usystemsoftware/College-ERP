import api from './axios';

export const getFacultyAPI = (params) => api.get('/faculty', { params });
export const getFacultyByIdAPI = (id) => api.get(`/faculty/${id}`);
export const createFacultyAPI = (data) => api.post('/faculty', data);
export const updateFacultyAPI = (id, data) => api.put(`/faculty/${id}`, data);
export const deleteFacultyAPI = (id) => api.delete(`/faculty/${id}`);
export const getMyFacultyProfileAPI = () => api.get('/faculty/me');

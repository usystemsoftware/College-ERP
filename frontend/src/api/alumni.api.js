import api from './client';

export const getAllAlumniAPI = (params) => api.get('/alumni', { params });
export const createOrUpdateAlumniAPI = (data) => api.post('/alumni', data);
export const getMyAlumniProfileAPI = () => api.get('/alumni/my');

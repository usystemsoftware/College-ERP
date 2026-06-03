import api from './axios';

export const getStudentsAPI = (params) => api.get('/students', { params });
export const getStudentByIdAPI = (id) => api.get(`/students/${id}`);
export const createStudentAPI = (data) => api.post('/students', data);
export const updateStudentAPI = (id, data) => api.put(`/students/${id}`, data);
export const deleteStudentAPI = (id) => api.delete(`/students/${id}`);
export const getMyProfileAPI = () => api.get('/students/me');

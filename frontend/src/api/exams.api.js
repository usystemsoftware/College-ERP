import api from './axios';

export const createExamAPI = (data) => api.post('/exams', data);
export const getExamsAPI = (params) => api.get('/exams', { params });
export const updateExamResultsAPI = (id, data) => api.put(`/exams/${id}/results`, data);
export const getStudentExamResultsAPI = (studentId) => api.get(`/exams/student/${studentId}`);

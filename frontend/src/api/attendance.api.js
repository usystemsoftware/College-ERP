import api from './axios';

export const markAttendanceAPI = (data) => api.post('/attendance/mark', data);
export const getAttendanceAPI = (params) => api.get('/attendance', { params });
export const getStudentAttendanceAPI = (studentId) => api.get(`/attendance/student/${studentId}`);

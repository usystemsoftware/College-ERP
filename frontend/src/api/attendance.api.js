import api from './axios';

export const markAttendanceAPI = (data) => api.post('/attendance/mark', data);
export const getAttendanceBySubjectDateAPI = (params) => api.get('/attendance/by-subject-date', { params });
export const getStudentAttendanceAPI = (params) => api.get('/attendance/my-summary', { params });
export const getAttendanceReportAPI = (params) => api.get('/attendance/report', { params });

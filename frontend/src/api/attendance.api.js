import api from './axios';

export const markAttendanceAPI = (data) => api.post('/attendance/mark', data);
export const getAttendanceBySubjectDateAPI = (params) => api.get('/attendance/by-subject-date', { params });
export const getStudentAttendanceAPI = (params) => api.get('/attendance/my-summary', { params });
export const getAttendanceReportAPI = (params) => api.get('/attendance/report', { params });

// Student self-attendance
export const studentCheckInAPI = (data) => api.post('/attendance/student-checkin', data);
export const studentCheckOutAPI = (data) => api.post('/attendance/student-checkout', data);
export const getStudentTodayAPI = () => api.get('/attendance/student-today');

// Admin live feed
export const getAdminLiveFeedAPI = () => api.get('/attendance/admin-live-feed');

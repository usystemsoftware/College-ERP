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

// QR Attendance
export const generateQRAPI = (data) => api.post('/attendance/qr/generate', data);
export const verifyQRTokenAPI = (data) => api.post('/attendance/qr/verify', data);
export const markQRAttendanceAPI = (data) => api.post('/attendance/qr/mark', data);
export const sendQRToFacultyAPI = (data) => api.post('/attendance/qr/send-to-faculty', data);
export const sendQRToStudentsAPI = (data) => api.post('/attendance/qr/send-to-students', data);

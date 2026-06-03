import api from './axios';

export const getStudentFeesAPI = (studentId) => api.get(`/fees/student/${studentId}`);
export const getAllFeesAPI = (params) => api.get('/fees', { params });
export const createFeeAPI = (data) => api.post('/fees', data);
export const bulkCreateFeesAPI = (data) => api.post('/fees/bulk', data);
export const recordPaymentAPI = (feeId, data) => api.post(`/fees/${feeId}/payment`, data);
export const getStudentPaymentsAPI = (studentId) => api.get(`/fees/payments/student/${studentId}`);
export const getFeeStatsAPI = () => api.get('/fees/stats/dashboard');

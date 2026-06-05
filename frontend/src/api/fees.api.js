import api from './axios';

export const getStudentFeesAPI = (studentId) => api.get(`/fee/student/${studentId}`);
export const getAllFeesAPI = (params) => api.get('/fee/all', { params });
export const createFeeAPI = (data) => api.post('/fee', data);
export const bulkCreateFeesAPI = (data) => api.post('/fee/bulk', data);
export const recordPaymentAPI = (feeId, data) => api.post(`/fee/${feeId}/pay`, data);
export const getStudentPaymentsAPI = (studentId) => api.get(`/fee/payments/student/${studentId}`);
export const getFeeStatsAPI = () => api.get('/fee/stats');

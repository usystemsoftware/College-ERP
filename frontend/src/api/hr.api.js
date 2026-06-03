import api from './axios';

// Leave Management
export const getLeavesAPI = (params) => api.get('/hr/leaves', { params });
export const applyLeaveAPI = (data) => api.post('/hr/leaves', data);
export const updateLeaveStatusAPI = (id, data) => api.put(`/hr/leaves/${id}/status`, data);

// Payroll Management
export const getPayrollAPI = (params) => api.get('/hr/payroll', { params });
export const generatePayrollAPI = (data) => api.post('/hr/payroll', data);

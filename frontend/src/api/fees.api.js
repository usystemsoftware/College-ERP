import api from './axios';

export const getStudentFeesAPI = (studentId) => api.get(`/fee/student/${studentId}`);
export const getAllFeesAPI = (params) => api.get('/fee/all', { params });
export const createFeeAPI = (data) => api.post('/fee', data);
export const bulkCreateFeesAPI = (data) => api.post('/fee/bulk', data);
export const recordPaymentAPI = (feeId, data) => api.post(`/fee/${feeId}/pay`, data);
export const getStudentPaymentsAPI = (studentId) => api.get(`/fee/payments/student/${studentId}`);
export const getFeeStatsAPI = () => api.get('/fee/stats');
export const getMyFeesAPI = () => api.get('/fee/my');
export const getParentFeesAPI = () => api.get('/fee/parent-fees');

// Fee Categories
export const getFeeCategoriesAPI = () => api.get('/fee/categories');
export const createFeeCategoryAPI = (data) => api.post('/fee/categories', data);
export const updateFeeCategoryAPI = (id, data) => api.put(`/fee/categories/${id}`, data);
export const deleteFeeCategoryAPI = (id) => api.delete(`/fee/categories/${id}`);

// Fee Structures
export const getFeeStructuresAPI = (params) => api.get('/fee/structures', { params });
export const createFeeStructureAPI = (data) => api.post('/fee/structures', data);
export const updateFeeStructureAPI = (id, data) => api.put(`/fee/structures/${id}`, data);
export const deleteFeeStructureAPI = (id) => api.delete(`/fee/structures/${id}`);

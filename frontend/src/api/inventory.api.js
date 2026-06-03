import api from './axios';

export const addAssetAPI = (data) => api.post('/inventory', data);
export const getAssetsAPI = (params) => api.get('/inventory', { params });
export const updateAssetAPI = (id, data) => api.put(`/inventory/${id}`, data);

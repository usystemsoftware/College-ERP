import api from './client';

export const grantConsentAPI = (data) => api.post('/consent/grant', data);
export const revokeConsentAPI = (data) => api.post('/consent/revoke', data);
export const getConsentStatusAPI = () => api.get('/consent/status');

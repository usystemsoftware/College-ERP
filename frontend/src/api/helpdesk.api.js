import api from './client';

export const getMyTicketsAPI = () => api.get('/helpdesk/my');
export const getAllTicketsAPI = (params) => api.get('/helpdesk/all', { params });
export const createTicketAPI = (data) => api.post('/helpdesk', data);
export const updateTicketStatusAPI = (id, data) => api.put(`/helpdesk/${id}`, data);

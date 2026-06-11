import { get, post, patch } from './client';

export const submitIncidentAPI = (data) => post('/incidents', data);
export const getIncidentsAPI = (params) => get('/incidents', { params });
export const getIncidentByIdAPI = (id) => get(`/incidents/${id}`);
export const updateIncidentAPI = (id, data) => patch(`/incidents/${id}`, data);

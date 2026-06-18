import { get, post, patch } from './client';

export const getCompaniesAPI = () => get('/placements/companies');
export const createCompanyAPI = (data) => post('/placements/companies', data);
export const getPlacementsAPI = (params) => get('/placements', { params });
export const getPlacementAPI = (id) => get(`/placements/${id}`);
export const createPlacementAPI = (data) => post('/placements', data);
export const applyForPlacementAPI = (id) => post(`/placements/${id}/apply`);
export const updateApplicationStatusAPI = (id, data) => patch(`/placements/${id}/status`, data);

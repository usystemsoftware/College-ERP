import { get, post, patch } from './client';

export const getGatePassesAPI = (params) => get('/gatepasses', { params });
export const createGatePassAPI = (data) => post('/gatepasses', data);
export const approveGatePassAPI = (id, action, remarks) => patch(`/gatepasses/${id}/approve`, { action, remarks });
export const checkInGatePassAPI = (id) => patch(`/gatepasses/${id}/checkin`);
export const checkOutGatePassAPI = (id) => patch(`/gatepasses/${id}/checkout`);

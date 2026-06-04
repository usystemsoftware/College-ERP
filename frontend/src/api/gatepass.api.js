import { get, post, patch } from './client';

export const getGatePassesAPI = (params) => get('/gatepasses', { params });
export const createGatePassAPI = (data) => post('/gatepasses', data);
export const approveGatePassAPI = (id, action) => patch(`/gatepasses/${id}/approve`, { action });
export const checkInGatePassAPI = (id) => patch(`/gatepasses/${id}/checkin`);
export const checkOutGatePassAPI = (id) => patch(`/gatepasses/${id}/checkout`);

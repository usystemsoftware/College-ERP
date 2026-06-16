import { get, post, patch, put } from './client';

export const getLeaveRequestsAPI = (params) => get('/leave', { params });
export const createLeaveRequestAPI = (data) => post('/leave', data);
export const processLeaveRequestAPI = (id, data) => patch(`/leave/${id}/process`, data);
export const cancelLeaveRequestAPI = (id) => patch(`/leave/${id}/cancel`);
export const updateLeaveRequestAPI = (id, data) => put(`/leave/${id}`, data);

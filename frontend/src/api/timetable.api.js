import api from './axios';

export const getTimetableAPI = (params) => api.get('/timetables', { params });
export const createTimetableSlotAPI = (data) => api.post('/timetables', data);
export const updateTimetableSlotAPI = (id, data) => api.put(`/timetables/${id}`, data);
export const deleteTimetableSlotAPI = (id) => api.delete(`/timetables/${id}`);

import api from './axios';

export const createAssignmentAPI = (data) => api.post('/assignments', data);
export const getAssignmentsAPI = (params) => api.get('/assignments', { params });
export const submitAssignmentAPI = (id, data) => api.post(`/assignments/${id}/submit`, data);
export const gradeAssignmentAPI = (assignmentId, submissionId, data) => api.post(`/assignments/${assignmentId}/grade/${submissionId}`, data);

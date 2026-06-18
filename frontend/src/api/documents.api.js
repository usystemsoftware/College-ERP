import api from './client';

export const uploadDocumentAPI = (formData) => api.post('/documents/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
export const getMyDocumentsAPI = () => api.get('/documents/my');
export const getStudentDocumentsAPI = (studentId) => api.get(`/documents/student/${studentId}`);
export const updateDocumentStatusAPI = (id, data) => api.put(`/documents/${id}/status`, data);

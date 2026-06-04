import client from '../../api/client';

// Upload material
const uploadMaterial = async (formData) => {
  const response = await client.post('/materials/upload', formData);
  return response.data;
};

// Get all materials
const getMaterials = async (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null && v !== '')
  );
  const query = new URLSearchParams(cleanParams).toString();
  const response = await client.get(`/materials?${query}`);
  return response.data;
};

// Increment download count
const incrementDownload = async (id) => {
  const response = await client.put(`/materials/${id}/download`, {});
  return response.data;
};

// Delete material
const deleteMaterial = async (id) => {
  const response = await client.delete(`/materials/${id}`);
  return response.data;
};

const materialService = {
  uploadMaterial,
  getMaterials,
  incrementDownload,
  deleteMaterial
};

export default materialService;

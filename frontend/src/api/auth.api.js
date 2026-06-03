import client from './client';

export const loginAPI = async (credentials) => {
  const response = await client.post('/auth/login', credentials);
  return response.data;
};

export const registerAPI = async (data) => {
  const response = await client.post('/auth/register', data);
  return response.data;
};

export const logoutAPI = async () => {
  const response = await client.post('/auth/logout');
  return response.data;
};

export const sendOtpAPI = async (email) => {
  const response = await client.post('/auth/send-otp', { email });
  return response.data;
};

export const verifyOtpAPI = async (email, otp) => {
  const response = await client.post('/auth/verify-otp', { email, otp });
  return response.data;
};

export const forgotPasswordAPI = async (email) => {
  const response = await client.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPasswordAPI = async (data) => {
  const response = await client.post('/auth/reset-password', data);
  return response.data;
};

export const fetchMeAPI = async () => {
  const response = await client.get('/auth/me');
  return response.data;
};

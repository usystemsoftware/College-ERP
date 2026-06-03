import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5050/api',
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach Access Token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Refresh Token rotation on 401
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Request token refresh
        const res = await axios.post(
          `${client.defaults.baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (res.data?.success) {
          const newAccessToken = res.data.data.accessToken;
          localStorage.setItem('accessToken', newAccessToken);

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return client(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token is dead - clear credentials and redirect to login
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default client;

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.MODE === 'development'
    ? 'http://localhost:5000/api'
    : '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
    //   import('../store/authStore.js').then(({ useAuthStore }) => {
    //     useAuthStore.getState().logout();
    //   });
    //   window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
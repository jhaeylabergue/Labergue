import axios from 'axios';

export const ACCESS_TOKEN_KEY = 'lavalust_access_token';
export const REFRESH_TOKEN_KEY = 'lavalust_refresh_token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error) {
  const data = error.response?.data;
  if (data?.errors && typeof data.errors === 'object') {
    return Object.values(data.errors).join(' ');
  }
  return data?.error || error.message || 'Something went wrong. Please try again.';
}
import axios from 'axios';

import { auth } from './auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.error?.message ||
      error?.response?.data?.error ||
      error.message ||
      'Request failed.';

    return Promise.reject(new Error(message));
  },
);

export function extractData(response) {
  return response?.data?.data ?? {};
}

export default api;

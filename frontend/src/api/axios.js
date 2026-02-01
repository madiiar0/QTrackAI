import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:1234';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  withCredentials: true,
  timeout: 10000,
});

export default api;

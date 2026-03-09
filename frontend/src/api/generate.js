import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:1234';

const generateApi = axios.create({
  baseURL: `${API_BASE_URL}/api/generate`,
  withCredentials: true,
  timeout: 15000,
});

export default generateApi;


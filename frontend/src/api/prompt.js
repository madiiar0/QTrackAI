import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:1234';

const promptApi = axios.create({
  baseURL: `${API_BASE_URL}/api/prompt`,
  withCredentials: true,
  timeout: 10000,
});

export default promptApi;

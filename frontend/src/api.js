import axios from 'axios';

const API_URL = 'http://localhost:5000';  // Điều chỉnh URL backend tùy theo cài đặt của bạn

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor cho authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    if (response.data && response.data.tokens) {
      localStorage.setItem('access_token', response.data.tokens.access_token);
      localStorage.setItem('refresh_token', response.data.tokens.refresh_token);
      return response.data;
    }
    throw new Error('Invalid response from server');
  } catch (error) {
    throw error.response?.data || { error: 'Login failed. Please try again.' };
  }
};

export const register = async (username, email, password) => {
  try {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const logout = async () => {
  try {
    await api.get('/auth/logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  } catch (error) {
    console.error('Lỗi khi đăng xuất:', error);
    throw error;
  }
};

export default api;
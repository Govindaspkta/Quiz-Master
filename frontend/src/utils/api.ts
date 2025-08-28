import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

// Get your actual WiFi IP - check with ipconfig
const getBaseURL = () => {
  if (Capacitor.isNativePlatform()) {
    return 'http://192.168.1.74:5000'; // Your WiFi IP
  }
  return 'http://localhost:5000';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Storage helpers
const getToken = async (): Promise<string | null> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const { value } = await Preferences.get({ key: 'token' });
      return value;
    }
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

const setToken = async (token: string): Promise<void> => {
  try {
    if (Capacitor.isNativePlatform()) {
      await Preferences.set({ key: 'token', value: token });
    } else {
      localStorage.setItem('token', token);
    }
  } catch (error) {
    console.error('Error setting token:', error);
  }
};

const removeToken = async (): Promise<void> => {
  try {
    if (Capacitor.isNativePlatform()) {
      await Preferences.remove({ key: 'token' });
      await Preferences.remove({ key: 'role' });
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    }
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      console.log('🚀 API Request:', {
        platform: Capacitor.getPlatform(),
        url: `${config.baseURL || ''}${config.url || ''}`,
        hasToken: !!token
      });
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Request interceptor error:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Success:', response.status);
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    if (error.response?.status === 401 || error.response?.status === 422) {
      await removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
export { getToken, setToken, removeToken };
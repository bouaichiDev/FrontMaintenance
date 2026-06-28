import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

// Retrieve API Base URL from env or default to empty string for relative proxying
export const API_BASE_URL = typeof (import.meta as any).env?.VITE_API_BASE_URL === 'string' 
  ? (import.meta as any).env?.VITE_API_BASE_URL 
  : '';

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token
axiosClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 and parse standardized backend errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Auto-logout on 401 Unauthorized
    if (response && response.status === 401) {
      useAuthStore.getState().clearAuth();
      // Only redirect if not already on login/register pages
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        window.location.href = '/login';
      }
    }

    // Standardize error message extraction from Spring Boot uniform ApiError body
    const apiError = response?.data;
    const errorMessage = apiError?.message || error.message || 'Une erreur est survenue';
    
    // Attach details for react-query error handling
    error.errorMessage = errorMessage;
    error.fieldErrors = apiError?.fieldErrors || null;
    error.status = response?.status || 500;
    
    return Promise.reject(error);
  }
);

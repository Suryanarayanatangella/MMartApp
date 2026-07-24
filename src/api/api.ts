import axios, {AxiosInstance, InternalAxiosRequestConfig} from 'axios';
import type { Store } from '@reduxjs/toolkit';

const defaultBaseURL:string = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL as string || window.location.origin;

const api:AxiosInstance = axios.create({
  baseURL: defaultBaseURL,
  timeout: 30000, // 30s — Gemini calls can take longer than 10s
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — read token fresh from Redux store on every request
// We export a setter so the store can inject itself after creation
type RootStore = Store<{auth:{token: string | null}}>
let _store:RootStore | null = null;
export const injectStore = (store:RootStore):void => { _store = store; };

api.interceptors.request.use(
  (config:InternalAxiosRequestConfig) => {
    // Read from Redux store first, fall back to localStorage
    // Using || ensures both are checked even if _store exists but token is null
    const token = _store?.getState().auth.token || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — normalize error messages only
// Do NOT auto-redirect here — let components handle navigation

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status as number | undefined;

    // Auto-clear stale token and redirect to login on 401
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (_store) {
        _store.dispatch({ type: 'auth/forceLogout' });
      }
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    const message: string =
      error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  })

export default api;

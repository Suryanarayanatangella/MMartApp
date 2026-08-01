import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import type { Store } from '@reduxjs/toolkit';

const defaultBaseURL: string = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_BASE_URL as string) || window.location.origin;

// ── Axios instance ────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL:         defaultBaseURL,
  timeout:         30000,
  withCredentials: true,  // ← send HTTP-only cookies on every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Store injection ───────────────────────────────────────────────────────

type RootStore = Store<{ auth: { token: string | null } }>;
let _store: RootStore | null = null;

export const injectStore = (store: RootStore): void => {
  _store = store;
};

// ── Request interceptor ───────────────────────────────────────────────────
// Attach the access token from Redux state to every request

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = _store?.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Refresh token state ───────────────────────────────────────────────────
// Prevents multiple parallel refresh calls when many requests fail simultaneously

let isRefreshing     = false;
let refreshQueue: Array<(token: string) => void> = [];

const processQueue = (newToken: string): void => {
  refreshQueue.forEach((resolve) => resolve(newToken));
  refreshQueue = [];
};

// ── Response interceptor ──────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response.data,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status          = error.response?.status;

    // ── 401 handling: try to refresh the token ──────────────────────────
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;  // prevent infinite retry loop

      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        // Call refresh endpoint — cookie is sent automatically by browser
        const refreshResponse = await axios.post<{ token: string; user: unknown }>(
          `${defaultBaseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshResponse.data.token;

        // Update Redux state with new access token
        if (_store) {
          _store.dispatch({ type: 'auth/setToken', payload: newToken });
          if (refreshResponse.data.user) {
            _store.dispatch({ type: 'auth/setUser', payload: refreshResponse.data.user });
          }
        }

        // Process queued requests with new token
        processQueue(newToken);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);

      } catch {
        // Refresh failed — clear everything and redirect to login
        refreshQueue = [];
        localStorage.removeItem('user');

        if (_store) {
          _store.dispatch({ type: 'auth/forceLogout' });
        }

        // Also tell backend to clear the cookie
        axios.post(`${defaultBaseURL}/auth/logout`, {}, { withCredentials: true }).catch(() => {});

        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }

        return Promise.reject(new Error('Session expired. Please log in again.'));

      } finally {
        isRefreshing = false;
      }
    }

    // ── All other errors ────────────────────────────────────────────────
    const message: string =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      'Something went wrong';

    return Promise.reject(new Error(message));
  }
);

export default api;

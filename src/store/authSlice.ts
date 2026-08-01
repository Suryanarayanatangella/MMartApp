import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { AuthState, User, AuthResponse } from '../index';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// ── Async Thunks ──────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk<
  AuthResponse,
  { email: string; password: string },
  { rejectValue: string }
>(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await axios.post<AuthResponse>(
        `${API_BASE}/auth/login`,
        { email, password },
        { withCredentials: true }  // ← allows browser to receive the HTTP-only cookie
      );
      // Only store user info in localStorage (for page refresh persistence)
      // Access token goes to Redux state ONLY — never localStorage
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return res.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || 'Login failed');
      }
      return rejectWithValue('Login failed');
    }
  }
);

export const registerUser = createAsyncThunk<
  AuthResponse,
  { firstName: string; lastName: string; email: string; password: string; phone?: string },
  { rejectValue: string }
>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const res = await axios.post<AuthResponse>(
        `${API_BASE}/auth/register`,
        userData,
        { withCredentials: true }  // ← allows browser to receive the HTTP-only cookie
      );
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return res.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || 'Register failed');
      }
      return rejectWithValue('Register failed');
    }
  }
);
// Called once on app startup to restore session from refresh token cookie
export const restoreSession = createAsyncThunk<
  AuthResponse,
  void,
  { rejectValue: string }
>(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.post<AuthResponse>(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/auth/refresh-token`,
        {},
        { withCredentials: true }
      );
      return res.data;
    } catch {
      return rejectWithValue('No active session');
    }
  }
);


// ── Initial State ─────────────────────────────────────────────────────────
// token starts as null — it will be restored by the refresh-token call on app load
// user is restored from localStorage so the UI shows the correct name on refresh

const storedUser = localStorage.getItem('user');

const initialState: AuthState = {
  user:    storedUser ? (JSON.parse(storedUser) as User) : null,
  token:   null,   // ← no token in localStorage anymore
  loading: false,
  error:   null,
};

// ── Slice ─────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user  = null;
      state.token = null;
      localStorage.removeItem('user');
      // Cookie is cleared by POST /auth/logout — called separately via api.ts
    },
    forceLogout: (state) => {
      state.user  = null;
      state.token = null;
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
    // Called by api.ts after a successful token refresh
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    // Called by api.ts after refresh also returns updated user
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.user    = action.payload.user;
        state.token   = action.payload.token;  // access token in Redux only
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload ?? 'Login failed';
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.user    = action.payload.user;
        state.token   = action.payload.token;  // access token in Redux only
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload ?? 'Register failed';
      })
      // restoreSession — silent, no loading spinner needed
      .addCase(restoreSession.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.user  = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(restoreSession.rejected, (state) => {
        // No cookie or expired — clear user info too
        state.user  = null;
        state.token = null;
        localStorage.removeItem('user');
      })
  },
});

export const { logout, forceLogout, clearError, setToken, setUser } = authSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────
import type { RootState } from './store';

export const selectCurrentUser  = (state: RootState): User | null    => state.auth.user;
export const selectAuthToken    = (state: RootState): string | null  => state.auth.token;
export const selectAuthLoading  = (state: RootState): boolean        => state.auth.loading;
export const selectAuthError    = (state: RootState): string | null  => state.auth.error;
export const selectIsLoggedIn   = (state: RootState): boolean        => !!state.auth.token;

export default authSlice.reducer;

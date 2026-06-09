import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginAPI, fetchMeAPI, logoutAPI } from '../../api/auth.api';

// Normalize user so role is always a plain string (e.g. 'Super Admin') not a populated object
const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    role: typeof user.role === 'object' ? user.role?.name : user.role
  };
};

// Async Thunks
export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const data = await loginAPI(credentials);
    localStorage.setItem('accessToken', data.data.accessToken);
    return normalizeUser(data.data.user);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const loadCurrentUser = createAsyncThunk('auth/loadCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    const data = await fetchMeAPI();
    return normalizeUser(data.data.user);
  } catch (error) {
    localStorage.removeItem('accessToken');
    return rejectWithValue(error.response?.data?.message || 'Session expired');
  }
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    await logoutAPI();
  } catch (error) {
    // proceed anyway to clear client storage
  }
  localStorage.removeItem('accessToken');
  return null;
});

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  onCampus: false,
  campusLocation: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateCampusStatus: (state, action) => {
      if (state.user) {
        state.user.onCampus = action.payload.onCampus;
        state.user.campusLocation = action.payload.location;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Login User
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Load Current User
      .addCase(loadCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.loading = false;
      })
      .addCase(loadCurrentUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      // Logout User
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      });
  }
});

export const { clearError, updateCampusStatus } = authSlice.actions;
export default authSlice.reducer;

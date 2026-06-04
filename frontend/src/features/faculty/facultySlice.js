import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getFacultyAPI, createFacultyAPI, updateFacultyAPI, deleteFacultyAPI } from '../../api/faculty.api';

export const fetchFaculty = createAsyncThunk('faculty/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await getFacultyAPI(params);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch faculty');
  }
});

export const createFaculty = createAsyncThunk('faculty/create', async (data, { rejectWithValue }) => {
  try {
    const response = await createFacultyAPI(data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create faculty');
  }
});

export const updateFaculty = createAsyncThunk('faculty/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await updateFacultyAPI(id, data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update faculty');
  }
});

export const deleteFaculty = createAsyncThunk('faculty/delete', async (id, { rejectWithValue }) => {
  try {
    await deleteFacultyAPI(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete faculty');
  }
});

const facultySlice = createSlice({
  name: 'faculty',
  initialState: {
    list: [],
    pagination: { total: 0, page: 1, limit: 20, pages: 1 },
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFaculty.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchFaculty.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.faculty;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchFaculty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createFaculty.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(updateFaculty.fulfilled, (state, action) => {
        const index = state.list.findIndex(f => f._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(deleteFaculty.fulfilled, (state, action) => {
        state.list = state.list.filter(f => f._id !== action.payload);
        state.pagination.total -= 1;
      });
  }
});

export default facultySlice.reducer;

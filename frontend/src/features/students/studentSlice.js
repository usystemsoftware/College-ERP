import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getStudentsAPI, createStudentAPI, updateStudentAPI, deleteStudentAPI } from '../../api/students.api';

export const fetchStudents = createAsyncThunk('students/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await getStudentsAPI(params);
    return response.data.data; // { students, pagination }
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch students');
  }
});

export const createStudent = createAsyncThunk('students/create', async (data, { rejectWithValue }) => {
  try {
    const response = await createStudentAPI(data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create student');
  }
});

export const updateStudent = createAsyncThunk('students/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await updateStudentAPI(id, data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update student');
  }
});

export const deleteStudent = createAsyncThunk('students/delete', async (id, { rejectWithValue }) => {
  try {
    await deleteStudentAPI(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete student');
  }
});

const studentSlice = createSlice({
  name: 'students',
  initialState: {
    list: [],
    pagination: { total: 0, page: 1, limit: 20, pages: 1 },
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.students;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createStudent.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        const index = state.list.findIndex(s => s._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.list = state.list.filter(s => s._id !== action.payload);
        state.pagination.total -= 1;
      });
  }
});

export default studentSlice.reducer;

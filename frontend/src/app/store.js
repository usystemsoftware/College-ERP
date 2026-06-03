import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import studentReducer from '../features/students/studentSlice';
import facultyReducer from '../features/faculty/facultySlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentReducer,
    faculty: facultyReducer
  }
});

export default store;

import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import AdminDashboard from '../pages/admin/AdminDashboard';
import StudentsPage from '../pages/admin/StudentsPage';
import FacultyPage from '../pages/admin/FacultyPage';
import AttendancePage from '../pages/admin/AttendancePage';
import FeesPage from '../pages/admin/FeesPage';
import TimetablePage from '../pages/shared/TimetablePage';
import LMSPage from '../pages/shared/LMSPage';
import NotificationsPage from '../pages/shared/NotificationsPage';
import Profile from '../pages/shared/Profile';
import StudentDashboard from '../pages/student/StudentDashboard';
import FacultyDashboard from '../pages/faculty/FacultyDashboard';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import { loadCurrentUser } from '../features/auth/authSlice';

const Unauthorized = () => (
  <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50 text-slate-800 dark:bg-dark-950 dark:text-slate-100">
    <h1 className="text-4xl font-extrabold text-red-500">403 - Access Denied</h1>
    <p className="mt-2 text-slate-500">You do not have permission to view this resource.</p>
    <a href="/" className="mt-6 rounded-md bg-brand-500 px-4 py-2 text-white hover:bg-brand-600">
      Back to Dashboard
    </a>
  </div>
);

const AppRoutes = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      dispatch(loadCurrentUser());
    }
  }, [dispatch]);

  const getHomeRedirect = () => {
    if (!user) return <Navigate to="/login" replace />;

    // Check if user.role is an object (populated) or string
    const roleName = typeof user.role === 'object' ? user.role?.name : user.role;

    switch (roleName) {
      case 'Super Admin':
      case 'College Admin':
      case 'Principal':
        return <Navigate to="/admin/dashboard" replace />;
      case 'Faculty':
      case 'HOD':
        return <Navigate to="/faculty/dashboard" replace />;
      case 'Student':
        return <Navigate to="/student/dashboard" replace />;
      default:
        return <Navigate to="/admin/dashboard" replace />;
    }
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={getHomeRedirect()} />
        <Route
          path="admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Principal']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="faculty/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Faculty', 'HOD']}>
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="students"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Principal', 'HOD', 'Admission Officer', 'Faculty']}>
              <StudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="faculty"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty']}>
              <FacultyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="attendance"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty', 'Class Coordinator']}>
              <AttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="fees"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Principal', 'Accountant']}>
              <FeesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="timetable"
          element={
            <ProtectedRoute>
              <TimetablePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="library"
          element={
            <ProtectedRoute>
              <LMSPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

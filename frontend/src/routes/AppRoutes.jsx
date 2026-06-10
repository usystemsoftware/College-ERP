import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import AdminDashboard from '../pages/admin/AdminDashboard';
import StudentsPage from '../pages/student/StudentDirectory';
import FacultyPage from '../pages/admin/FacultyPage';
import AttendancePage from '../pages/admin/AttendancePage';
import FeesPage from '../pages/admin/FeesPage';
import TimetablePage from '../pages/shared/TimetablePage';
import LMSPage from '../pages/shared/LMSPage';
import NotificationsPage from '../pages/shared/NotificationsPage';
import Profile from '../pages/shared/Profile';
import GatePassPage from '../pages/admin/GatePassPage';
import StudentGatePassPage from '../pages/student/StudentGatePassPage';
import HodGatePassPage from '../pages/faculty/HodGatePassPage';
import DepartmentsPage from '../pages/admin/DepartmentsPage';
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentAttendancePage from '../pages/student/StudentAttendancePage';
import StudentFeesPage from '../pages/student/StudentFeesPage';
import FacultyDashboard from '../pages/faculty/FacultyDashboard';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import { loadCurrentUser } from '../features/auth/authSlice';
import AdmissionReview from '../pages/admission/AdmissionReview';
import AdmissionPortal from '../pages/admission/AdmissionPortal';
import ParentDashboard from '../pages/parent/ParentDashboard';
import SubjectsPage from '../pages/academic/SubjectsPage';
import InventoryDashboard from '../pages/inventory/InventoryDashboard';
import FacultyLectureAttendance from '../pages/hr/FacultyLectureAttendance';
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

  function getHomeRedirect() {
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
      case 'Parent':
        return <Navigate to="/parent/dashboard" replace />;
      default:
        return <Navigate to="/admin/dashboard" replace />;
    }
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/apply" element={<AdmissionPortal />} />
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
          path="admissions"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Principal', 'Admission Officer']}>
              <AdmissionReview />
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
          path="faculty/gatepass"
          element={
            <ProtectedRoute allowedRoles={['HOD']}>
              <HodGatePassPage />
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
          path="parent/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Parent']}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/attendance"
          element={
            <ProtectedRoute allowedRoles={['Student']}>
              <StudentAttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/fees"
          element={
            <ProtectedRoute allowedRoles={['Student']}>
              <StudentFeesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/gatepass"
          element={
            <ProtectedRoute allowedRoles={['Student']}>
              <StudentGatePassPage />
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
          path="departments"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Principal']}>
              <DepartmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="subjects"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty']}>
              <SubjectsPage />
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
          path="faculty-attendance"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty']}>
              <FacultyLectureAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="gatepass"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Principal', 'Security Officer']}>
              <GatePassPage />
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
          path="inventory"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Inventory Manager']}>
              <InventoryDashboard />
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

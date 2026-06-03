import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import AdminDashboard from '../pages/admin/AdminDashboard';
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentDirectory from '../pages/student/StudentDirectory';
import FacultyDirectory from '../pages/faculty/FacultyDirectory';
import AcademicStructure from '../pages/academic/AcademicStructure';
import AdmissionPortal from '../pages/admission/AdmissionPortal';
import AdmissionReview from '../pages/admission/AdmissionReview';
import TimetableDashboard from '../pages/timetable/TimetableDashboard';
import AttendanceDashboard from '../pages/attendance/AttendanceDashboard';
import AssignmentDashboard from '../pages/assignments/AssignmentDashboard';
import ExamDashboard from '../pages/exams/ExamDashboard';
import FeeDashboard from '../pages/fees/FeeDashboard';
import LibraryDashboard from '../pages/library/LibraryDashboard';
import HostelDashboard from '../pages/hostel/HostelDashboard';
import TransportDashboard from '../pages/transport/TransportDashboard';
import HRDashboard from '../pages/hr/HRDashboard';
import InventoryDashboard from '../pages/inventory/InventoryDashboard';
import LMSDashboard from '../pages/lms/LMSDashboard';
import GatepassDashboard from '../pages/gatepass/GatepassDashboard';
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
      case 'Student':
        return <Navigate to="/student/dashboard" replace />;
      default:
        // Default fallback
        return <Navigate to="/student/dashboard" replace />;
    }
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route path="/apply" element={<AdmissionPortal />} />

      {/* Protected Layout Routes */}
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
          path="admission/review"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Admission Officer']}>
              <AdmissionReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="students/directory"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Principal', 'HOD', 'Admission Officer']}>
              <StudentDirectory />
            </ProtectedRoute>
          }
        />
        <Route
          path="faculty/directory"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Principal', 'HOD']}>
              <FacultyDirectory />
            </ProtectedRoute>
          }
        />
        <Route
          path="timetable"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Principal', 'HOD', 'Student', 'Faculty']}>
              <TimetableDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="attendance"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Principal', 'HOD', 'Student', 'Faculty']}>
              <AttendanceDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="assignments"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Principal', 'HOD', 'Student', 'Faculty']}>
              <AssignmentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="exams"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Principal', 'HOD', 'Student', 'Faculty', 'Admission Officer']}>
              <ExamDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="fees"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Accountant', 'Student', 'Principal']}>
              <FeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="library"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Librarian', 'Student', 'Faculty']}>
              <LibraryDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="hostel"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Hostel Warden', 'Student']}>
              <HostelDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="gatepass"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Hostel Warden', 'Student', 'Principal', 'Security']}>
              <GatepassDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="transport"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Transport Manager', 'Student']}>
              <TransportDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="hr"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'HR Manager', 'Principal', 'HOD', 'Faculty']}>
              <HRDashboard />
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
          path="lms"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty', 'Student']}>
              <LMSDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="academics"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Principal']}>
              <AcademicStructure />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Student', 'Super Admin']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

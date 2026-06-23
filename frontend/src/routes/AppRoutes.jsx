import React, { useEffect, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
const Login = React.lazy(() => import('../pages/auth/Login'));
const Register = React.lazy(() => import('../pages/auth/Register'));
const AdminDashboard = React.lazy(() => import('../pages/admin/AdminDashboard'));
const StudentsPage = React.lazy(() => import('../pages/student/StudentDirectory'));
const FacultyPage = React.lazy(() => import('../pages/admin/FacultyPage'));
const AttendancePage = React.lazy(() => import('../pages/admin/AttendancePage'));
const AttendanceAnalytics = React.lazy(() => import('../pages/admin/AttendanceAnalytics'));
const FeesPage = React.lazy(() => import('../pages/admin/FeesPage'));
const TimetablePage = React.lazy(() => import('../pages/shared/TimetablePage'));
const LMSPage = React.lazy(() => import('../pages/shared/LMSPage'));
const NotificationsPage = React.lazy(() => import('../pages/shared/NotificationsPage'));
const Profile = React.lazy(() => import('../pages/shared/Profile'));
const GatePassPage = React.lazy(() => import('../pages/admin/GatePassPage'));
const StudentGatePassPage = React.lazy(() => import('../pages/student/StudentGatePassPage'));
const HodGatePassPage = React.lazy(() => import('../pages/faculty/HodGatePassPage'));
const DepartmentsPage = React.lazy(() => import('../pages/admin/DepartmentsPage'));
const StudentDashboard = React.lazy(() => import('../pages/student/StudentDashboard'));
const StudentAttendancePage = React.lazy(() => import('../pages/student/StudentAttendancePage'));
const StudentFeesPage = React.lazy(() => import('../pages/student/StudentFeesPage'));
const FacultyDashboard = React.lazy(() => import('../pages/faculty/FacultyDashboard'));
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import { loadCurrentUser } from '../features/auth/authSlice';
const AdmissionReview = React.lazy(() => import('../pages/admission/AdmissionReview'));
const AdmissionPortal = React.lazy(() => import('../pages/admission/AdmissionPortal'));
const ParentDashboard = React.lazy(() => import('../pages/parent/ParentDashboard'));
const ParentAttendancePage = React.lazy(() => import('../pages/parent/ParentAttendancePage'));
const ParentFeesPage = React.lazy(() => import('../pages/parent/ParentFeesPage'));
const SubjectsPage = React.lazy(() => import('../pages/academic/SubjectsPage'));
const InventoryDashboard = React.lazy(() => import('../pages/inventory/InventoryDashboard'));
const FacultyLectureAttendance = React.lazy(() => import('../pages/hr/FacultyLectureAttendance'));
const IncidentReportPage = React.lazy(() => import('../pages/incidents/IncidentReportPage'));
const IncidentDashboard = React.lazy(() => import('../pages/incidents/IncidentDashboard'));
const QRAttendancePage = React.lazy(() => import('../pages/attendance/QRAttendancePage'));
const LeaveApplicationPage = React.lazy(() => import('../pages/leave/LeaveApplicationPage'));
const LeaveDashboard = React.lazy(() => import('../pages/leave/LeaveDashboard'));

// Exams
const ExamDashboard = React.lazy(() => import('../pages/exams/ExamDashboard'));
const StudentResultsPage = React.lazy(() => import('../pages/exams/StudentResultsPage'));
const HRDashboard = React.lazy(() => import('../pages/hr/HRDashboard'));
const HostelDashboard = React.lazy(() => import('../pages/hostel/HostelDashboard'));
const AssignmentDashboard = React.lazy(() => import('../pages/assignments/AssignmentDashboard'));

// Payments Mock
const MockStripeCheckout = React.lazy(() => import('../pages/student/MockStripeCheckout'));

// Alumni
const AlumniDirectory = React.lazy(() => import('../pages/shared/AlumniDirectory'));

// Helpdesk
const HelpdeskDashboard = React.lazy(() => import('../pages/helpdesk/HelpdeskDashboard'));

// Documents
const DigitalLocker = React.lazy(() => import('../pages/student/DigitalLocker'));

// Canteen
const CanteenDashboard = React.lazy(() => import('../pages/shared/CanteenDashboard'));

// Transport
const TransportDashboard = React.lazy(() => import('../pages/transport/TransportDashboard'));
const BusTrackingPage = React.lazy(() => import('../pages/transport/BusTrackingPage'));

// Parents
const ParentConsentPage = React.lazy(() => import('../pages/parent/ParentConsentPage'));
const ParentTrackingPage = React.lazy(() => import('../pages/parent/ParentTrackingPage'));

// Checkpoints
const CheckpointPage = React.lazy(() => import('../pages/attendance/CheckpointPage'));

// Placements
const PlacementDashboard = React.lazy(() => import('../pages/placements/PlacementDashboard'));
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
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"></div></div>}>
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/apply" element={<AdmissionPortal />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/mock-checkout" element={<MockStripeCheckout />} />

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
          path="parent/attendance"
          element={
            <ProtectedRoute allowedRoles={['Parent']}>
              <ParentAttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="parent/fees"
          element={
            <ProtectedRoute allowedRoles={['Parent']}>
              <ParentFeesPage />
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
        <Route path="/student/results" element={<ProtectedRoute allowedRoles={['Student']}><StudentResultsPage /></ProtectedRoute>} />
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
          path="attendance-analytics"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Principal', 'HOD']}>
              <AttendanceAnalytics />
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
          path="transport"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Transport Manager']}>
              <TransportDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/bus-tracking" element={<ProtectedRoute><BusTrackingPage /></ProtectedRoute>} />
        <Route path="hr" element={<ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'HR Manager', 'Faculty']}><HRDashboard /></ProtectedRoute>} />
        <Route path="hostel" element={<ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Hostel Warden', 'Student']}><HostelDashboard /></ProtectedRoute>} />
        <Route path="exams" element={<ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Principal', 'Faculty']}><ExamDashboard /></ProtectedRoute>} />
        <Route path="assignments" element={<ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Faculty', 'Student']}><AssignmentDashboard /></ProtectedRoute>} />
        <Route path="/parent/consent" element={<ProtectedRoute allowedRoles={['Parent']}><ParentConsentPage /></ProtectedRoute>} />
        <Route path="/parent/tracking" element={<ProtectedRoute allowedRoles={['Parent']}><ParentTrackingPage /></ProtectedRoute>} />
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
        <Route
          path="report-incident"
          element={
            <ProtectedRoute>
              <IncidentReportPage />
            </ProtectedRoute>
          }
        />
        <Route path="/incidents/report" element={<ProtectedRoute><IncidentReportPage /></ProtectedRoute>} />
        <Route path="/checkpoints" element={<ProtectedRoute><CheckpointPage /></ProtectedRoute>} />
        <Route
          path="incidents"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Principal', 'HOD', 'Security Officer']}>
              <IncidentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="qr-attendance"
          element={
            <ProtectedRoute>
              <QRAttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="leave-application"
          element={
            <ProtectedRoute>
              <LeaveApplicationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="leave-approvals"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Principal', 'HOD', 'Vice Principal']}>
              <LeaveDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="placements"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'College Admin', 'Placement Officer', 'Student']}>
              <PlacementDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="alumni"
          element={
            <ProtectedRoute>
              <AlumniDirectory />
            </ProtectedRoute>
          }
        />
        <Route
          path="helpdesk"
          element={
            <ProtectedRoute>
              <HelpdeskDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="digital-locker"
          element={
            <ProtectedRoute>
              <DigitalLocker />
            </ProtectedRoute>
          }
        />
        <Route
          path="canteen"
          element={
            <ProtectedRoute>
              <CanteenDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
      </Suspense>
  );
};

export default AppRoutes;

import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../features/auth/authSlice';
import { toggleTheme, setSidebarOpen } from '../../features/ui/uiSlice';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  CreditCard,
  Library,
  Bus,
  Hotel,
  ShieldCheck,
  Bell,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  Building,
  UserPlus,
  Archive,
  CheckCircle,
  BarChart2,
  ShieldAlert,
  QrCode,
  FileText,
  MapPin,
  ClipboardList
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { initiateSocketConnection, disconnectSocket, subscribeToNotifications } from '../../services/socket';
import { getMyNotifications } from '../../api/notifications.api';
import { performStudentCampusCheckin, clearCampusCheckinSession } from '../../utils/campusCheckin';
import { getUserRole, isDepartmentHod, getDisplayRole } from '../../utils/roles';
import AIChatWidget from '../AIChatWidget';

const DashboardLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const { darkMode, sidebarOpen } = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  // Record student location on session start (fallback if login-page geolocation failed)
  useEffect(() => {
    const roleName = typeof user?.role === 'object' ? user?.role?.name : user?.role;
    if (user?._id && roleName === 'Student') {
      performStudentCampusCheckin(dispatch);
    }
  }, [user?._id, user?.role, dispatch]);

  // Initialize socket and fetch initial unread count
  useEffect(() => {
    if (user && user._id) {
      initiateSocketConnection(user);
      
      async function fetchUnreadCount() {
        try {
          const res = await getMyNotifications({ status: 'Unread', limit: 1 });
          if (res?.data?.data?.unreadCount !== undefined) {
            setUnreadCount(res.data.data.unreadCount);
          }
        } catch (error) {
          console.error('Failed to fetch unread notifications count:', error);
        }
      };
      
      fetchUnreadCount();

      subscribeToNotifications((notification) => {
        toast.success(
          <div>
            <b>{notification.title}</b>
            <p className="text-sm">{notification.message}</p>
          </div>,
          { duration: 5000 }
        );
        setUnreadCount(prev => prev + 1);
      });
    }

    return () => {
      disconnectSocket();
    };
  }, [user?._id]);

  // Sync dark class on body (initial setup)
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = () => {
    clearCampusCheckinSession();
    dispatch(logoutUser()).then(() => {
      navigate('/login');
    });
  };

  const userRole = getUserRole(user);
  const userIsDepartmentHod = isDepartmentHod(user);
  const displayRole = getDisplayRole(user);

  let navItems = [
    { name: 'Timetable', path: '/timetable', icon: Calendar },
    { name: 'LMS / Library', path: '/library', icon: BookOpen },
    { name: 'Notifications', path: '/notifications', icon: Bell },
  ];

  if (['Super Admin', 'College Admin', 'Principal', 'Admission Officer'].includes(userRole)) {
    navItems = [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Admissions', path: '/admissions', icon: UserPlus },
      { name: 'Departments', path: '/departments', icon: Building },
      { name: 'Subjects', path: '/subjects', icon: BookOpen },
      { name: 'Students', path: '/students', icon: Users },
      { name: 'Faculty', path: '/faculty', icon: GraduationCap },
      { name: 'Attendance', path: '/attendance', icon: Clock },
      { name: 'QR Attendance', path: '/qr-attendance', icon: QrCode },
      { name: 'Attendance Analytics', path: '/attendance-analytics', icon: BarChart2 },
      { name: 'Faculty Attd.', path: '/faculty-attendance', icon: CheckCircle },
      { name: 'Fees & Finance', path: '/fees', icon: CreditCard },
      { name: 'Inventory', path: '/inventory', icon: Archive },
      ...navItems,
      { name: 'Gate Passes', path: '/gatepass', icon: ShieldCheck },
      { name: 'Bus Tracking', path: '/bus-tracking', icon: Bus },
      { name: 'Checkpoints', path: '/checkpoints', icon: QrCode },
      { name: 'Incidents', path: '/incidents', icon: ShieldAlert },
      { name: 'Leave Approvals', path: '/leave-approvals', icon: FileText },
      { name: 'Apply Leave', path: '/leave-application', icon: FileText },
    ];
  } else if (userRole === 'HOD' || (userRole === 'Faculty' && userIsDepartmentHod)) {
    navItems = [
      { name: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
      { name: 'Gate Pass Approvals', path: '/faculty/gatepass', icon: ShieldCheck },
      { name: 'Subjects', path: '/subjects', icon: BookOpen },
      { name: 'Students', path: '/students', icon: Users },
      { name: 'Attendance', path: '/attendance', icon: Clock },
      { name: 'QR Attendance', path: '/qr-attendance', icon: QrCode },
      { name: 'Attendance Analytics', path: '/attendance-analytics', icon: BarChart2 },
      { name: 'Faculty Attd.', path: '/faculty-attendance', icon: CheckCircle },
      ...navItems,
      { name: 'Incidents', path: '/incidents', icon: ShieldAlert },
      { name: 'Leave Approvals', path: '/leave-approvals', icon: FileText },
      { name: 'Apply Leave', path: '/leave-application', icon: FileText },
    ];
  } else if (userRole === 'Faculty') {
    navItems = [
      { name: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
      { name: 'Subjects', path: '/subjects', icon: BookOpen },
      { name: 'Students', path: '/students', icon: Users },
      { name: 'Attendance', path: '/attendance', icon: Clock },
      { name: 'QR Attendance', path: '/qr-attendance', icon: QrCode },
      { name: 'Faculty Attd.', path: '/faculty-attendance', icon: CheckCircle },
      { name: 'Apply Leave', path: '/leave-application', icon: FileText },
      ...navItems,
    ];
  } else if (userRole === 'Student') {
    navItems = [
      { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
      { name: 'Fees & Payments', path: '/student/fees', icon: CreditCard },
      { name: 'Attendance', path: '/student/attendance', icon: Clock },
      { name: 'QR Attendance', path: '/qr-attendance', icon: QrCode },
      { name: 'Checkpoints', path: '/checkpoints', icon: QrCode },
      { name: 'Gate Pass', path: '/student/gatepass', icon: ShieldCheck },
      { name: 'Timetable', path: '/timetable', icon: Calendar },
      { name: 'Exam Results', path: '/student/results', icon: ClipboardList },
      { name: 'LMS / Library', path: '/library', icon: BookOpen },
      { name: 'Report Incident', path: '/report-incident', icon: ShieldAlert },
      { name: 'Apply Leave', path: '/leave-application', icon: FileText },
      { name: 'Bus Tracking', path: '/bus-tracking', icon: Bus },
    ];
  } else if (userRole === 'Parent') {
    navItems = [
      { name: 'Dashboard', path: '/parent/dashboard', icon: LayoutDashboard },
      { name: 'Fees & Payments', path: '/parent/fees', icon: CreditCard },
      { name: 'Attendance', path: '/parent/attendance', icon: Clock },
      { name: 'Live Tracking', path: '/parent/tracking', icon: MapPin },
      { name: 'Bus Tracking', path: '/bus-tracking', icon: Bus },
      { name: 'Consent Settings', path: '/parent/consent', icon: ShieldCheck },
      ...navItems,
    ];
  } else if (userRole === 'Accountant') {
    navItems = [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Fees & Finance', path: '/fees', icon: CreditCard },
      ...navItems,
    ];
  } else if (userRole === 'Security Officer') {
    navItems = [
      { name: 'Gate Passes', path: '/gatepass', icon: ShieldCheck },
      { name: 'Incidents', path: '/incidents', icon: ShieldAlert },
      ...navItems,
    ];
  } else if (userRole === 'Parent') {
    navItems = [
      { name: 'Dashboard', path: '/parent/dashboard', icon: LayoutDashboard },
    ];
  } else {
    navItems = [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ...navItems,
    ];
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 transition-colors duration-200 dark:bg-dark-950 dark:text-slate-100">

      {/* Sidebar Section */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col overflow-hidden border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-dark-800 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} ${isHovered ? 'lg:w-64' : 'lg:w-20'}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Brand Header */}
        <div className={`flex h-16 items-center transition-all duration-300 ${isHovered || sidebarOpen ? 'justify-between px-6' : 'justify-center lg:px-0 px-6'} bg-transparent dark:bg-transparent`}>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white font-bold text-lg">
              Ω
            </div>
            <span className={`font-extrabold text-xl whitespace-nowrap tracking-tight bg-gradient-to-r from-brand-500 to-indigo-500 bg-clip-text text-transparent transition-all duration-300 ${isHovered || sidebarOpen ? 'opacity-100 w-auto' : 'lg:opacity-0 lg:w-0 overflow-hidden'}`}>
              COLL-ERP
            </span>
          </div>
          <button
            className="rounded-lg shrink-0 p-1.5 hover:bg-slate-100 dark:hover:bg-dark-700 lg:hidden"
            onClick={() => dispatch(setSidebarOpen(false))}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                title={(!isHovered && !sidebarOpen) ? item.name : undefined}
                onClick={() => dispatch(setSidebarOpen(false))}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150 ${isActive
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-dark-700/50 dark:hover:text-white'
                  }`}
              >
                <Icon size={18} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className={`whitespace-nowrap transition-all duration-300 ${isHovered || sidebarOpen ? 'opacity-100' : 'lg:opacity-0 lg:w-0'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800 overflow-hidden">
          <button
            onClick={handleLogout}
            title={(!isHovered && !sidebarOpen) ? 'Sign Out' : undefined}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
          >
            <LogOut size={18} className="shrink-0" />
            <span className={`whitespace-nowrap transition-all duration-300 ${isHovered || sidebarOpen ? 'opacity-100' : 'lg:opacity-0 lg:w-0'}`}>
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Header bar */}
        <header className="flex h-16 items-center justify-between bg-transparent px-6 dark:bg-transparent">

          {/* Collapse toggle */}
          <div className="flex items-center gap-4">
            <button
              className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-dark-700 lg:hidden"
              onClick={() => dispatch(setSidebarOpen(true))}
            >
              <Menu size={20} />
            </button>
            <h2 className="hidden text-lg font-semibold lg:block text-slate-800 dark:text-slate-200">
              State Institute of Technology (Campus Console)
            </h2>
          </div>

          {/* Action items */}
          <div className="flex items-center gap-4">
            {/* Dark Mode toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-dark-700"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification bell — hidden for students */}
            {userRole !== 'Student' && (
              <Link to="/notifications" className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-dark-700">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm border border-white dark:border-dark-900">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-dark-700"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white font-semibold text-sm">
                  {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden text-left lg:block">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-200">
                    {user?.email || 'User Account'}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 leading-none">
                    {displayRole}
                  </div>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-dark-800">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-750">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="truncate text-sm font-semibold">{user?.email || 'User Account'}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-dark-700"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                  >
                    Logout
                  </button>

                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-dark-900">
          <Outlet />
        </main>
      </div>
      <AIChatWidget />
    </div>
  );
};

export default DashboardLayout;

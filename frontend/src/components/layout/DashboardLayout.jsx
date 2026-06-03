import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../features/auth/authSlice';
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
  ChevronDown
} from 'lucide-react';

const DashboardLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Sync dark class on body
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => {
      navigate('/login');
    });
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'Faculty', path: '/faculty', icon: GraduationCap },
    { name: 'Academic Setup', path: '/academics', icon: BookOpen },
    { name: 'Timetable', path: '/timetable', icon: Calendar },
    { name: 'Attendance', path: '/attendance', icon: Clock },
    { name: 'Fees & Finance', path: '/fees', icon: CreditCard },
    { name: 'Library Catalog', path: '/library', icon: Library },
    { name: 'Transport Map', path: '/transport', icon: Bus },
    { name: 'Hostels', path: '/hostels', icon: Hotel },
    { name: 'Gate Passes', path: '/gatepass', icon: ShieldCheck },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 transition-colors duration-200 dark:bg-dark-950 dark:text-slate-100">
      
      {/* Sidebar Section */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-dark-800 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white font-bold text-lg">
              Ω
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-500 to-indigo-500 bg-clip-text text-transparent">
              COLL-ERP
            </span>
          </div>
          <button 
            className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-dark-700 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive 
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-dark-700/50 dark:hover:text-white'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Header bar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          
          {/* Collapse toggle */}
          <div className="flex items-center gap-4">
            <button 
              className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-dark-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
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
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-dark-700"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification triggers */}
            <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-dark-700">
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500"></span>
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-dark-700"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white font-semibold text-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden text-left lg:block">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-200">
                    {user?.email || 'Principal Account'}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 leading-none">
                    {(typeof user?.role === 'object' ? user?.role?.name : user?.role) || 'Super Admin'}
                  </div>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-dark-800">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-750">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="truncate text-sm font-semibold">{user?.email}</p>
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
    </div>
  );
};

export default DashboardLayout;

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

  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Sync dark class on body
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
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
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50 text-slate-800 transition-colors duration-200 dark:bg-dark-950 dark:text-slate-100">

      {/* Header bar */}
      <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm dark:border-slate-800 dark:bg-dark-800">

        {/* Brand Header */}
        <div className="flex items-center shrink-0">
          <Link to="/admin/dashboard" className="font-extrabold text-3xl tracking-tight text-[#003b70] dark:text-blue-400">
            COLL-ERP
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-x-visible hidden lg:flex items-center justify-center gap-10 mx-4">
          {/* Dashboard Link */}
          <Link
            to="/admin/dashboard"
            className={`py-2 text-[15px] font-bold uppercase tracking-[0.1em] transition-colors duration-200 ${location.pathname === '/admin/dashboard'
              ? 'text-[#003b70] dark:text-blue-400'
              : 'text-slate-600 hover:text-[#003b70] dark:text-slate-300 dark:hover:text-blue-400'
              }`}
          >
            DASHBOARD
          </Link>

          {/* Dropdown Menus */}
          {menuCategories.map((category) => {
            const isCategoryActive = category.items.some(item => location.pathname === item.path);
            const isOpen = activeDropdown === category.name;

            return (
              <div key={category.name} className="relative group">
                <button
                  onClick={() => setActiveDropdown(isOpen ? null : category.name)}
                  onMouseEnter={() => setActiveDropdown(category.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                  className={`flex items-center gap-1.5 py-2 text-[15px] font-bold uppercase tracking-[0.1em] transition-colors duration-200 ${isCategoryActive || isOpen
                    ? 'text-[#003b70] dark:text-blue-400'
                    : 'text-slate-600 hover:text-[#003b70] dark:text-slate-300 dark:hover:text-blue-400'
                    }`}
                >
                  {category.name}
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Content */}
                {isOpen && (
                  <div
                    className="absolute left-1/2 -translate-x-1/2 mt-0 w-56 rounded-b-lg border-x border-b border-slate-100 bg-white shadow-xl dark:border-slate-800 dark:bg-dark-800 z-50 pt-2 pb-3"
                    onMouseEnter={() => setActiveDropdown(category.name)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    {category.items.map((item) => {
                      const ItemIcon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          className={`flex items-center gap-3 px-6 py-2.5 text-[15px] transition-colors ${isActive
                            ? 'text-[#003b70] font-semibold bg-slate-50 dark:bg-dark-700/50'
                            : 'text-slate-600 hover:text-[#003b70] hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-dark-700/50'
                            }`}
                        >
                          <ItemIcon size={16} className={isActive ? 'text-[#003b70] dark:text-blue-400' : 'text-slate-400'} />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Action items */}
        <div className="flex items-center gap-6 shrink-0">
          {/* Dark Mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-slate-500 hover:text-[#003b70] dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notification triggers */}
          <button className="relative text-slate-500 hover:text-[#003b70] dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
            <Bell size={20} />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 border border-white dark:border-dark-800"></span>
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 text-slate-500 hover:text-[#003b70] dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
            >
              <div className="text-sm font-bold uppercase tracking-wider">
                {user?.email?.split('@')[0] || 'ADMIN'}
              </div>
              <ChevronDown size={14} />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-dark-800 z-50">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-750">
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="truncate text-sm font-semibold">{user?.email || 'Principal Account'}</p>
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
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="lg:hidden w-full border-b border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-dark-800 flex flex-wrap gap-x-6 gap-y-3">
        <Link
          to="/admin/dashboard"
          className={`text-sm font-bold uppercase tracking-[0.1em] transition-colors duration-200 ${location.pathname === '/admin/dashboard'
            ? 'text-[#003b70] dark:text-blue-400'
            : 'text-slate-600 hover:text-[#003b70] dark:text-slate-300'
            }`}
        >
          DASHBOARD
        </Link>
        {menuCategories.flatMap(c => c.items).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`text-sm font-bold uppercase tracking-[0.1em] transition-colors duration-200 ${isActive
                ? 'text-[#003b70] dark:text-blue-400'
                : 'text-slate-600 hover:text-[#003b70] dark:text-slate-300'
                }`}
            >
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Main Content Workspace */}
      <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-dark-900">
        <Outlet />
      </main>

    </div>
  );
};

export default DashboardLayout;

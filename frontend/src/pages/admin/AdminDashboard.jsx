import React, { useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  Search, 
  Filter, 
  Download,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const mockAttendanceData = [
  { name: 'Mon', Present: 92, Absent: 8 },
  { name: 'Tue', Present: 95, Absent: 5 },
  { name: 'Wed', Present: 88, Absent: 12 },
  { name: 'Thu', Present: 94, Absent: 6 },
  { name: 'Fri', Present: 91, Absent: 9 },
  { name: 'Sat', Present: 75, Absent: 25 },
];

const mockFeesData = [
  { name: 'Jan', Collected: 4000, Target: 5000 },
  { name: 'Feb', Collected: 3000, Target: 4500 },
  { name: 'Mar', Collected: 6000, Target: 6000 },
  { name: 'Apr', Collected: 8000, Target: 9000 },
  { name: 'May', Collected: 5000, Target: 7000 },
];

const initialGatePasses = [
  { id: 'GP-1092', name: 'John Miller', role: 'Student', purpose: 'Medical Emergency', status: 'Approved', time: '10:30 AM' },
  { id: 'GP-1093', name: 'Alice Thorne', role: 'Visitor', purpose: 'Parent Meeting', status: 'CheckedIn', time: '11:15 AM' },
  { id: 'GP-1094', name: 'Dr. Bruce Banner', role: 'Faculty', purpose: 'Seminars Exit', status: 'Pending', time: '11:45 AM' },
  { id: 'GP-1095', name: 'Robert Downey', role: 'Recruiter', purpose: 'Campus Drive Prep', status: 'CheckedIn', time: '12:00 PM' },
  { id: 'GP-1096', name: 'Mark Ruffalo', role: 'Student', purpose: 'Library Excursion', status: 'Rejected', time: '12:30 PM' }
];

const AdminDashboard = () => {
  const [gatePasses, setGatePasses] = useState(initialGatePasses);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredPasses = gatePasses.filter(pass => {
    const matchesSearch = pass.name.toLowerCase().includes(search.toLowerCase()) || pass.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || pass.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome Title */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-sm text-slate-500">Live indicators, attendance reports, and campus security logs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-dark-800 dark:hover:bg-dark-750">
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Students */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Total Enrolled</span>
            <div className="rounded-lg bg-brand-500/10 p-2 text-brand-500">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">12,480</h3>
            <span className="text-xs text-green-500 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp size={12} />
              +4.8% from last sem
            </span>
          </div>
        </div>

        {/* Faculty Workload */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Faculty Members</span>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-500">
              <GraduationCap size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">480</h3>
            <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
              Active in 8 Departments
            </span>
          </div>
        </div>

        {/* Library Books Issued */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Active Library Issues</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
              <BookOpen size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">1,894</h3>
            <span className="text-xs text-red-500 font-semibold flex items-center gap-1 mt-1">
              82 books overdue
            </span>
          </div>
        </div>

        {/* Attendance Rates */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Today's Attendance</span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
              <Clock size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">91.4%</h3>
            <span className="text-xs text-green-500 font-semibold flex items-center gap-1 mt-1">
              +1.2% above average
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Attendance Trends */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-dark-800">
          <h3 className="text-md font-semibold mb-4 text-slate-800 dark:text-slate-200">Daily Attendance Rate (%)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="Present" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Finance Fees Collections */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-dark-800">
          <h3 className="text-md font-semibold mb-4 text-slate-800 dark:text-slate-200">Fees Collection Progress ($)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockFeesData}>
                <defs>
                  <linearGradient id="colorColl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="Collected" stroke="#6366f1" fillOpacity={1} fill="url(#colorColl)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Table: Gate Passes */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-dark-800 overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200">Active Gate Passes & Visitor Logs</h3>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search visitor/ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs outline-none transition focus:border-brand-500 focus:bg-white dark:border-slate-850 dark:bg-dark-900 dark:focus:bg-dark-950"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-2">
              <Filter className="text-slate-400" size={14} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-850 dark:bg-dark-900"
              >
                <option value="All">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="CheckedIn">Checked In</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-dark-850 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3.5">Pass ID</th>
                <th className="px-6 py-3.5">Name</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Purpose of Exit/Entry</th>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPasses.map((pass) => (
                <tr key={pass.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-750/30">
                  <td className="px-6 py-4 font-semibold text-brand-600 dark:text-brand-400">{pass.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{pass.name}</td>
                  <td className="px-6 py-4">{pass.role}</td>
                  <td className="px-6 py-4">{pass.purpose}</td>
                  <td className="px-6 py-4 text-xs">{pass.time}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      pass.status === 'Approved' ? 'bg-green-500/10 text-green-500' :
                      pass.status === 'CheckedIn' ? 'bg-blue-500/10 text-blue-500' :
                      pass.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {pass.status === 'Approved' && <CheckCircle size={10} />}
                      {pass.status === 'CheckedIn' && <CheckCircle size={10} />}
                      {pass.status === 'Pending' && <Clock size={10} />}
                      {pass.status === 'Rejected' && <AlertTriangle size={10} />}
                      {pass.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredPasses.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    No matching gate passes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

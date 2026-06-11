import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Users, Clock, Calendar as CalendarIcon, TrendingUp, CheckCircle, XCircle, Loader } from 'lucide-react';
import { getAttendanceAnalyticsAPI } from '../../api/attendance.api';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

const AttendanceAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [analyticsData, setAnalyticsData] = useState({
    overallAttendance: 0,
    totalStudents: 0,
    totalTeachers: 0,
    presentToday: 0,
    lateArrivals: 0,
    dailyData: [],
    monthlyData: [],
    subjectData: [],
    teacherData: []
  });

  useEffect(() => { 
    fetchAnalyticsData(); 
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const res = await getAttendanceAnalyticsAPI();
      if (res.data && res.data.data) {
        setAnalyticsData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const { overallAttendance, totalStudents, totalTeachers, presentToday, lateArrivals, dailyData, monthlyData, subjectData, teacherData } = analyticsData;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-brand-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-indigo-400">
            Attendance Analytics
          </h1>
          <p className="text-slate-500 mt-1">Comprehensive insights into student and faculty attendance trends.</p>
        </div>
        <div className="flex bg-white dark:bg-dark-800 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-700">
          {['Overview', 'Students', 'Faculty', 'Subjects'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-brand-50 text-brand-600 shadow-sm dark:bg-brand-900/30 dark:text-brand-400'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-dark-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      {(activeTab === 'Overview' || activeTab === 'Students') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover:border-brand-300 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-50 dark:bg-brand-900/20 rounded-full blur-2xl group-hover:bg-brand-100 transition-colors"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Overall Attendance</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{overallAttendance}%</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm text-green-600 font-medium">
            <TrendingUp size={14} /> <span>+2.4% from last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover:border-blue-300 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Students</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalStudents}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm text-slate-500">
            <span>Across all departments</span>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover:border-green-300 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full blur-2xl group-hover:bg-green-100 transition-colors"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Students Present Today</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{presentToday}</h3>
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 dark:bg-dark-700 rounded-full h-1.5">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '88%' }}></div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover:border-rose-300 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-full blur-2xl group-hover:bg-rose-100 transition-colors"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Late Arrivals</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{lateArrivals}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm text-rose-500 font-medium">
            <TrendingUp size={14} className="rotate-180" /> <span>-5% from yesterday</span>
          </div>
        </div>
      </div>
      )}

      {(activeTab === 'Overview' || activeTab === 'Students') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Attendance Trend */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 dark:text-white">Daily Attendance (This Week)</h3>
            <span className="p-2 bg-slate-50 dark:bg-dark-700 rounded-lg text-slate-400"><CalendarIcon size={16} /></span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="present" name="Present %" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="absent" name="Absent %" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 dark:text-white">Monthly Trend</h3>
            <span className="p-2 bg-slate-50 dark:bg-dark-700 rounded-lg text-slate-400"><TrendingUp size={16} /></span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis domain={['auto', 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      )}

      {(activeTab === 'Overview' || activeTab === 'Subjects' || activeTab === 'Faculty') && (
        <div className={`grid grid-cols-1 ${activeTab === 'Overview' ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-6`}>
          {/* Subject-Wise Attendance */}
          {(activeTab === 'Overview' || activeTab === 'Subjects') && (
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 dark:text-white">Subject-Wise Attendance</h3>
            <select className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 dark:bg-dark-900 dark:border-slate-700 outline-none">
              <option>B.Tech CS 5th Sem</option>
              <option>B.Tech ME 3rd Sem</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} width={100} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="rate" name="Attendance %" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20}>
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.rate > 85 ? '#10b981' : entry.rate > 75 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        {/* Teacher Report */}
        {(activeTab === 'Overview' || activeTab === 'Faculty') && (
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 dark:text-white">Faculty Attendance Report</h3>
          </div>
          <div className="h-72 flex flex-col justify-center">
            {teacherData.map((teacher, idx) => (
              <div key={idx} className="mb-4 last:mb-0">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{teacher.name}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{teacher.rate}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-dark-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${teacher.rate >= 95 ? 'bg-green-500' : teacher.rate >= 90 ? 'bg-blue-500' : 'bg-amber-500'}`} 
                    style={{ width: `${teacher.rate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
      )}
    </div>
  );
};

export default AttendanceAnalytics;

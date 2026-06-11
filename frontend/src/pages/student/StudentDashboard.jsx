import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BookOpen, Calendar, Clock, GraduationCap, DollarSign, Library, FileText, Download } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../../api/axios';

const StudentDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const response = await api.get('/students/dashboard');
        setStats(response.data.data);
      } catch (error) {
        console.error("Failed to fetch student dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"></div>
      </div>
    );
  }

  const attendanceData = stats?.attendance || [
    { name: 'Present', value: 0, color: '#10b981' },
    { name: 'Absent', value: 0, color: '#f43f5e' }
  ];
  const attendancePercentage = attendanceData[0]?.value + attendanceData[1]?.value > 0
    ? Math.round((attendanceData[0].value / (attendanceData[0].value + attendanceData[1].value)) * 100)
    : 0;

  const todaysClasses = stats?.todaysClasses || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 p-6 shadow-lg">
        <div className="flex items-center gap-4 text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <GraduationCap size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              Hello, {user?.email?.split('@')[0] || 'Student'}!
            </h1>
            <p className="mt-1 text-sm text-brand-100">
              {stats?.studentDetails?.course || 'B.Tech Computer Science'} • {stats?.studentDetails?.semester || 'Semester 5'} • {stats?.studentDetails?.division || 'Division A'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition">
            View ID Card
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Attendance Summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800 flex flex-col justify-between">
          <div>
            <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Clock size={18} /> Attendance Overview
            </h3>
            <p className="text-xs text-slate-500 mt-1">Current Semester</p>
          </div>
          <div className="relative h-48 w-full mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">{attendancePercentage}%</span>
              <span className="text-xs font-semibold text-green-500">{attendancePercentage >= 75 ? 'Good' : 'Low'}</span>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Calendar size={18} /> Today's Classes
            </h3>
            <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-1 rounded dark:bg-brand-900/30 dark:text-brand-400">
              3 Remaining
            </span>
          </div>
          <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent dark:before:via-slate-800">
            {todaysClasses.map((cls, i) => (
              <div key={i} className={`relative flex items-center justify-between p-3 rounded-lg border ${cls.done ? 'bg-slate-50 border-slate-200 opacity-60 dark:bg-dark-900 dark:border-slate-800' : 'bg-white border-brand-200 dark:bg-dark-800 dark:border-brand-800'}`}>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">{cls.subject}</h4>
                  <p className="text-xs text-slate-500">{cls.time} • {cls.room}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Center */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800 flex flex-col gap-4">
          <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200">Action Center</h3>
          
          <div className="flex items-center justify-between p-4 rounded-xl border border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg dark:bg-orange-900/50 dark:text-orange-400">
                <DollarSign size={20} />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Fees Due</p>
                <p className="text-xs text-slate-500">₹{stats?.feesDue || 0} pending</p>
              </div>
            </div>
            <button className="text-xs font-bold text-white bg-orange-500 px-3 py-1.5 rounded-lg hover:bg-orange-600">Pay</button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/50 dark:text-blue-400">
                <FileText size={20} />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{stats?.assignmentsDue || 0} Assignments</p>
                <p className="text-xs text-slate-500">Due this week</p>
              </div>
            </div>
            <button className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-900 border border-transparent dark:border-blue-800">View</button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg dark:bg-emerald-900/50 dark:text-emerald-400">
                <Library size={20} />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Library</p>
                <p className="text-xs text-slate-500">{stats?.libraryBooksDue || 0} book to return</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Clock, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import CampusLiveWidget from '../../components/admin/CampusLiveWidget';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await api.get('/analytics/dashboard');
        setStats(response.data.data.stats);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Use admissionData from stats or fallback to an empty array
  const admissionData = stats?.admissionData || [];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics Overview</h1>
        <p className="text-sm text-slate-500">Global insights into college operations and finances.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-900">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <Users className="text-blue-500" size={20} />
            <h3 className="font-medium">Total Students</h3>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">{stats?.totalStudents?.toLocaleString() || 0}</p>
          <p className="mt-1 flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
            <TrendingUp size={14} /> +12% this year
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-900">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <BookOpen className="text-brand-500" size={20} />
            <h3 className="font-medium">Total Faculty</h3>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">{stats?.totalFaculty?.toLocaleString() || 0}</p>
          <p className="mt-1 text-sm text-slate-500">Across {stats?.totalDepartments || 0} departments</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-900">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <DollarSign className="text-green-500" size={20} />
            <h3 className="font-medium">YTD Revenue</h3>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">${((stats?.revenue || 0) / 1000000).toFixed(1)}M</p>
          <p className="mt-1 flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
            <TrendingUp size={14} /> +5% vs last year
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-900">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <AlertTriangle className="text-amber-500" size={20} />
            <h3 className="font-medium">Pending Approvals</h3>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">{stats?.pendingApprovals || 0}</p>
          <p className="mt-1 text-sm text-slate-500">Leaves & Admissions</p>
        </div>
      </div>

      {(['Super Admin', 'College Admin', 'Principal'].includes(user?.role?.name || user?.role)) && (
        <div className="mt-6">
          <CampusLiveWidget />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-dark-900">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6">Financial Overview</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.revenueData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <RechartsTooltip />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Admission Trends */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-dark-900">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6">Admission Trends (Current Cycle)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={admissionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="students" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import FacultyLectureAttendance from './FacultyLectureAttendance';

const HRDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const roleName = typeof user?.role === 'object' ? user?.role?.name : user?.role;
  const isFaculty = roleName === 'Faculty';

  const [activeTab, setActiveTab] = useState('Leaves');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await api.get('/hr/dashboard');
        setStats(response.data.data);
      } catch (error) {
        console.error("Failed to fetch hr stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"></div>
      </div>
    );
  }

  const leaves = stats?.leaves || [];
  const payroll = stats?.payroll || [];

  if (isFaculty) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">HR Portal</h1>
            <p className="text-sm text-slate-500">Manage your leaves and view payslips.</p>
          </div>
          <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700">
            Apply Leave
          </button>
        </div>

        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
          <button 
            onClick={() => setActiveTab('Leaves')}
            className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'Leaves' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
            My Leaves
          </button>
          <button 
            onClick={() => setActiveTab('Payroll')}
            className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'Payroll' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
            Payslips
          </button>
          <button 
            onClick={() => setActiveTab('LectureAttendance')}
            className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'LectureAttendance' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
            Lecture Attendance
          </button>
        </div>

        {activeTab === 'LectureAttendance' ? (
          <FacultyLectureAttendance />
        ) : activeTab === 'Leaves' ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
             {leaves.map((leave, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-900">
                  <div className="flex justify-between items-start">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      leave.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {leave.status}
                    </span>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-dark-800 px-2 rounded">{leave.type}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                    <Calendar size={16} className="text-brand-500"/>
                    {leave.startDate} - {leave.endDate}
                  </div>
                </div>
             ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-dark-900 overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 font-semibold text-slate-500 dark:bg-dark-800">
                <tr>
                  <th className="px-6 py-4">Month</th>
                  <th className="px-6 py-4">Net Salary</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payroll.map((p, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{p.month}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">${p.net}</td>
                    <td className="px-6 py-4">
                      <span className="text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle size={14}/> {p.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium text-sm flex items-center justify-end gap-1 w-full"><FileText size={14}/> Download</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // Admin / HR View
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">HR & Payroll Admin</h1>
          <p className="text-sm text-slate-500">Approve leaves and manage staff payroll.</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700">
            Run Payroll
          </button>
        </div>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
        <button 
          onClick={() => setActiveTab('Leaves')}
          className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'Leaves' || activeTab === 'Payroll' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('LectureAttendance')}
          className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'LectureAttendance' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
        >
          Lecture Attendance
        </button>
      </div>

      {activeTab === 'LectureAttendance' ? (
        <FacultyLectureAttendance />
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leave Approvals */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-dark-900">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Pending Leave Requests</h3>
          <div className="space-y-4">
            {leaves.filter(l => l.status === 'Pending').map((leave, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-slate-100 p-4 dark:border-slate-800 bg-slate-50 dark:bg-dark-800/50">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{leave.faculty}</p>
                  <p className="text-xs text-slate-500 mt-1">{leave.type} Leave • {leave.startDate} to {leave.endDate}</p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-full p-2 bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 transition"><CheckCircle size={18}/></button>
                  <button className="rounded-full p-2 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition"><XCircle size={18}/></button>
                </div>
              </div>
            ))}
            {leaves.filter(l => l.status === 'Pending').length === 0 && <p className="text-sm text-slate-500">No pending requests.</p>}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-dark-900">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-brand-100 p-2 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"><DollarSign size={20}/></div>
              <h3 className="font-medium text-slate-500">Total Payroll (Oct)</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">${stats?.totalPayroll?.toLocaleString() || 0}</p>
          </div>
          
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-dark-900">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"><Clock size={20}/></div>
              <h3 className="font-medium text-slate-500">Staff on Leave Today</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.staffOnLeaveToday || 0}</p>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default HRDashboard;

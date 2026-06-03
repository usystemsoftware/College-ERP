import React from 'react';
import { useSelector } from 'react-redux';
import { BookOpen, Calendar, Clock, Users, GraduationCap, FileText, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockAttendanceStats = [
  { subject: 'Data Structures', classAvg: 88, target: 75 },
  { subject: 'Operating Systems', classAvg: 82, target: 75 },
  { subject: 'Algorithms', classAvg: 91, target: 75 },
];

const FacultyDashboard = () => {
  const { user } = useSelector(state => state.auth);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-6 dark:border-brand-900/50 dark:bg-brand-900/10">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400">
            <GraduationCap size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome back, {user?.email?.split('@')[0] || 'Professor'}!
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              You have 3 classes scheduled for today. 2 assignments are pending grading.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Today's Classes</span>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500"><Calendar size={20} /></div>
          </div>
          <div className="mt-4"><h3 className="text-2xl font-bold text-slate-900 dark:text-white">3</h3></div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Total Students</span>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-500"><Users size={20} /></div>
          </div>
          <div className="mt-4"><h3 className="text-2xl font-bold text-slate-900 dark:text-white">180</h3></div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Pending Grading</span>
            <div className="rounded-lg bg-orange-500/10 p-2 text-orange-500"><FileText size={20} /></div>
          </div>
          <div className="mt-4"><h3 className="text-2xl font-bold text-slate-900 dark:text-white">42</h3></div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Avg Attendance</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500"><CheckCircle size={20} /></div>
          </div>
          <div className="mt-4"><h3 className="text-2xl font-bold text-slate-900 dark:text-white">87%</h3></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's Schedule */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-dark-800">
          <h3 className="text-md font-semibold mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Clock size={18} /> Today's Schedule
          </h3>
          <div className="space-y-4">
            {[
              { time: '09:00 AM - 10:00 AM', subject: 'Data Structures', room: 'L-101', type: 'Theory', done: true },
              { time: '11:15 AM - 12:15 PM', subject: 'Operating Systems', room: 'L-102', type: 'Theory', done: false },
              { time: '02:00 PM - 04:00 PM', subject: 'OS Lab', room: 'Lab-3', type: 'Practical', done: false },
            ].map((cls, i) => (
              <div key={i} className={`flex items-center justify-between rounded-lg border p-4 ${cls.done ? 'border-slate-200 bg-slate-50 opacity-70 dark:border-slate-800 dark:bg-dark-900' : 'border-brand-200 bg-brand-50 dark:border-brand-900/30 dark:bg-brand-900/10'}`}>
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-2 rounded-full ${cls.done ? 'bg-slate-300' : 'bg-brand-500'}`}></div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{cls.subject}</p>
                    <p className="text-xs text-slate-500">{cls.time} • Room {cls.room}</p>
                  </div>
                </div>
                <div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${cls.type === 'Theory' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                    {cls.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Insights Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-dark-800">
          <h3 className="text-md font-semibold mb-4 text-slate-800 dark:text-slate-200">Class Attendance Averages</h3>
          <div className="h-64 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockAttendanceStats} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                <XAxis type="number" domain={[0, 100]} fontSize={12} stroke="#64748b" />
                <YAxis type="category" dataKey="subject" fontSize={12} stroke="#64748b" />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="classAvg" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;

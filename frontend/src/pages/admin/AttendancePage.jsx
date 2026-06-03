import React, { useState } from 'react';
import { Calendar, Filter, CheckCircle, XCircle, Clock, Search, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockAttendanceData = [
  { student: 'John Doe', rollNo: 'CS2023001', present: 45, total: 50, status: 'Good' },
  { student: 'Jane Smith', rollNo: 'CS2023002', present: 38, total: 50, status: 'Warning' },
  { student: 'Alice Johnson', rollNo: 'CS2023003', present: 48, total: 50, status: 'Good' },
  { student: 'Bob Williams', rollNo: 'CS2023004', present: 20, total: 50, status: 'Critical' },
];

const mockTrendData = [
  { name: 'Week 1', rate: 95 },
  { name: 'Week 2', rate: 92 },
  { name: 'Week 3', rate: 88 },
  { name: 'Week 4', rate: 94 },
];

const AttendancePage = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('Data Structures');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance Management</h1>
          <p className="text-sm text-slate-500">Track, mark and review student attendance records.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-dark-800 dark:hover:bg-dark-750">
            <Download size={16} />
            Export Report
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600">
            <CheckCircle size={16} />
            Mark Today's Attendance
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="text-sm font-semibold text-slate-500">Overall Attendance Rate</div>
          <div className="mt-2 text-3xl font-bold text-brand-600">92.4%</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="text-sm font-semibold text-slate-500">Classes Conducted</div>
          <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">142</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="text-sm font-semibold text-slate-500">Defaulters (&lt; 75%)</div>
          <div className="mt-2 text-3xl font-bold text-red-500">18</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Attendance Table */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-dark-800">
          <div className="flex flex-col sm:flex-row gap-4 border-b border-slate-200 p-5 dark:border-slate-800 sm:items-center justify-between">
            <div className="flex gap-4 items-center">
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-dark-900"
              />
              <select 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-dark-900"
              >
                <option>Data Structures</option>
                <option>Operating Systems</option>
                <option>Computer Networks</option>
              </select>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input type="text" placeholder="Search..." className="w-48 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm outline-none dark:border-slate-700 dark:bg-dark-900" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 dark:bg-dark-850 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3 font-semibold">Student Name</th>
                  <th className="px-6 py-3 font-semibold">Roll No</th>
                  <th className="px-6 py-3 font-semibold">Attended/Total</th>
                  <th className="px-6 py-3 font-semibold text-right">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mockAttendanceData.map((record, i) => {
                  const percent = (record.present / record.total) * 100;
                  return (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-dark-750/30">
                      <td className="px-6 py-4 font-medium">{record.student}</td>
                      <td className="px-6 py-4">{record.rollNo}</td>
                      <td className="px-6 py-4">{record.present} / {record.total}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          percent >= 75 ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                          percent >= 65 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' :
                          'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                        }`}>
                          {percent.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar trend graph */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-dark-800">
          <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-200">Attendance Trends</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrendData}>
                <defs>
                  <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" fontSize={12} stroke="#888" />
                <YAxis fontSize={12} stroke="#888" domain={[0, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="rate" stroke="#10b981" fillOpacity={1} fill="url(#colorAtt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AttendancePage;

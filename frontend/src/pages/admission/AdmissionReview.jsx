import React, { useState } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

const mockApplications = [
  { id: 'APP-1021', name: 'Sarah Connor', course: 'B.Tech Computer Engineering', score: 92, status: 'Pending', date: 'Oct 12, 2023' },
  { id: 'APP-1022', name: 'John Smith', course: 'B.Tech Mechanical', score: 85, status: 'Reviewed', date: 'Oct 13, 2023' },
  { id: 'APP-1023', name: 'Emily Davis', course: 'B.Tech Computer Engineering', score: 96, status: 'Approved', date: 'Oct 14, 2023' },
  { id: 'APP-1024', name: 'Michael Brown', course: 'Master of Business Admin', score: 72, status: 'Rejected', date: 'Oct 15, 2023' },
  { id: 'APP-1025', name: 'Emma Wilson', course: 'B.Tech Mechanical', score: 88, status: 'Pending', date: 'Oct 15, 2023' },
];

const AdmissionReview = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredApps = mockApplications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) || app.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admission Review</h1>
          <p className="text-sm text-slate-500">Review applications, verify documents, and allot seats.</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-dark-900 overflow-hidden shadow-sm">
        
        {/* Controls */}
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search Applicant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm outline-none focus:border-brand-500 focus:bg-white dark:border-slate-700 dark:bg-dark-800 dark:focus:bg-dark-950 dark:text-white"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="text-slate-400" size={16} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
          
          <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md shadow-brand-500/20 transition">
            Generate Merit List
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-dark-800 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4">App ID</th>
                <th className="px-6 py-4">Applicant Name</th>
                <th className="px-6 py-4">Applied Course</th>
                <th className="px-6 py-4">Merit Score</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-800/50 transition">
                  <td className="px-6 py-4 font-mono text-brand-600 dark:text-brand-400 font-medium">{app.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{app.name}</td>
                  <td className="px-6 py-4">{app.course}</td>
                  <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{app.score}%</td>
                  <td className="px-6 py-4">{app.date}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      app.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      app.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      app.status === 'Reviewed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {app.status === 'Approved' && <CheckCircle size={12} />}
                      {app.status === 'Pending' && <Clock size={12} />}
                      {app.status === 'Reviewed' && <Eye size={12} />}
                      {app.status === 'Rejected' && <XCircle size={12} />}
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium text-sm">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
      </div>
    </div>
  );
};

export default AdmissionReview;

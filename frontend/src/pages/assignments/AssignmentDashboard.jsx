import React, { useState, useEffect } from 'react';
import { FileText, Plus, Clock, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../../api/axios';

const AssignmentDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const roleName = typeof user?.role === 'object' ? user?.role?.name : user?.role;
  const isStudent = roleName === 'Student';

  const [activeTab, setActiveTab] = useState('All');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssignments() {
      try {
        const response = await api.get('/assignments/dashboard');
        setAssignments(response.data.data);
      } catch (error) {
        console.error("Failed to fetch assignments stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"></div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Submitted': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Graded': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Late': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pending': return <Clock size={16} />;
      case 'Submitted': return <CheckCircle size={16} />;
      case 'Graded': return <CheckCircle size={16} />;
      case 'Late': return <AlertCircle size={16} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assignments</h1>
          <p className="text-sm text-slate-500">
            {isStudent ? 'Track and submit your coursework.' : 'Manage and grade student assignments.'}
          </p>
        </div>
        
        {!isStudent && (
          <button className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700">
            <Plus size={16} /> Create Assignment
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 rounded-xl bg-slate-100 p-1 dark:bg-dark-900 sm:max-w-md">
        {['All', 'Pending', 'Submitted', 'Graded'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-white text-slate-900 shadow-sm dark:bg-dark-800 dark:text-white'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assignments
          .filter(a => activeTab === 'All' || a.status === activeTab)
          .map((assignment) => (
          <div key={assignment.id} className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-dark-900">
            <div>
              <div className="mb-3 flex items-start justify-between">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColor(assignment.status)}`}>
                  {getStatusIcon(assignment.status)} {assignment.status}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {assignment.marks} Marks
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{assignment.title}</h3>
              <p className="text-sm font-medium text-brand-600 dark:text-brand-400 flex items-center gap-1">
                <FileText size={14} /> {assignment.subject}
              </p>
              
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Clock size={14} /> Due: {assignment.dueDate}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
              {assignment.status === 'Graded' ? (
                <div className="flex items-center gap-2 text-sm font-bold text-green-600 dark:text-green-400">
                  <CheckCircle size={16} /> Scored {assignment.score}/{assignment.marks}
                </div>
              ) : (
                <button className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">
                  {isStudent ? 'View & Submit' : 'View Submissions'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentDashboard;

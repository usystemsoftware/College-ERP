import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Calendar, FileText, Send, Loader2, CheckCircle2, Clock, XCircle, AlertTriangle, User, Paperclip } from 'lucide-react';
import { getLeaveRequestsAPI, createLeaveRequestAPI, cancelLeaveRequestAPI, updateLeaveRequestAPI, processLeaveRequestAPI } from '../../api/leave.api';
import toast from 'react-hot-toast';

const LEAVE_TYPES = ['Casual', 'Medical', 'Earned', 'Duty', 'Maternity', 'Emergency'];

const statusConfig = {
  'Pending': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  'Approved': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
  'Rejected': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  'Cancelled': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
};

const statusIcons = {
  'Pending': Clock,
  'Approved': CheckCircle2,
  'Rejected': XCircle,
  'Cancelled': AlertTriangle,
};

const LeaveApplicationPage = () => {
  const { user } = useSelector((state) => state.auth);
  const roleName = typeof user?.role === 'object' ? user?.role?.name : user?.role;
  const requesterType = ['Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty'].includes(roleName) ? 'Faculty' : (roleName === 'Student' ? 'Student' : 'Staff');

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [leaveType, setLeaveType] = useState('Casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  async function fetchLeaveRequests() {
    setLoading(true);
    try {
      const res = await getLeaveRequestsAPI({});
      setLeaveRequests(res.data?.data?.leaves || []);
    } catch (error) {
      toast.error('Failed to load leave history');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('End date cannot be before start date');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateLeaveRequestAPI(editingId, {
          leaveType,
          startDate,
          endDate,
          reason: reason.trim()
        });
        toast.success('Leave application updated successfully');
        setEditingId(null);
      } else {
        await createLeaveRequestAPI({
          requesterType,
          leaveType,
          startDate,
          endDate,
          reason: reason.trim()
        });
        toast.success('Leave application submitted successfully');
      }
      setLeaveType('Casual');
      setStartDate('');
      setEndDate('');
      setReason('');
      fetchLeaveRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (leave) => {
    setEditingId(leave._id);
    setLeaveType(leave.leaveType);
    const formatDate = (dateString) => new Date(dateString).toISOString().split('T')[0];
    setStartDate(formatDate(leave.startDate));
    setEndDate(formatDate(leave.endDate));
    setReason(leave.reason);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) return;
    try {
      await cancelLeaveRequestAPI(id);
      toast.success('Leave application cancelled');
      fetchLeaveRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel application');
    }
  };

  const handleProcess = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this leave application?`)) return;
    try {
      await processLeaveRequestAPI(id, { status, remarks: '' });
      toast.success(`Leave application ${status.toLowerCase()} successfully`);
      fetchLeaveRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to process application`);
    }
  };


  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    if (e < s) return 0;
    const diffTime = Math.abs(e - s);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const selectedDays = calculateDays(startDate, endDate);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent dark:from-teal-400 dark:to-emerald-400">
            Leave Application
          </h1>
          <p className="text-slate-500 mt-1">Apply for leave and track your application status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden sticky top-6">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-dark-850">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FileText size={18} className="text-teal-600" />
                {editingId ? 'Edit Application' : 'New Application'}
              </h3>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setLeaveType('Casual');
                    setStartDate('');
                    setEndDate('');
                    setReason('');
                  }}
                  className="text-xs text-red-500 hover:text-red-600 font-bold ml-auto"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Leave Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Leave Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white appearance-none"
                  >
                    {LEAVE_TYPES.map(type => (
                      <option key={type} value={type}>{type} Leave</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    From Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="date"
                      value={startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    To Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="date"
                      value={endDate}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Total Days */}
              {selectedDays > 0 && (
                <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/30 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm text-teal-700 dark:text-teal-400 font-medium">Total Duration</span>
                  <span className="text-lg font-bold text-teal-700 dark:text-teal-300">{selectedDays} {selectedDays === 1 ? 'Day' : 'Days'}</span>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please specify the reason for your leave..."
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !startDate || !endDate || !reason.trim()}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:from-teal-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {submitting ? 'Processing...' : (editingId ? 'Update Application' : 'Submit Application')}
              </button>
            </form>
          </div>
        </div>

        {/* Leave History */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-h-[500px]">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-dark-850 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Clock size={18} className="text-slate-500" />
                My Applications
              </h3>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                  <Loader2 size={24} className="animate-spin text-teal-500" />
                  <p className="text-sm">Loading applications...</p>
                </div>
              ) : leaveRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                  <FileText size={48} className="text-slate-200 dark:text-slate-700" />
                  <p className="text-sm font-medium">No leave applications found</p>
                  <p className="text-xs">Your submitted applications will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaveRequests.map((leave) => {
                    const StatusIcon = statusIcons[leave.status] || Clock;
                    return (
                      <div key={leave._id} className="group flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-5 rounded-xl border border-slate-100 bg-slate-50 hover:border-teal-200 hover:bg-white transition-colors dark:border-slate-700 dark:bg-dark-850 dark:hover:border-teal-800/50 dark:hover:bg-dark-800">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white text-base">
                              {leave.leaveType} Leave
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusConfig[leave.status]}`}>
                              <StatusIcon size={12} /> {leave.status}
                            </span>
                            <span className="text-xs text-slate-500 font-medium px-2 py-0.5 rounded-md bg-slate-200 dark:bg-dark-700">
                              {leave.totalDays} {leave.totalDays === 1 ? 'Day' : 'Days'}
                            </span>
                          </div>
                          
                          {['Super Admin', 'College Admin', 'Principal', 'HOD'].includes(roleName) && leave.requester && (
                            <div className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                              <User size={14} className="text-slate-400" />
                              <span className="font-medium">{leave.requester.name || leave.requester.email}</span>
                            </div>
                          )}

                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {new Date(leave.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="mx-2 text-slate-300 dark:text-slate-600">→</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {new Date(leave.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 bg-white dark:bg-dark-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                            <span className="font-semibold text-slate-600 dark:text-slate-400 block mb-1 text-xs uppercase tracking-wider">Reason:</span>
                            {leave.reason}
                          </p>

                          {leave.remarks && (
                            <p className="text-sm mt-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 text-amber-800 dark:text-amber-300">
                              <span className="font-semibold block mb-1 text-xs uppercase tracking-wider text-amber-600 dark:text-amber-500">Approver Remarks:</span>
                              {leave.remarks}
                            </p>
                          )}
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700 pt-4 sm:pt-0 sm:pl-4">
                          <div className="text-left sm:text-right">
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Applied On</p>
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {new Date(leave.createdAt).toLocaleDateString('en-IN')}
                            </p>
                          </div>

                          {leave.status === 'Pending' && (
                            <div className="flex flex-col sm:flex-row gap-2">
                              {leave.canApprove && user?._id !== (leave.requester?._id || leave.requester) ? (
                                <>
                                  <button
                                    onClick={() => handleProcess(leave._id, 'Approved')}
                                    className="text-xs font-bold px-3 py-1.5 rounded-lg text-green-600 hover:bg-green-50 border border-transparent hover:border-green-200 transition-colors dark:text-green-400 dark:hover:bg-green-900/20 dark:hover:border-green-800/30"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleProcess(leave._id, 'Rejected')}
                                    className="text-xs font-bold px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:border-red-800/30"
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEdit(leave)}
                                    className="text-xs font-bold px-3 py-1.5 rounded-lg text-teal-600 hover:bg-teal-50 border border-transparent hover:border-teal-200 transition-colors dark:text-teal-400 dark:hover:bg-teal-900/20 dark:hover:border-teal-800/30"
                                  >
                                    Edit Request
                                  </button>
                                  <button
                                    onClick={() => handleCancel(leave._id)}
                                    className="text-xs font-bold px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:border-red-800/30"
                                  >
                                    Cancel Request
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveApplicationPage;

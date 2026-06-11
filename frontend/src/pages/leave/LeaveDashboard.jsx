import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Filter, Clock, CheckCircle2, XCircle, AlertTriangle, FileText, Loader2, MessageSquare, User, Calendar } from 'lucide-react';
import { getLeaveRequestsAPI, processLeaveRequestAPI } from '../../api/leave.api';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

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

const LeaveDashboard = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('Pending');
  const [filterRole, setFilterRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Processing Modal
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, [filterStatus, filterRole]);

  async function fetchLeaves() {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterRole) params.requesterType = filterRole;
      const res = await getLeaveRequestsAPI(params);
      setLeaves(res.data?.data?.leaves || []);
    } catch (error) {
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  }

  const handleProcess = async (status) => {
    if (!selectedLeave) return;
    if (status === 'Rejected' && !remarks.trim()) {
      toast.error('Remarks are required when rejecting a leave');
      return;
    }

    setProcessing(true);
    try {
      await processLeaveRequestAPI(selectedLeave._id, {
        status,
        remarks: remarks.trim()
      });
      toast.success(`Leave request ${status}`);
      setSelectedLeave(null);
      setRemarks('');
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process request');
    } finally {
      setProcessing(false);
    }
  };

  const filteredLeaves = leaves.filter(l => 
    l.requester?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.leaveType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
            Leave Approvals
          </h1>
          <p className="text-slate-500 mt-1">Review and manage leave requests from students and faculty.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-800/30 flex items-center gap-2 font-semibold text-sm">
            <Clock size={16} />
            {leaves.filter(l => l.status === 'Pending').length} Pending
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by email, reason, or type..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-3">
          <Filter size={16} className="text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-dark-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-dark-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Roles</option>
            <option value="Student">Student</option>
            <option value="Faculty">Faculty</option>
            <option value="Staff">Staff</option>
          </select>
        </div>
      </div>

      {/* Leave List */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Loader2 size={24} className="animate-spin text-emerald-500" />
            <p className="text-sm">Loading requests...</p>
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <ShieldCheck size={48} className="text-slate-200 dark:text-slate-700" />
            <p className="text-sm font-medium">No leave requests found matching filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredLeaves.map((leave) => {
              const StatusIcon = statusIcons[leave.status] || Clock;
              return (
                <div key={leave._id} className="p-5 hover:bg-slate-50 dark:hover:bg-dark-750/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-dark-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0">
                      <User size={18} className="text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {leave.requester?.email || 'Unknown User'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {leave.requesterType}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusConfig[leave.status]}`}>
                          <StatusIcon size={10} /> {leave.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-1 line-clamp-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{leave.leaveType} Leave:</span> {leave.reason}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-dark-700 px-2 py-1 rounded-md">
                          <Calendar size={12} className="text-emerald-500" />
                          {new Date(leave.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} 
                          {' '}-{' '} 
                          {new Date(leave.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </span>
                        <span className="text-slate-400 font-bold">{leave.totalDays} Days</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Applied</p>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {new Date(leave.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    {leave.status === 'Pending' ? (
                      <button
                        onClick={() => { setSelectedLeave(leave); setRemarks(''); }}
                        className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all"
                      >
                        Review Request
                      </button>
                    ) : (
                      <button
                        onClick={() => { setSelectedLeave(leave); setRemarks(''); }}
                        className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 dark:bg-dark-700 dark:text-slate-300 dark:hover:bg-dark-600 transition-all"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal isOpen={!!selectedLeave} onClose={() => setSelectedLeave(null)} title="Leave Application Details" hideFooter={true}>
        {selectedLeave && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee Information */}
              <div className="bg-slate-50 dark:bg-dark-850 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Employee Information</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-dark-700 flex items-center justify-center shrink-0">
                    <User size={20} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white leading-tight">
                      {selectedLeave.requester?.email || 'Unknown User'}
                    </p>
                    <span className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 mt-1 inline-block">
                      {selectedLeave.requesterType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div className="bg-slate-50 dark:bg-dark-850 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Status Information</p>
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${statusConfig[selectedLeave.status]}`}>
                    {selectedLeave.status === 'Pending' && <Clock size={14} />}
                    {selectedLeave.status === 'Approved' && <CheckCircle2 size={14} />}
                    {selectedLeave.status === 'Rejected' && <XCircle size={14} />}
                    {selectedLeave.status === 'Cancelled' && <AlertTriangle size={14} />}
                    {selectedLeave.status}
                  </span>
                </div>
              </div>

              {/* Leave Type */}
              <div className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Leave Type</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedLeave.leaveType} Leave</p>
              </div>

              {/* Duration */}
              <div className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Duration</p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{selectedLeave.totalDays} Days</p>
              </div>

              {/* Start Date */}
              <div className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Start Date</p>
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <Calendar size={14} className="text-emerald-500" />
                  {new Date(selectedLeave.startDate).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>

              {/* End Date */}
              <div className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">End Date</p>
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <Calendar size={14} className="text-red-400" />
                  {new Date(selectedLeave.endDate).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Reason */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Reason provided (Full Width)</p>
              <div className="bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selectedLeave.reason}
              </div>
            </div>

            {/* Admin Action Area */}
            {selectedLeave.status === 'Pending' ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Remarks (Full Width)
                  </label>
                  <div className="relative">
                    <MessageSquare size={16} className="absolute left-3 top-3 text-slate-400" />
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Add a note to the applicant..."
                      rows={2}
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white resize-none"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => handleProcess('Approved')}
                    disabled={processing}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition shadow-sm disabled:opacity-50"
                  >
                    {processing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                    Approve
                  </button>
                  <button
                    onClick={() => handleProcess('Rejected')}
                    disabled={processing || !remarks.trim()}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition shadow-sm disabled:opacity-50"
                    title={!remarks.trim() ? "Remarks are required to reject" : ""}
                  >
                    {processing ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                    Reject
                  </button>
                  <button
                    onClick={() => setSelectedLeave(null)}
                    className="px-6 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 dark:bg-dark-700 dark:text-slate-300 dark:hover:bg-dark-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {selectedLeave.remarks && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Approver Remarks (Full Width)</p>
                    <div className="bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300">
                      {selectedLeave.remarks}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setSelectedLeave(null)}
                    className="px-6 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 dark:bg-dark-700 dark:text-slate-300 dark:hover:bg-dark-600 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LeaveDashboard;

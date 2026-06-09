import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { CheckCircle, XCircle, User } from 'lucide-react';
import { getGatePassesAPI, approveGatePassAPI } from '../../api/gatepass.api';
import { isDepartmentHod, getUserRole } from '../../utils/roles';

const HodGatePassPage = () => {
  const { user } = useSelector((state) => state.auth);
  const canApprove = getUserRole(user) === 'HOD' || isDepartmentHod(user);
  const [gatePasses, setGatePasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [remarksMap, setRemarksMap] = useState({});

  useEffect(() => {
    fetchGatePasses();
  }, [statusFilter]);

  const fetchGatePasses = async () => {
    setLoading(true);
    try {
      const params = { requestType: 'Student' };
      if (statusFilter) params.status = statusFilter;
      const res = await getGatePassesAPI(params);
      setGatePasses(res.data?.data?.passes || []);
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await approveGatePassAPI(id, action, remarksMap[id] || undefined);
      setRemarksMap(prev => ({ ...prev, [id]: '' }));
      fetchGatePasses();
    } catch (error) {
      console.error(`Failed to ${action} gate pass`, error);
      alert(error.response?.data?.message || 'Action failed');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
      Approved: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
      Rejected: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
      CheckedIn: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
      CheckedOut: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400',
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[status] || colors.Pending}`}>
        {status}
      </span>
    );
  };

  const formatDateTime = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleString();
  };

  const getStudentName = (pass) => pass.student?.personalDetails?.fullName || pass.host?.email || 'Unknown';

  if (!canApprove) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-dark-800">
        <p className="text-slate-600 dark:text-slate-400">Gate pass approvals are only available for department HODs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gate Pass Approvals</h1>
          <p className="text-sm text-slate-500">Review and approve or reject student gate pass requests from your department.</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-dark-900 dark:text-white"
        >
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="">All</option>
        </select>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-dark-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 dark:bg-dark-850 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3 font-semibold">Student</th>
                <th className="px-6 py-3 font-semibold">Purpose</th>
                <th className="px-6 py-3 font-semibold">Out Time</th>
                <th className="px-6 py-3 font-semibold">Expected Return</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading requests...</td></tr>
              ) : gatePasses.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No gate pass requests found.</td></tr>
              ) : (
                gatePasses.map((pass) => (
                  <tr key={pass._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-750/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{getStudentName(pass)}</div>
                          <div className="text-xs text-slate-500">{pass.student?.rollNumber || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 dark:text-slate-300 max-w-xs truncate" title={pass.purpose}>{pass.purpose}</td>
                    <td className="px-6 py-4 dark:text-slate-300">{formatDateTime(pass.outDateTime)}</td>
                    <td className="px-6 py-4 dark:text-slate-300">{formatDateTime(pass.expectedReturnDateTime)}</td>
                    <td className="px-6 py-4">{getStatusBadge(pass.status)}</td>
                    <td className="px-6 py-4 text-right">
                      {pass.status === 'Pending' ? (
                        <div className="flex flex-col items-end gap-2">
                          <input
                            type="text"
                            placeholder="Remarks (optional)"
                            value={remarksMap[pass._id] || ''}
                            onChange={(e) => setRemarksMap(prev => ({ ...prev, [pass._id]: e.target.value }))}
                            className="w-40 rounded border border-slate-200 px-2 py-1 text-xs dark:border-slate-700 dark:bg-dark-900 dark:text-white"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleAction(pass._id, 'Approved')} title="Approve" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg dark:text-blue-400 dark:hover:bg-blue-900/30">
                              <CheckCircle size={18} />
                            </button>
                            <button onClick={() => handleAction(pass._id, 'Rejected')} title="Reject" className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg dark:text-red-400 dark:hover:bg-red-900/30">
                              <XCircle size={18} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">{pass.remarks || '—'}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HodGatePassPage;

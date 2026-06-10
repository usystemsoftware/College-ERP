import React, { useState, useEffect } from 'react';
import { Plus, ShieldCheck, XCircle, Clock } from 'lucide-react';
import { createPortal } from 'react-dom';
import { getGatePassesAPI, createGatePassAPI } from '../../api/gatepass.api';

const StudentGatePassPage = () => {
  const [gatePasses, setGatePasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [purpose, setPurpose] = useState('');
  const [outDateTime, setOutDateTime] = useState('');
  const [expectedReturnDateTime, setExpectedReturnDateTime] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');

  useEffect(() => {
    fetchGatePasses();
  }, []);

  async function fetchGatePasses() {
    setLoading(true);
    try {
      const res = await getGatePassesAPI({ requestType: 'Student' });
      setGatePasses(res.data?.data?.passes || []);
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createGatePassAPI({
        purpose,
        outDateTime,
        expectedReturnDateTime: expectedReturnDateTime || undefined,
        vehicleNumber: vehicleNumber || undefined
      });
      setIsModalOpen(false);
      resetForm();
      fetchGatePasses();
    } catch (error) {
      console.error('Failed to create gate pass', error);
      alert(error.response?.data?.message || 'Failed to submit gate pass request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPurpose('');
    setOutDateTime('');
    setExpectedReturnDateTime('');
    setVehicleNumber('');
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gate Pass Requests</h1>
          <p className="text-sm text-slate-500">Submit a request to leave campus. It will be sent to your department HOD for approval.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
        >
          <Plus size={16} />
          Request Gate Pass
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-dark-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 dark:bg-dark-850 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3 font-semibold">Purpose</th>
                <th className="px-6 py-3 font-semibold">Out Time</th>
                <th className="px-6 py-3 font-semibold">Expected Return</th>
                <th className="px-6 py-3 font-semibold">Department</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading requests...</td></tr>
              ) : gatePasses.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No gate pass requests yet.</td></tr>
              ) : (
                gatePasses.map((pass) => (
                  <tr key={pass._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-750/30">
                    <td className="px-6 py-4 dark:text-slate-300 max-w-xs truncate" title={pass.purpose}>{pass.purpose}</td>
                    <td className="px-6 py-4 dark:text-slate-300">{formatDateTime(pass.outDateTime)}</td>
                    <td className="px-6 py-4 dark:text-slate-300">{formatDateTime(pass.expectedReturnDateTime)}</td>
                    <td className="px-6 py-4 dark:text-slate-300">{pass.department?.name || '—'}</td>
                    <td className="px-6 py-4">{getStatusBadge(pass.status)}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{pass.remarks || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-dark-800">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Request Gate Pass</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Purpose / Reason *</label>
                <textarea required rows="3" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="Reason for leaving campus..." className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-dark-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Out Date & Time *</label>
                <input required type="datetime-local" value={outDateTime} onChange={e => setOutDateTime(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-dark-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expected Return (optional)</label>
                <input type="datetime-local" value={expectedReturnDateTime} onChange={e => setExpectedReturnDateTime(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-dark-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vehicle Number (optional)</label>
                <input type="text" placeholder="e.g. MH 12 AB 1234" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-dark-900 dark:text-white" />
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-brand-50 p-3 text-xs text-brand-700 dark:bg-brand-900/20 dark:text-brand-300">
                <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                <span>Your request will be sent to your department HOD for approval before you can exit campus.</span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="rounded-lg bg-brand-500 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50">
                  {isSubmitting ? 'Submitting...' : 'Submit to HOD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      , document.body)}
    </div>
  );
};

export default StudentGatePassPage;

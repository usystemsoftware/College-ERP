import React, { useState, useEffect } from 'react';
import { getMyFeesAPI, createCheckoutSessionAPI } from '../../api/fees.api';
import { CreditCard, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const StudentFeesPage = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const res = await getMyFeesAPI();
        setFees(res.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch fees', err);
        setError('Failed to load your fee records. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  const handlePayNow = async (feeId, installmentId) => {
    try {
      setLoading(true);
      const res = await createCheckoutSessionAPI(feeId, { installmentId });
      if (res.data?.data?.url) {
        window.location.assign(res.data.data.url);
      }
    } catch (err) {
      console.error('Failed to create checkout session', err);
      setError('Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'Partial': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'Unpaid': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid': return <CheckCircle size={16} />;
      case 'Partial': return <Clock size={16} />;
      case 'Unpaid': return <AlertCircle size={16} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="text-brand-500" /> My Fees & Invoices
          </h1>
          <p className="text-sm text-slate-500 mt-1">View your fee structures, outstanding balances, and payment history.</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/50">
          {error}
        </div>
      ) : fees.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 dark:border-slate-700 dark:bg-dark-800/50">
          <div className="rounded-full bg-slate-200 p-4 text-slate-500 dark:bg-slate-800 dark:text-slate-400 mb-4">
            <CreditCard size={32} />
          </div>
          <p className="text-lg font-medium text-slate-900 dark:text-white">No Fees Assigned</p>
          <p className="text-sm text-slate-500 mt-1 max-w-sm text-center">
            You do not have any pending or paid fee structures assigned to your profile yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {fees.map((fee) => (
            <div key={fee._id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-dark-800">
              
              {/* Card Header */}
              <div className="border-b border-slate-100 bg-slate-50 p-5 dark:border-slate-750 dark:bg-dark-900/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {fee.feeStructure?.name || 'General Fee'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Academic Year: {fee.academicYear?.name || 'Current'}
                  </p>
                </div>
                <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold border ${getStatusColor(fee.status)}`}>
                  {getStatusIcon(fee.status)}
                  {fee.status}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Amount</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{fee.totalAmount.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Discount</p>
                  <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">₹{fee.discountAmount?.toLocaleString() || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Amount Paid</p>
                  <p className="text-xl font-semibold text-brand-600 dark:text-brand-400">₹{fee.paidAmount.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Pending Due</p>
                  <p className="text-xl font-semibold text-red-600 dark:text-red-400">₹{(fee.totalAmount - fee.paidAmount).toLocaleString()}</p>
                </div>
              </div>

              {/* Installments Breakdown */}
              {fee.installments && fee.installments.length > 0 && (
                <div className="border-t border-slate-100 p-5 dark:border-slate-750">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Installment Breakdown</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 dark:bg-dark-900/50 dark:text-slate-400">
                        <tr>
                          <th className="px-4 py-2 font-medium">Installment</th>
                          <th className="px-4 py-2 font-medium">Due Date</th>
                          <th className="px-4 py-2 font-medium">Amount</th>
                          <th className="px-4 py-2 font-medium">Status</th>
                          <th className="px-4 py-2 text-right font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {fee.installments.map((inst, idx) => (
                          <tr key={inst._id || idx} className="text-slate-700 dark:text-slate-300">
                            <td className="px-4 py-3">#{idx + 1}</td>
                            <td className="px-4 py-3 text-slate-500">{new Date(inst.dueDate).toLocaleDateString()}</td>
                            <td className="px-4 py-3 font-semibold">₹{inst.amount.toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                inst.status === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                inst.status === 'Partial' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {inst.status || 'Unpaid'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {inst.status !== 'Paid' ? (
                                <button 
                                  onClick={() => handlePayNow(fee._id, inst._id)}
                                  className="rounded-lg bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-100 dark:bg-brand-900/20 dark:hover:bg-brand-900/40"
                                >
                                  Pay Now
                                </button>
                              ) : (
                                <button className="rounded-lg text-slate-400 hover:text-brand-500" title="Download Receipt">
                                  <Download size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentFeesPage;

import React, { useState, useEffect } from 'react';
import { getParentFeesAPI } from '../../api/fees.api';
import {
  CreditCard,
  GraduationCap,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  IndianRupee,
  TrendingDown,
  Wallet,
} from 'lucide-react';

const statusConfig = {
  Paid: {
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    icon: <CheckCircle size={14} />,
  },
  Partial: {
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    icon: <Clock size={14} />,
  },
  Unpaid: {
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    icon: <AlertCircle size={14} />,
  },
};

const InstStatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.Unpaid;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.color}`}>
      {cfg.icon} {status}
    </span>
  );
};

const FeeCard = ({ fee }) => {
  const [expanded, setExpanded] = useState(false);
  const pending = fee.totalAmount - fee.paidAmount;
  const progress = fee.totalAmount > 0 ? Math.min((fee.paidAmount / fee.totalAmount) * 100, 100) : 0;
  const cfg = statusConfig[fee.status] || statusConfig.Unpaid;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-dark-800">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-dark-900/50 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white">
            {fee.feeStructure?.name || fee.title || 'General Fee'}
          </h4>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Academic Year: {fee.academicYear?.name || 'Current'}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${cfg.color}`}>
          {cfg.icon} {fee.status}
        </span>
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-2 gap-4 px-5 py-4 sm:grid-cols-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Total</p>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            ₹{fee.totalAmount.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Discount</p>
          <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
            ₹{(fee.discountAmount || 0).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Paid</p>
          <p className="mt-1 text-xl font-bold text-brand-600 dark:text-brand-400">
            ₹{fee.paidAmount.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Pending</p>
          <p className={`mt-1 text-xl font-bold ${pending > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            ₹{pending.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1 text-right text-xs text-slate-400">{Math.round(progress)}% paid</p>
      </div>

      {/* Installments toggle */}
      {fee.installments && fee.installments.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-between border-t border-slate-100 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-dark-900/30"
          >
            <span>Installment Breakdown ({fee.installments.length} installment{fee.installments.length > 1 ? 's' : ''})</span>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {expanded && (
            <div className="border-t border-slate-100 dark:border-slate-700">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 dark:bg-dark-900/50 dark:text-slate-400">
                    <tr>
                      <th className="px-5 py-2.5 font-semibold">#</th>
                      <th className="px-5 py-2.5 font-semibold">Due Date</th>
                      <th className="px-5 py-2.5 font-semibold">Amount</th>
                      <th className="px-5 py-2.5 font-semibold">Paid</th>
                      <th className="px-5 py-2.5 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {fee.installments.map((inst, idx) => (
                      <tr key={inst._id || idx} className="text-slate-700 dark:text-slate-300">
                        <td className="px-5 py-3 font-medium">#{idx + 1}</td>
                        <td className="px-5 py-3 text-slate-500">
                          {new Date(inst.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-3 font-semibold">₹{inst.amount.toLocaleString()}</td>
                        <td className="px-5 py-3 text-emerald-600 dark:text-emerald-400">
                          ₹{(inst.paidAmount || 0).toLocaleString()}
                        </td>
                        <td className="px-5 py-3">
                          <InstStatusBadge status={inst.status || 'Unpaid'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const StudentFeeSection = ({ data }) => {
  const { student, fees, summary } = data;
  const name = student?.personalDetails?.fullName || 'Student';

  return (
    <div className="space-y-4">
      {/* Student header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/50 dark:bg-dark-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/10">
            <GraduationCap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Roll No: {student?.rollNumber || 'N/A'} &nbsp;·&nbsp;
              {student?.course?.name || ''} &nbsp;·&nbsp;
              {student?.department?.name || ''}
            </p>
          </div>
        </div>

        {/* Summary pills */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2 dark:bg-dark-800">
            <IndianRupee size={14} className="text-slate-500" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Fees</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">₹{summary.totalFees.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 dark:bg-emerald-900/20">
            <Wallet size={14} className="text-emerald-600" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Paid</p>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">₹{summary.totalPaid.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 dark:bg-red-900/20">
            <TrendingDown size={14} className="text-red-600" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-red-500 dark:text-red-400">Due</p>
              <p className="text-sm font-bold text-red-700 dark:text-red-300">₹{summary.outstandingBalance.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fee records */}
      {fees.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-10 dark:border-slate-700 dark:bg-dark-800/50">
          <CreditCard className="mb-3 h-10 w-10 text-slate-400" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No fee records assigned yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {fees.map((fee) => (
            <FeeCard key={fee._id} fee={fee} />
          ))}
        </div>
      )}
    </div>
  );
};

const ParentFeesPage = () => {
  const [feesData, setFeesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const res = await getParentFeesAPI();
        setFeesData(res.data?.data?.feesData || []);
      } catch (err) {
        console.error('Failed to fetch parent fees', err);
        setError('Failed to load fee records. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow">
          <CreditCard size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Fees &amp; Payments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">View fee records and payment status for your children.</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400">
          {error}
        </div>
      ) : feesData.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-20 dark:border-slate-700 dark:bg-dark-800/50">
          <CreditCard className="mb-4 h-12 w-12 text-slate-400" />
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">No fee data available</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Either no students are linked to your profile or no fees have been assigned.
          </p>
        </div>
      ) : (
        feesData.map((data, idx) => (
          <StudentFeeSection key={data.student?._id || idx} data={data} />
        ))
      )}
    </div>
  );
};

export default ParentFeesPage;

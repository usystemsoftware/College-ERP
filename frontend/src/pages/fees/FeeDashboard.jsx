import React, { useState } from 'react';
import { CreditCard, DollarSign, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';

// Mock Data
const mockInvoices = [
  { id: 'INV-2023-001', title: 'Tuition Fee - Fall 2023', totalAmount: 5000, paidAmount: 5000, dueDate: 'Sep 01, 2023', status: 'Paid', feeType: 'Tuition' },
  { id: 'INV-2023-042', title: 'Hostel Fee - Fall 2023', totalAmount: 2000, paidAmount: 1000, dueDate: 'Oct 01, 2023', status: 'Partial', feeType: 'Hostel' },
  { id: 'INV-2023-089', title: 'Library Fine', totalAmount: 50, paidAmount: 0, dueDate: 'Oct 15, 2023', status: 'Pending', feeType: 'Library Fine' },
];

const mockStats = {
  totalBilled: 1500000,
  totalCollected: 1200000,
  pendingDues: 300000
};

const FeeDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const roleName = typeof user?.role === 'object' ? user?.role?.name : user?.role;
  const isStudent = roleName === 'Student';

  const [activeTab, setActiveTab] = useState('All');

  const getStatusColor = (status) => {
    switch(status) {
      case 'Paid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Partial': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Overdue': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (!isStudent) {
    // Admin / Accountant View
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Accounting Dashboard</h1>
            <p className="text-sm text-slate-500">Overview of college finances and fee collection.</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700">
            Generate Invoices
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-dark-900">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-500">Total Billed</h3>
              <div className="rounded-md bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <FileText size={18} />
              </div>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">${mockStats.totalBilled.toLocaleString()}</p>
          </div>
          
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-dark-900">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-500">Total Collected</h3>
              <div className="rounded-md bg-green-50 p-2 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                <DollarSign size={18} />
              </div>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">${mockStats.totalCollected.toLocaleString()}</p>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-dark-800">
              <div className="h-full rounded-full bg-green-500" style={{ width: `${(mockStats.totalCollected / mockStats.totalBilled) * 100}%` }}></div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-dark-900">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-500">Pending Dues</h3>
              <div className="rounded-md bg-red-50 p-2 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                <AlertCircle size={18} />
              </div>
            </div>
            <p className="mt-4 text-3xl font-bold text-red-600 dark:text-red-400">${mockStats.pendingDues.toLocaleString()}</p>
          </div>
        </div>

        {/* Recent Transactions Table Mock */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-dark-900">
          <div className="border-b border-slate-200 p-4 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900 dark:text-white">Recent Payments</h3>
            <button className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">Record Offline Payment</button>
          </div>
          <div className="p-8 text-center text-slate-500">
            (Data Table Component Goes Here)
          </div>
        </div>
      </div>
    );
  }

  // Student View
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Fee Portal</h1>
          <p className="text-sm text-slate-500">View your invoices and make online payments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Invoices List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex space-x-1 rounded-xl bg-slate-100 p-1 dark:bg-dark-900 w-fit">
            {['All', 'Pending', 'Paid'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-dark-800 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {mockInvoices
            .filter(i => activeTab === 'All' || (activeTab === 'Paid' ? i.status === 'Paid' : i.status !== 'Paid'))
            .map(invoice => (
            <div key={invoice.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-dark-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-slate-400">{invoice.id}</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{invoice.title}</h3>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5"><Clock size={14}/> Due: {invoice.dueDate}</p>
              </div>
              
              <div className="flex flex-col sm:items-end gap-2 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-4 sm:pt-0 sm:pl-6">
                <div className="text-left sm:text-right">
                  <p className="text-sm text-slate-500">Amount Due</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">${invoice.totalAmount - invoice.paidAmount}</p>
                  {invoice.paidAmount > 0 && <p className="text-xs text-green-600 dark:text-green-400 mt-1">Paid: ${invoice.paidAmount}</p>}
                </div>
                {invoice.status !== 'Paid' && (
                  <button className="flex w-full sm:w-auto justify-center items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-slate-800 dark:bg-brand-600 dark:hover:bg-brand-700 mt-2">
                    <CreditCard size={16} /> Pay Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-dark-900 h-fit">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Payment Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Total Fees</span>
              <span>$7,050</span>
            </div>
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>Total Paid</span>
              <span>-$6,000</span>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-lg text-slate-900 dark:text-white">
              <span>Outstanding Balance</span>
              <span>$1,050</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FeeDashboard;

import React, { useState } from 'react';
import { DollarSign, Download, Filter, Plus, Search, MoreVertical, CreditCard, CheckCircle, Clock } from 'lucide-react';
import Modal from '../../components/common/Modal';

const mockFees = [
  { id: 'FEE-2023-001', student: 'John Doe', roll: 'CS2023001', type: 'Tuition Fee', amount: 45000, paid: 45000, status: 'Paid', date: '2023-08-15' },
  { id: 'FEE-2023-002', student: 'Jane Smith', roll: 'CS2023002', type: 'Tuition Fee', amount: 45000, paid: 20000, status: 'Partial', date: '2023-08-15' },
  { id: 'FEE-2023-003', student: 'Alice Johnson', roll: 'CS2023003', type: 'Hostel Fee', amount: 25000, paid: 0, status: 'Unpaid', date: '2023-09-01' },
  { id: 'FEE-2023-004', student: 'Bob Williams', roll: 'CS2023004', type: 'Transport', amount: 15000, paid: 15000, status: 'Paid', date: '2023-08-20' },
];

const FeesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Fees & Payments</h1>
          <p className="text-sm text-slate-500">Manage student fee structures, track payments, and generate receipts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-dark-800 dark:hover:bg-dark-750">
            <Download size={16} />
            Export Data
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
          >
            <Plus size={16} />
            Generate Fee
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="flex justify-between items-center">
            <div className="text-sm font-semibold text-slate-500">Total Revenue</div>
            <div className="p-2 rounded-lg bg-green-500/10 text-green-500"><DollarSign size={20}/></div>
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">₹ 4.2M</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="flex justify-between items-center">
            <div className="text-sm font-semibold text-slate-500">Pending Dues</div>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500"><Clock size={20}/></div>
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">₹ 850K</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="flex justify-between items-center">
            <div className="text-sm font-semibold text-slate-500">Paid Invoices</div>
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-500"><CheckCircle size={20}/></div>
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">1,245</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="flex justify-between items-center">
            <div className="text-sm font-semibold text-slate-500">Recent Transactions</div>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500"><CreditCard size={20}/></div>
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">42</div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-dark-800">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by student or fee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm outline-none focus:border-brand-500 focus:bg-white dark:border-slate-850 dark:bg-dark-900 dark:focus:bg-dark-950"
            />
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-dark-750">
            <Filter size={16} /> Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-dark-850 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">Fee ID</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockFees.map((fee, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-dark-750/30">
                  <td className="px-6 py-4 font-medium text-brand-600">{fee.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{fee.student}</div>
                    <div className="text-xs text-slate-500">{fee.roll}</div>
                  </td>
                  <td className="px-6 py-4">{fee.type}</td>
                  <td className="px-6 py-4">{fee.date}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-semibold text-slate-900 dark:text-white">₹ {fee.amount.toLocaleString()}</div>
                    {fee.paid > 0 && <div className="text-xs text-green-500">Paid: ₹ {fee.paid.toLocaleString()}</div>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      fee.status === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                      fee.status === 'Partial' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                    }`}>
                      {fee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-dark-700 dark:hover:text-slate-300">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Generate New Fee"
      >
        <form className="space-y-4 mt-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Student Roll No / ID</label>
            <input type="text" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800" placeholder="e.g. CS2023001" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Fee Type</label>
            <select className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800">
              <option>Tuition Fee</option>
              <option>Hostel Fee</option>
              <option>Transport Fee</option>
              <option>Library Fine</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Amount (₹)</label>
            <input type="number" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800" placeholder="0.00" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Due Date</label>
            <input type="date" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800" />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FeesPage;

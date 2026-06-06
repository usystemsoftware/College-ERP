import React, { useState, useEffect } from 'react';
import { DollarSign, Download, Filter, Plus, Search, MoreVertical, CreditCard, CheckCircle, Clock } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { getAllFeesAPI, getFeeStatsAPI, createFeeAPI } from '../../api/fees.api';
import { getAcademicYears, getSemesters } from '../../api/academic.api';
import { getStudentsAPI } from '../../api/students.api';

const FeesPage = () => {
  const [fees, setFees] = useState([]);
  const [stats, setStats] = useState({ totalFees: 0, paidFees: 0, unpaidFees: 0, partialFees: 0, totalRevenue: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form dependencies
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    student: '',
    semester: '',
    academicYear: '',
    feeType: 'Tuition',
    totalAmount: '',
    dueDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchFormDependencies();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [feesRes, statsRes] = await Promise.all([
        getAllFeesAPI({ limit: 100 }), // Get up to 100 recent fees
        getFeeStatsAPI()
      ]);
      if (feesRes.data?.data?.fees) setFees(feesRes.data.data.fees);
      if (statsRes.data?.data) setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching fees data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormDependencies = async () => {
    try {
      const [ayRes, semRes, stuRes] = await Promise.all([
        getAcademicYears(),
        getSemesters(),
        getStudentsAPI({ limit: 1000 })
      ]);
      const ays = ayRes.data?.data || [];
      const sems = semRes.data?.data || [];
      const stus = stuRes.data?.data?.students || [];
      
      setAcademicYears(ays);
      setSemesters(sems);
      setStudents(stus);

      if (ays.length > 0 && sems.length > 0 && stus.length > 0) {
        setFormData(prev => ({
          ...prev,
          academicYear: ays.find(a => a.isCurrent)?._id || ays[0]._id,
          semester: sems[0]._id,
          student: stus[0]._id
        }));
      }
    } catch (error) {
      console.error('Error fetching dependencies:', error);
    }
  };

  const handleGenerateFee = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createFeeAPI({
        ...formData,
        totalAmount: Number(formData.totalAmount)
      });
      alert('Fee generated successfully!');
      setIsModalOpen(false);
      fetchDashboardData(); // refresh table
      setFormData(prev => ({ ...prev, totalAmount: '', dueDate: '' }));
    } catch (error) {
      console.error('Error generating fee:', error);
      alert(error.response?.data?.message || 'Failed to generate fee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFees = fees.filter(fee => 
    fee.student?.personalDetails?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.student?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Fees & Payments</h1>
          <p className="text-sm text-slate-500">Manage student fee structures, track payments, and generate receipts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-dark-800 dark:hover:bg-dark-750 text-slate-700 dark:text-slate-300">
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
          <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">₹ {(stats.totalRevenue || 0).toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="flex justify-between items-center">
            <div className="text-sm font-semibold text-slate-500">Pending Dues</div>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500"><Clock size={20}/></div>
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{stats.unpaidFees || 0}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="flex justify-between items-center">
            <div className="text-sm font-semibold text-slate-500">Paid Invoices</div>
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-500"><CheckCircle size={20}/></div>
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{stats.paidFees || 0}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="flex justify-between items-center">
            <div className="text-sm font-semibold text-slate-500">Total Fees Gen.</div>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500"><CreditCard size={20}/></div>
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{stats.totalFees || 0}</div>
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
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm outline-none focus:border-brand-500 focus:bg-white dark:border-slate-850 dark:bg-dark-900 dark:focus:bg-dark-950 dark:text-white"
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
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center">Loading fees...</td></tr>
              ) : filteredFees.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center">No fees found. Generate one!</td></tr>
              ) : (
                filteredFees.map((fee, i) => (
                  <tr key={fee._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-750/30">
                    <td className="px-6 py-4 font-medium text-brand-600 dark:text-brand-400">
                      {fee._id.substring(fee._id.length - 6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{fee.student?.personalDetails?.fullName || 'Unknown Student'}</div>
                      <div className="text-xs text-slate-500">{fee.student?.rollNumber || 'No Roll No'}</div>
                    </td>
                    <td className="px-6 py-4">{fee.feeType}</td>
                    <td className="px-6 py-4">{new Date(fee.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-semibold text-slate-900 dark:text-white">₹ {(fee.totalAmount || 0).toLocaleString()}</div>
                      {fee.paidAmount > 0 && <div className="text-xs text-green-500">Paid: ₹ {(fee.paidAmount || 0).toLocaleString()}</div>}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Generate New Fee"
      >
        <form onSubmit={handleGenerateFee} className="space-y-4 mt-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Student</label>
            <select 
              required
              value={formData.student}
              onChange={(e) => setFormData({...formData, student: e.target.value})}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white"
            >
              {students.map(s => (
                <option key={s._id} value={s._id}>{s.personalDetails?.fullName} ({s.rollNumber})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Academic Year</label>
              <select 
                required
                value={formData.academicYear}
                onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white"
              >
                {academicYears.map(ay => (
                  <option key={ay._id} value={ay._id}>{ay.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Semester</label>
              <select 
                required
                value={formData.semester}
                onChange={(e) => setFormData({...formData, semester: e.target.value})}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white"
              >
                {semesters.map(sem => (
                  <option key={sem._id} value={sem._id}>{sem.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Fee Type</label>
            <select 
              required
              value={formData.feeType}
              onChange={(e) => setFormData({...formData, feeType: e.target.value})}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white"
            >
              <option value="Tuition">Tuition Fee</option>
              <option value="Hostel">Hostel Fee</option>
              <option value="Transport">Transport Fee</option>
              <option value="Library">Library Fine</option>
              <option value="Exam">Exam Fee</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Amount (₹)</label>
            <input 
              type="number" 
              required
              min="0"
              value={formData.totalAmount}
              onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white" 
              placeholder="e.g. 45000" 
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Due Date</label>
            <input 
              type="date" 
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white" 
            />
          </div>
          <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700 pt-4">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-brand-500 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Generating...' : 'Generate Fee'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FeesPage;

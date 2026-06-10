import React, { useState, useEffect } from 'react';
import { DollarSign, Download, Filter, Plus, Search, MoreVertical, CreditCard, CheckCircle, Clock } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { getAllFeesAPI, getFeeStatsAPI, createFeeAPI, recordPaymentAPI } from '../../api/fees.api';
import { getAcademicYears, getSemesters, getDepartments, getCourses } from '../../api/academic.api';
import { getStudentsAPI } from '../../api/students.api';
import FeeCategoriesTab from './fees/FeeCategoriesTab';
import FeeStructuresTab from './fees/FeeStructuresTab';
import BulkAssignFeeModal from './fees/BulkAssignFeeModal';

const FeesPage = () => {
  const [activeTab, setActiveTab] = useState('records'); // 'records', 'categories', 'structures'
  const [fees, setFees] = useState([]);
  const [stats, setStats] = useState({ totalFees: 0, paidFees: 0, unpaidFees: 0, partialFees: 0, totalRevenue: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Action state
  const [selectedFee, setSelectedFee] = useState(null);
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Collect Payment Form Data
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'Cash',
    transactionId: ''
  });

  // Filters State
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  useEffect(() => {
    fetchFormDependencies();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDepartment, selectedCourse, selectedSemester]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (selectedDepartment) params.department = selectedDepartment;
      if (selectedCourse) params.course = selectedCourse;
      if (selectedSemester) params.semester = selectedSemester;

      const [feesRes, statsRes] = await Promise.all([
        getAllFeesAPI(params), // Get up to 100 recent fees with filters
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

  async function fetchFormDependencies() {
    try {
      const [ayRes, semRes, stuRes, deptRes, courseRes] = await Promise.all([
        getAcademicYears(),
        getSemesters(),
        getStudentsAPI({ limit: 1000 }),
        getDepartments({ limit: 100 }),
        getCourses({ limit: 100 })
      ]);
      const ays = ayRes.data?.data || [];
      const sems = semRes.data?.data || [];
      const stus = stuRes.data?.data?.students || [];
      const depts = deptRes.data?.data || [];
      const crs = courseRes.data?.data || [];

      setAcademicYears(ays);
      setSemesters(sems);
      setStudents(stus);
      setDepartments(depts);
      setCourses(crs);

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

  const handleCollectFeeClick = (fee) => {
    setSelectedFee(fee);
    setPaymentData({
      amount: fee.totalAmount - (fee.paidAmount || 0),
      paymentMethod: 'Cash',
      transactionId: `TXN-CSH-${Date.now()}`
    });
    setIsCollectModalOpen(true);
  };

  const handleViewInvoiceClick = (fee) => {
    setSelectedFee(fee);
    setIsInvoiceModalOpen(true);
  };

  const handleCollectPaymentSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await recordPaymentAPI(selectedFee._id, {
        amount: Number(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        transactionId: paymentData.transactionId
      });
      alert('Payment recorded successfully!');
      setIsCollectModalOpen(false);
      fetchDashboardData();
    } catch (error) {
      console.error('Error recording payment:', error);
      alert(error.response?.data?.message || 'Failed to record payment');
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
          <p className="text-sm text-slate-500">Manage fee structures, track payments, and generate receipts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-dark-800 dark:hover:bg-dark-750 text-slate-700 dark:text-slate-300">
            <Download size={16} /> Export Data
          </button>
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
          >
            <Plus size={16} /> Bulk Assign Fees
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="flex justify-between items-center">
            <div className="text-sm font-semibold text-slate-500">Total Revenue</div>
            <div className="p-2 rounded-lg bg-green-500/10 text-green-500"><DollarSign size={20} /></div>
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">₹ {(stats.totalRevenue || 0).toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="flex justify-between items-center">
            <div className="text-sm font-semibold text-slate-500">Pending Dues</div>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500"><Clock size={20} /></div>
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{stats.unpaidFees || 0}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="flex justify-between items-center">
            <div className="text-sm font-semibold text-slate-500">Paid Invoices</div>
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-500"><CheckCircle size={20} /></div>
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{stats.paidFees || 0}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="flex justify-between items-center">
            <div className="text-sm font-semibold text-slate-500">Total Fees Gen.</div>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500"><CreditCard size={20} /></div>
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{stats.totalFees || 0}</div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-dark-800">
        <div className="flex flex-col gap-4 p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative w-full lg:max-w-xs">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by student or fee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm outline-none focus:border-brand-500 focus:bg-white dark:border-slate-850 dark:bg-dark-900 dark:focus:bg-dark-950 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
              <div className="flex items-center justify-center text-slate-400 pl-1">
                <Filter size={18} />
              </div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white min-w-[150px]"
              >
                <option value="">All Departments</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white min-w-[150px]"
              >
                <option value="">All Courses</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white min-w-[150px]"
              >
                <option value="">All Semesters</option>
                {semesters.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
          </div>
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
                      {fee.paidAmount > 0 && fee.status !== 'Paid' && <div className="text-xs text-red-500 mt-0.5 font-medium">Due: ₹ {(fee.totalAmount - fee.paidAmount).toLocaleString()}</div>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${fee.status === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                        fee.status === 'Partial' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' :
                          'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                        }`}>
                        {fee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {fee.status !== 'Paid' && (
                          <button
                            onClick={() => handleCollectFeeClick(fee)}
                            className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-600 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20"
                          >
                            Collect
                          </button>
                        )}
                        <button
                          onClick={() => handleViewInvoiceClick(fee)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-dark-800"
                        >
                          Invoice
                        </button>
                      </div>
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
        hideFooter={true}
      >
        <form onSubmit={handleGenerateFee} className="space-y-4 mt-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Student</label>
            <select
              required
              value={formData.student}
              onChange={(e) => setFormData({ ...formData, student: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, feeType: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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

      {/* Collect Fee Modal */}
      <Modal
        isOpen={isCollectModalOpen}
        onClose={() => setIsCollectModalOpen(false)}
        title="Collect Fee Payment"
        hideFooter={true}
      >
        {selectedFee && (
          <form onSubmit={handleCollectPaymentSubmit} className="space-y-4 mt-2">
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-dark-900 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-500">Student:</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedFee.student?.personalDetails?.fullName}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-500">Fee Type:</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedFee.feeType}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-500">Total Amount:</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">₹{selectedFee.totalAmount}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-500">Already Paid:</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">₹{selectedFee.paidAmount || 0}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Amount Due:</span>
                <span className="text-lg font-bold text-red-600 dark:text-red-400">₹{selectedFee.totalAmount - (selectedFee.paidAmount || 0)}</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Paying Amount (₹)</label>
              <input
                type="number"
                required
                min="1"
                max={selectedFee.totalAmount - (selectedFee.paidAmount || 0)}
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Payment Method</label>
              <select
                required
                value={paymentData.paymentMethod}
                onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Transaction ID / Ref No.</label>
              <input
                type="text"
                required
                value={paymentData.transactionId}
                onChange={(e) => setPaymentData({ ...paymentData, transactionId: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700 pt-4">
              <button
                type="button"
                onClick={() => setIsCollectModalOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-green-500 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* View Invoice Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Fee Invoice"
        hideFooter={true}
      >
        {selectedFee && (
          <div className="space-y-6 mt-2">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">State Institute of Technology</h3>
                <p className="text-sm text-slate-500">Official Fee Receipt</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Invoice No: INV-{selectedFee._id.substring(selectedFee._id.length - 6).toUpperCase()}</p>
                <p className="text-sm text-slate-500">Date: {new Date(selectedFee.createdAt || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase mb-1">Billed To</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedFee.student?.personalDetails?.fullName}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Roll No: {selectedFee.student?.rollNumber}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Course: {selectedFee.student?.course?.name || 'N/A'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-medium uppercase mb-1">Fee Details</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedFee.feeType} Fee</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Due: {new Date(selectedFee.dueDate).toLocaleDateString()}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Status:
                  <span className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${selectedFee.status === 'Paid' ? 'bg-green-100 text-green-700' :
                    selectedFee.status === 'Partial' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                    {selectedFee.status}
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-dark-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300">Description</th>
                    <th className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{selectedFee.feeType} Fee for Academic Year</td>
                    <td className="px-4 py-3 text-slate-900 dark:text-white text-right">₹{selectedFee.totalAmount}</td>
                  </tr>
                  {selectedFee.paidAmount > 0 && (
                    <tr>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Total Paid (Credits)</td>
                      <td className="px-4 py-3 text-green-600 dark:text-green-400 text-right">- ₹{selectedFee.paidAmount}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-50 dark:bg-dark-800 border-t border-slate-200 dark:border-slate-700 font-bold">
                  <tr>
                    <td className="px-4 py-3 text-slate-900 dark:text-white text-right">Balance Due</td>
                    <td className="px-4 py-3 text-red-600 dark:text-red-400 text-right text-lg">₹{selectedFee.totalAmount - (selectedFee.paidAmount || 0)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-dark-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('Print functionality would be triggered here');
                }}
                className="rounded-lg bg-brand-500 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 flex items-center gap-2"
              >
                <Download size={16} /> Download PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FeesPage;

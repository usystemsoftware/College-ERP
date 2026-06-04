import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFaculty, createFaculty } from '../../features/faculty/facultySlice';
import { Search, Plus, Filter, MoreVertical, Mail, Phone } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { getDepartments } from '../../api/academic.api';

const FacultyPage = () => {
  const dispatch = useDispatch();
  const { list: faculty, loading, error, pagination } = useSelector((state) => state.faculty);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    employeeId: '',
    role: 'Faculty',
    department: ''
  });

  useEffect(() => {
    dispatch(fetchFaculty({ limit: 50 }));
    getDepartments().then(res => {
      if (res.data?.data) {
        setDepartments(res.data.data);
      }
    }).catch(console.error);
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.department) {
      alert("Please select a department");
      return;
    }
    dispatch(createFaculty(formData)).then((res) => {
      if (!res.error) {
        setIsAddModalOpen(false);
        setFormData({ fullName: '', email: '', password: '', employeeId: '', role: 'Faculty', department: '' });
      } else {
        alert(res.payload || 'Failed to create faculty');
      }
    });
  };

  const filteredFaculty = faculty.filter(f => 
    f.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Faculty Directory</h1>
          <p className="text-sm text-slate-500">Manage professors, staff assignments, and departments.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
          >
            <Plus size={16} />
            Add Faculty / Staff
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-dark-800">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or emp ID..."
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
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"></div>
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center text-red-500">{error}</div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-dark-850 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">Faculty Member</th>
                  <th className="px-6 py-4">Emp ID</th>
                  <th className="px-6 py-4">Designation</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredFaculty.length > 0 ? (
                  filteredFaculty.map((f) => (
                    <tr key={f._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-750/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={f.user?.profileImage || `https://ui-avatars.com/api/?name=${f.fullName}&background=random`} 
                            alt={f.fullName} 
                            className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{f.fullName}</div>
                            <div className="text-xs text-slate-500">{f.specialization || 'General'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-indigo-600 dark:text-indigo-400">{f.employeeId}</td>
                      <td className="px-6 py-4">{f.designation}</td>
                      <td className="px-6 py-4">{f.department?.name || 'N/A'}</td>
                      <td className="px-6 py-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500"><Mail size={12}/> {f.user?.email || 'N/A'}</div>
                        {f.phone && <div className="flex items-center gap-1.5 text-xs text-slate-500"><Phone size={12}/> {f.phone}</div>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-dark-700 dark:hover:text-slate-300">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                      No faculty found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Faculty or Staff"
        hideFooter={true}
      >
        <form className="space-y-4 mt-2" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
            <input required type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800" placeholder="Enter full name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
              <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800" placeholder="email@erp.com" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800" placeholder="••••••••" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Employee ID</label>
              <input required type="text" value={formData.employeeId} onChange={(e) => setFormData({...formData, employeeId: e.target.value})} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800" placeholder="EMP001" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
              <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800">
                <option value="Faculty">Faculty</option>
                <option value="HOD">HOD</option>
                <option value="Accountant">Accountant</option>
                <option value="Librarian">Librarian</option>
                <option value="Admin Staff">Admin Staff</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Department</label>
            <select required value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800">
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div className="mt-6 flex justify-end gap-3 flex-shrink-0 pt-4">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-dark-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FacultyPage;

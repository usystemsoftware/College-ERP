import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { getFeeStructuresAPI, createFeeStructureAPI, updateFeeStructureAPI, deleteFeeStructureAPI, getFeeCategoriesAPI } from '../../../api/fees.api';
import { getAcademicYears, getCourses, getBatches } from '../../../api/academic.api';
import Modal from '../../../components/common/Modal';

const FeeStructuresTab = () => {
  const [structures, setStructures] = useState([]);
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    batch: '',
    academicYear: '',
    heads: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [strRes, catRes, crsRes, batRes, ayRes] = await Promise.all([
        getFeeStructuresAPI(),
        getFeeCategoriesAPI(),
        getCourses(),
        getBatches(),
        getAcademicYears()
      ]);
      setStructures(strRes.data?.data || []);
      setCategories(catRes.data?.data || []);
      setCourses(crsRes.data?.data || []);
      setBatches(batRes.data?.data || []);
      setAcademicYears(ayRes.data?.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (structure = null) => {
    if (structure) {
      setEditId(structure._id);
      setFormData({
        name: structure.name,
        course: structure.course?._id,
        batch: structure.batch?._id,
        academicYear: structure.academicYear?._id,
        heads: structure.heads.map(h => ({ category: h.category?._id, amount: h.amount }))
      });
    } else {
      setEditId(null);
      setFormData({
        name: '',
        course: courses[0]?._id || '',
        batch: batches[0]?._id || '',
        academicYear: academicYears.find(a => a.isCurrent)?._id || academicYears[0]?._id || '',
        heads: []
      });
    }
    setIsModalOpen(true);
  };

  const handleAddHead = () => {
    if (categories.length === 0) {
      alert("Please create at least one Fee Category first from the 'Fee Categories' tab!");
      return;
    }
    setFormData({
      ...formData,
      heads: [...formData.heads, { category: categories[0]._id, amount: 0 }]
    });
  };

  const handleRemoveHead = (index) => {
    const newHeads = [...formData.heads];
    newHeads.splice(index, 1);
    setFormData({ ...formData, heads: newHeads });
  };

  const handleHeadChange = (index, field, value) => {
    const newHeads = [...formData.heads];
    newHeads[index][field] = value;
    setFormData({ ...formData, heads: newHeads });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateFeeStructureAPI(editId, formData);
      } else {
        await createFeeStructureAPI(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save structure');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this structure?')) {
      try {
        await deleteFeeStructureAPI(id);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete structure');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Fee Structures</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
        >
          <Plus size={16} /> Create Structure
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-dark-800 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 dark:bg-dark-850 dark:text-slate-400">
            <tr>
              <th className="px-6 py-4">Structure Name</th>
              <th className="px-6 py-4">Course & Batch</th>
              <th className="px-6 py-4">Academic Year</th>
              <th className="px-6 py-4 text-right">Total Amount</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center">Loading...</td></tr>
            ) : structures.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center">No structures found.</td></tr>
            ) : (
              structures.map(str => (
                <tr key={str._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-750/30">
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{str.name}</td>
                  <td className="px-6 py-4">{str.course?.name} ({str.batch?.name})</td>
                  <td className="px-6 py-4">{str.academicYear?.name}</td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white text-right">₹ {str.totalAmount?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleOpenModal(str)} className="mr-3 text-brand-500 hover:text-brand-600"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(str._id)} className="text-red-500 hover:text-red-600"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit Fee Structure" : "Create Fee Structure"} hideFooter={true}>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4 max-h-[70vh] overflow-y-auto px-1">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Structure Name</label>
            <input 
              type="text" required 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white"
              placeholder="e.g. B.Tech CS 2024-28 Full Fees"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Course</label>
              <select required value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white">
                <option value="">Select Course</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Batch</label>
              <select required value={formData.batch} onChange={e => setFormData({...formData, batch: e.target.value})} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white">
                <option value="">Select Batch</option>
                {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Academic Year</label>
            <select required value={formData.academicYear} onChange={e => setFormData({...formData, academicYear: e.target.value})} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white">
              <option value="">Select Academic Year</option>
              {academicYears.map(ay => <option key={ay._id} value={ay._id}>{ay.name}</option>)}
            </select>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Fee Heads</h3>
              <button type="button" onClick={handleAddHead} className="text-xs font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1">
                <Plus size={14} /> Add Head
              </button>
            </div>
            {formData.heads.length === 0 ? (
              <p className="text-xs text-slate-500">No fee heads added. Please add at least one.</p>
            ) : (
              <div className="space-y-3">
                {formData.heads.map((head, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <select 
                      required
                      value={head.category} 
                      onChange={e => handleHeadChange(index, 'category', e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white"
                    >
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                    <input 
                      type="number" required min="0"
                      value={head.amount} 
                      onChange={e => handleHeadChange(index, 'amount', Number(e.target.value))}
                      className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white"
                      placeholder="Amount"
                    />
                    <button type="button" onClick={() => handleRemoveHead(index)} className="text-red-500 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                ))}
                <div className="text-right font-semibold text-sm pt-2 text-slate-800 dark:text-white">
                  Total: ₹ {formData.heads.reduce((sum, h) => sum + (h.amount || 0), 0).toLocaleString()}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Cancel</button>
            <button type="submit" disabled={formData.heads.length === 0} className="rounded-lg bg-brand-500 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50">Save Structure</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FeeStructuresTab;

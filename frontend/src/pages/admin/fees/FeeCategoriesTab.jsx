import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { getFeeCategoriesAPI, createFeeCategoryAPI, updateFeeCategoryAPI, deleteFeeCategoryAPI } from '../../../api/fees.api';
import Modal from '../../../components/common/Modal';

const FeeCategoriesTab = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isOptional: false
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getFeeCategoriesAPI();
      if (res.data?.data) {
        setCategories(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditId(category._id);
      setFormData({
        name: category.name,
        description: category.description || '',
        isOptional: category.isOptional || false
      });
    } else {
      setEditId(null);
      setFormData({ name: '', description: '', isOptional: false });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateFeeCategoryAPI(editId, formData);
      } else {
        await createFeeCategoryAPI(formData);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteFeeCategoryAPI(id);
        fetchCategories();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Fee Categories</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-dark-800 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 dark:bg-dark-850 dark:text-slate-400">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center">Loading...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center">No categories found.</td></tr>
            ) : (
              categories.map(cat => (
                <tr key={cat._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-750/30">
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{cat.name}</td>
                  <td className="px-6 py-4">{cat.description || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      cat.isOptional ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {cat.isOptional ? 'Optional' : 'Mandatory'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleOpenModal(cat)} className="mr-3 text-brand-500 hover:text-brand-600"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(cat._id)} className="text-red-500 hover:text-red-600"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit Category" : "Add Category"} hideFooter={true}>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Category Name</label>
            <input 
              type="text" required 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white"
              placeholder="e.g. Tuition Fee"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <input 
              type="text" 
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" id="isOptional"
              checked={formData.isOptional} onChange={e => setFormData({...formData, isOptional: e.target.checked})}
              className="rounded text-brand-500 focus:ring-brand-500"
            />
            <label htmlFor="isOptional" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Is Optional (e.g. Hostel, Transport)
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Cancel</button>
            <button type="submit" className="rounded-lg bg-brand-500 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-600">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FeeCategoriesTab;

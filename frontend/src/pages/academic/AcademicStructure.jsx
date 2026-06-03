import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Folder, Plus, Book, BookOpen, Calendar, Edit2, Trash2, Loader2 } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { getColleges, getDepartments, getCourses, getBatches, createDepartment, createCourse, createBatch, deleteDepartment, deleteCourse, deleteBatch } from '../../api/academic.api';

const TreeNode = ({ label, icon: Icon, children, onAdd, onEdit, onDelete, colorClass }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = children && React.Children.count(children) > 0;

  return (
    <div className="ml-4 mt-2">
      <div 
        className={`group flex items-center justify-between rounded-lg border border-transparent p-2 transition-all hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-800 dark:hover:bg-dark-800/50 ${isOpen ? 'bg-slate-50/50 dark:bg-dark-800/30' : ''}`}
      >
        <div 
          className="flex flex-1 cursor-pointer items-center gap-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex h-5 w-5 items-center justify-center text-slate-400">
            {hasChildren ? (
              isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
            ) : <span className="w-4"></span>}
          </div>
          <Icon size={18} className={colorClass} />
          <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {onAdd && (
            <button onClick={(e) => { e.stopPropagation(); onAdd(); }} className="rounded p-1.5 text-slate-400 hover:bg-white hover:text-brand-500 hover:shadow-sm dark:hover:bg-dark-700" title="Add Child">
              <Plus size={14} />
            </button>
          )}
          {onEdit && (
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="rounded p-1.5 text-slate-400 hover:bg-white hover:text-blue-500 hover:shadow-sm dark:hover:bg-dark-700" title="Edit">
              <Edit2 size={14} />
            </button>
          )}
          {onDelete && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="rounded p-1.5 text-slate-400 hover:bg-white hover:text-red-500 hover:shadow-sm dark:hover:bg-dark-700" title="Delete">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      
      {/* Children Container */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="ml-5 border-l-2 border-slate-100 pl-2 dark:border-slate-800/50">
          {children}
        </div>
      </div>
    </div>
  );
};

const AcademicStructure = () => {
  const [data, setData] = useState({ college: null, departments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalParentId, setModalParentId] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [colRes, deptRes, courseRes, batchRes] = await Promise.all([
        getColleges(),
        getDepartments(),
        getCourses(),
        getBatches()
      ]);

      const college = colRes.data.data[0] || { name: 'State Institute of Technology', code: 'SIT' };
      const depts = deptRes.data.data || [];
      const courses = courseRes.data.data || [];
      const batches = batchRes.data.data || [];

      // Build Tree
      const tree = depts.map(d => ({
        ...d,
        courses: courses.filter(c => c.department === d._id || c.department?._id === d._id).map(c => ({
          ...c,
          batches: batches.filter(b => b.courseId === c._id || b.courseId?._id === c._id)
        }))
      }));

      setData({ college, departments: tree });
    } catch (err) {
      setError('Failed to load academic structure');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (type, parentId = null) => {
    setModalType(type);
    setModalParentId(parentId);
    setFormData({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modalType === 'Add Department') {
        await createDepartment({ ...formData, collegeId: data.college._id });
      } else if (modalType === 'Add Course') {
        await createCourse({ ...formData, department: modalParentId });
      } else if (modalType === 'Add Batch') {
        await createBatch({ ...formData, courseId: modalParentId });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      if (type === 'Department') await deleteDepartment(id);
      if (type === 'Course') await deleteCourse(id);
      if (type === 'Batch') await deleteBatch(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-brand-500" size={32} /></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Academic Structure</h1>
          <p className="text-sm text-slate-500">Manage Departments, Courses, and Batches hierarchy.</p>
        </div>
        <button 
          onClick={() => handleOpenModal('Add Department')}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-700"
        >
          <Plus size={16} />
          Add Department
        </button>
      </div>

      {error && <div className="text-red-500">{error}</div>}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-dark-900">
        
        {/* Root Node (College) */}
        {data.college && (
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 border border-slate-100 dark:bg-dark-800/80 dark:border-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">{data.college.name}</h3>
              <p className="text-xs text-slate-500">College Code: {data.college.code}</p>
            </div>
          </div>
        )}

        {/* Tree Render */}
        <div className="mt-4">
          {data.departments.map(dept => (
            <TreeNode 
              key={dept._id} 
              label={`${dept.name} (${dept.code})`} 
              icon={Folder} 
              colorClass="text-brand-500"
              onAdd={() => handleOpenModal('Add Course', dept._id)}
              onDelete={() => handleDelete('Department', dept._id)}
            >
              {dept.courses.map(course => (
                <TreeNode 
                  key={course._id} 
                  label={`${course.name} (${course.code})`} 
                  icon={Book} 
                  colorClass="text-indigo-500"
                  onAdd={() => handleOpenModal('Add Batch', course._id)}
                  onDelete={() => handleDelete('Course', course._id)}
                >
                  {course.batches.map(batch => (
                    <TreeNode 
                      key={batch._id} 
                      label={`Batch: ${batch.name} (${batch.startYear}-${batch.endYear})`} 
                      icon={Calendar} 
                      colorClass="text-emerald-500"
                      onDelete={() => handleDelete('Batch', batch._id)}
                    />
                  ))}
                </TreeNode>
              ))}
            </TreeNode>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalType} hideFooter={true}>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          
          {modalType.includes('Department') && (
            <>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department Name</label>
                <input required type="text" onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white mt-1" placeholder="e.g. Computer Science" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department Code</label>
                <input required type="text" onChange={e => setFormData({...formData, code: e.target.value})} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white mt-1" placeholder="e.g. CSE" />
              </div>
            </>
          )}

          {modalType.includes('Course') && (
            <>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Course Name</label>
                <input required type="text" onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white mt-1" placeholder="e.g. B.Tech IT" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Course Code</label>
                  <input required type="text" onChange={e => setFormData({...formData, code: e.target.value})} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white mt-1" placeholder="e.g. BTECH-IT" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Duration (Semesters)</label>
                  <input required type="number" min="1" max="12" onChange={e => setFormData({...formData, durationSemesters: parseInt(e.target.value, 10)})} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white mt-1" placeholder="e.g. 8" />
                </div>
              </div>
            </>
          )}

          {modalType.includes('Batch') && (
            <>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Batch Name</label>
                <input required type="text" onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white mt-1" placeholder="e.g. 2021-2025" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Start Year</label>
                  <input required type="number" onChange={e => setFormData({...formData, startYear: e.target.value})} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white mt-1" placeholder="2021" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">End Year</label>
                  <input required type="number" onChange={e => setFormData({...formData, endYear: e.target.value})} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white mt-1" placeholder="2025" />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-dark-800">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
              {submitting ? <Loader2 size={16} className="animate-spin mr-2" /> : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AcademicStructure;

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, BookOpen, Search, Filter } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { 
  getSubjects, 
  createSubject, 
  updateSubject, 
  deleteSubject,
  getDepartments,
  getCourses,
  getSemesters 
} from '../../api/academic.api';
import toast from 'react-hot-toast';

const selectCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800";
const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800";
const labelCls = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Data for selects
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);

  // Filters
  const [filters, setFilters] = useState({ department: '', course: '', semester: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 10 });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', code: '', department: '', course: '', semester: '', 
    credits: 3, type: 'Theory', maxMarks: 100, passingMarks: 40, syllabus: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Load Dependencies
  useEffect(() => {
    Promise.all([
      getDepartments(),
      getCourses(),
      getSemesters()
    ]).then(([deptRes, courseRes, semRes]) => {
      setDepartments(deptRes.data?.data || []);
      setCourses(courseRes.data?.data || []);
      setSemesters(semRes.data?.data || []);
    }).catch(err => {
      toast.error('Failed to load dependency data');
    });
  }, []);

  // Load Subjects based on filters
  async function fetchSubjects() {
    setLoading(true);
    try {
      const query = { page: currentPage, limit: 10 };
      if (filters.department) query.department = filters.department;
      if (filters.course) query.course = filters.course;
      if (filters.semester) query.semester = filters.semester;
      
      const res = await getSubjects(query);
      if (res.data?.data?.subjects) {
        setSubjects(res.data.data.subjects);
        setPagination(res.data.data.pagination);
      } else {
        setSubjects(res.data?.data || []);
      }
    } catch (err) {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    fetchSubjects();
  }, [filters, currentPage]);

  // Derived filtered courses for the form
  const formCourses = courses.filter(c => !formData.department || c.department === formData.department || c.department?._id === formData.department);

  const handleOpenModal = (subject = null) => {
    if (subject) {
      setEditingId(subject._id);
      setFormData({
        name: subject.name,
        code: subject.code,
        department: subject.department?._id || subject.department,
        course: subject.course?._id || subject.course,
        semester: subject.semester?._id || subject.semester,
        credits: subject.credits,
        type: subject.type || 'Theory',
        maxMarks: subject.maxMarks || 100,
        passingMarks: subject.passingMarks || 40,
        syllabus: subject.syllabus || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', code: '', department: filters.department || '', 
        course: filters.course || '', semester: filters.semester || '', 
        credits: 3, type: 'Theory', maxMarks: 100, passingMarks: 40, syllabus: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await updateSubject(editingId, formData);
        toast.success('Subject updated successfully');
      } else {
        await createSubject(formData);
        toast.success('Subject created successfully');
      }
      setIsModalOpen(false);
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      await deleteSubject(id);
      toast.success('Subject deleted');
      fetchSubjects();
    } catch (err) {
      toast.error('Failed to delete subject');
    }
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Subjects Management</h1>
          <p className="text-sm text-slate-500">Manage all subjects, credits, and syllabi across courses.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-700"
        >
          <Plus size={16} /> Add Subject
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-dark-900 shadow-sm overflow-hidden">
        {/* Filters and Search */}
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-dark-800/50 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <Filter size={16} className="text-slate-400" />
            <select value={filters.department} onChange={e => setFilters({...filters, department: e.target.value, course: ''})} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none dark:border-slate-700 dark:bg-dark-900">
              <option value="">All Departments</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
            <select value={filters.course} onChange={e => setFilters({...filters, course: e.target.value})} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none dark:border-slate-700 dark:bg-dark-900">
              <option value="">All Courses</option>
              {courses.filter(c => !filters.department || c.department === filters.department || c.department?._id === filters.department).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <select value={filters.semester} onChange={e => setFilters({...filters, semester: e.target.value})} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none dark:border-slate-700 dark:bg-dark-900">
              <option value="">All Semesters</option>
              {semesters.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search subjects..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none dark:border-slate-700 dark:bg-dark-900 w-64"
            />
          </div>
        </div>

        {/* Subjects Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-brand-500" size={24} /></div>
          ) : filteredSubjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
              <BookOpen size={32} className="mb-3 opacity-40" />
              <p>No subjects found.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-dark-800/80">
                <tr>
                  <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Code & Name</th>
                  <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Course & Sem</th>
                  <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Type</th>
                  <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Credits</th>
                  <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Marks</th>
                  <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredSubjects.map(sub => (
                  <tr key={sub._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-800/30">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{sub.code}</div>
                      <div className="text-slate-500 dark:text-slate-400">{sub.name}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-700 dark:text-slate-300">{sub.course?.name || '-'}</div>
                      <div className="text-xs text-slate-500">{sub.semester?.name || '-'}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${sub.type === 'Practical' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        {sub.type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                      {sub.credits}
                    </td>
                    <td className="p-4 text-slate-500 text-xs">
                      Max: {sub.maxMarks} <br/> Pass: {sub.passingMarks}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(sub)} className="p-1.5 text-slate-400 hover:text-brand-500 rounded hover:bg-slate-100 dark:hover:bg-dark-700"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(sub._id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100 dark:hover:bg-dark-700"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && subjects.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-dark-800/50">
            <span className="text-sm text-slate-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} subjects
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-dark-900 dark:text-slate-300 dark:hover:bg-dark-800"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 w-8 rounded-lg text-sm font-medium ${
                      currentPage === page
                        ? 'bg-brand-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-dark-800'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                disabled={currentPage === pagination.pages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-dark-900 dark:text-slate-300 dark:hover:bg-dark-800"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Subject' : 'Add Subject'} hideFooter={true}>
        <form onSubmit={handleSubmit} className="space-y-4 py-2 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={labelCls}>Subject Name *</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputCls} placeholder="e.g. Data Structures" />
            </div>
            
            <div>
              <label className={labelCls}>Subject Code *</label>
              <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className={inputCls} placeholder="e.g. CS201" />
            </div>
            
            <div>
              <label className={labelCls}>Type *</label>
              <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className={selectCls}>
                <option value="Theory">Theory</option>
                <option value="Practical">Practical</option>
                <option value="Elective">Elective</option>
                <option value="Tutorial">Tutorial</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Department *</label>
              <select required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value, course: ''})} className={selectCls}>
                <option value="">Select Dept</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className={labelCls}>Course *</label>
              <select required value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} disabled={!formData.department} className={selectCls}>
                <option value="">Select Course</option>
                {formCourses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className={labelCls}>Semester *</label>
              <select required value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} className={selectCls}>
                <option value="">Select Semester</option>
                {semesters.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>Credits *</label>
              <input type="number" min="1" max="10" required value={formData.credits} onChange={e => setFormData({...formData, credits: parseInt(e.target.value) || 0})} className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Max Marks</label>
              <input type="number" required value={formData.maxMarks} onChange={e => setFormData({...formData, maxMarks: parseInt(e.target.value) || 0})} className={inputCls} />
            </div>
            
            <div>
              <label className={labelCls}>Passing Marks</label>
              <input type="number" required value={formData.passingMarks} onChange={e => setFormData({...formData, passingMarks: parseInt(e.target.value) || 0})} className={inputCls} />
            </div>

            <div className="md:col-span-2">
              <label className={labelCls}>Syllabus / Notes</label>
              <textarea rows="2" value={formData.syllabus} onChange={e => setFormData({...formData, syllabus: e.target.value})} className={inputCls} placeholder="Optional syllabus or notes..."></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-dark-800">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
              {submitting ? <Loader2 size={16} className="animate-spin mr-2" /> : 'Save Subject'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SubjectsPage;

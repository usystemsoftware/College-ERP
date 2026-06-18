import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Search, GraduationCap, Briefcase, MapPin, Linkedin, Plus, X } from 'lucide-react';
import { getAllAlumniAPI, createOrUpdateAlumniAPI } from '../../api/alumni.api';
import { getStudentsAPI } from '../../api/students.api';
import toast from 'react-hot-toast';

const AlumniModal = ({ onClose, onSuccess, initialData = null }) => {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState(initialData || {
    studentId: '',
    graduationYear: new Date().getFullYear(),
    currentCompany: '',
    designation: '',
    industry: '',
    linkedinUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch students to populate dropdown (in a real app, you'd use an autocomplete/searchable dropdown)
    const fetchStudents = async () => {
      try {
        const res = await getStudentsAPI({ limit: 100 });
        setStudents(res.data?.data?.students || []);
      } catch (err) {
        toast.error('Failed to load students');
      }
    };
    if (!initialData) fetchStudents();
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await createOrUpdateAlumniAPI(formData);
      toast.success(initialData ? 'Alumni profile updated' : 'Alumni profile created');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save alumni profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-dark-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {initialData ? 'Edit Alumni Profile' : 'Add Alumni Profile'}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-dark-800 dark:hover:text-slate-300">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!initialData && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Student</label>
              <select
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-dark-700 dark:bg-dark-950 dark:text-white"
              >
                <option value="">Select a student...</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>{s.personalDetails.fullName} ({s.rollNumber})</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Graduation Year</label>
              <input
                type="number"
                required
                value={formData.graduationYear}
                onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-dark-700 dark:bg-dark-950 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g. IT, Finance"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-dark-700 dark:bg-dark-950 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Current Company</label>
            <input
              type="text"
              value={formData.currentCompany}
              onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
              placeholder="e.g. Google"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-dark-700 dark:bg-dark-950 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Designation</label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              placeholder="e.g. Software Engineer"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-dark-700 dark:bg-dark-950 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">LinkedIn Profile</label>
            <input
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/in/..."
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-dark-700 dark:bg-dark-950 dark:text-white"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-dark-700 dark:bg-dark-900 dark:text-slate-300">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AlumniDirectory = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = ['Super Admin', 'College Admin'].includes(user?.role?.name || user?.role);

  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const res = await getAllAlumniAPI();
      setAlumni(res.data?.data?.alumniList || []);
    } catch (err) {
      toast.error('Failed to load alumni directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  const filteredAlumni = alumni.filter(a => {
    const searchStr = searchQuery.toLowerCase();
    const name = a.student?.personalDetails?.fullName?.toLowerCase() || '';
    const company = a.currentCompany?.toLowerCase() || '';
    const industry = a.industry?.toLowerCase() || '';
    return name.includes(searchStr) || company.includes(searchStr) || industry.includes(searchStr);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="text-brand-500" /> Alumni Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">Connect with graduates and explore their career journeys.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search alumni..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm focus:border-brand-500 focus:outline-none dark:border-dark-700 dark:bg-dark-900 dark:text-white"
            />
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              <Plus size={16} /> Add Alumni
            </button>
          )}
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"></div>
        </div>
      ) : filteredAlumni.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 dark:border-slate-700 dark:bg-dark-800/50">
          <GraduationCap size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-lg font-medium text-slate-900 dark:text-white">No Alumni Found</p>
          <p className="text-sm text-slate-500 mt-1">We couldn't find any alumni matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAlumni.map((alum) => (
            <div key={alum._id} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-dark-800 dark:bg-dark-900">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                  {alum.student?.personalDetails?.fullName?.charAt(0) || 'A'}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                    {alum.student?.personalDetails?.fullName || 'Unknown Student'}
                  </h3>
                  <p className="text-xs font-medium text-brand-600 dark:text-brand-400">Class of {alum.graduationYear}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-start gap-2">
                  <Briefcase size={16} className="mt-0.5 shrink-0 text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-300">{alum.designation || 'Professional'}</p>
                    <p className="text-xs">{alum.currentCompany || alum.industry || 'No company listed'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="shrink-0 text-slate-400" />
                  <span className="truncate">{alum.student?.department?.name || 'Department'}</span>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4 dark:border-dark-800">
                {alum.linkedinUrl ? (
                  <a
                    href={alum.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
                  >
                    <Linkedin size={16} /> View LinkedIn
                  </a>
                ) : (
                  <button disabled className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-slate-50 px-4 py-2 text-sm font-medium text-slate-400 dark:bg-dark-800">
                    No Profile Available
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AlumniModal 
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchAlumni();
          }}
        />
      )}
    </div>
  );
};

export default AlumniDirectory;

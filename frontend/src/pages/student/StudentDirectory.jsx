import React, { useState, useEffect } from 'react';
import { Search, Filter, Phone, MoreVertical, Loader2, Edit2, Trash2, CheckCircle2, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import Modal from '../../components/common/Modal';
import LottieLoader from '../../components/common/LottieLoader';
import { fetchStudents, createStudent, updateStudent, deleteStudent } from '../../features/students/studentSlice';
import { getDepartments, getCourses, getSemesters } from '../../api/academic.api';

const StudentDirectory = () => {
  const dispatch = useDispatch();
  const { list: students, loading, error } = useSelector((state) => state.students);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editStudentId, setEditStudentId] = useState(null);
  const [toast, setToast] = useState(null);
  
  // Academic Form Data
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [fetchingOptions, setFetchingOptions] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();

  const selectedCourseId = watch('course');
  const selectedCourse = courses.find(c => c._id === selectedCourseId);
  const maxSemesters = selectedCourse ? selectedCourse.durationSemesters : 8;
  const filteredSemesters = semesters.slice(0, maxSemesters);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  useEffect(() => {
    if (isModalOpen && departments.length === 0) {
      async function fetchOptions() {
        setFetchingOptions(true);
        try {
          const [deptRes, courseRes, semRes] = await Promise.all([
            getDepartments(), getCourses(), getSemesters()
          ]);
          setDepartments(deptRes.data?.data || []);
          setCourses(courseRes.data?.data || []);
          setSemesters(semRes.data?.data || []);
        } catch (err) {
          console.error("Failed to fetch academic options", err);
        } finally {
          setFetchingOptions(false);
        }
      };
      fetchOptions();
    }
  }, [isModalOpen, departments.length]);

  const handleOpenAdd = () => {
    setEditStudentId(null);
    reset({
      fullName: '', email: '', password: '', phone: '', enrollmentNumber: '', rollNumber: '',
      department: '', course: '', semester: '', dob: '', gender: 'Male', division: '', batch: '', address: '',
      parentEmail: '', parentPassword: ''
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (student) => {
    setEditStudentId(student._id);
    reset({
      fullName: student.personalDetails?.fullName || '',
      email: student.user?.email || '',
      password: '', // leave empty
      phone: student.personalDetails?.phone || '',
      enrollmentNumber: student.enrollmentNumber || '',
      rollNumber: student.rollNumber || '',
      department: student.department?._id || '',
      course: student.course?._id || '',
      semester: student.semester?._id || '',
      dob: student.personalDetails?.dob ? new Date(student.personalDetails.dob).toISOString().split('T')[0] : '',
      gender: student.personalDetails?.gender || 'Male',
      division: student.division || '',
      batch: student.batch || '',
      address: student.personalDetails?.address || '',
      parentEmail: student.parent?.email || '',
      parentPassword: '' // leave empty
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      dispatch(deleteStudent(id)).then((res) => {
        if (res.error) {
          showToast(res.payload || 'Failed to delete student', 'error');
        } else {
          showToast('Student deleted successfully!');
        }
      });
    }
  };

  const onSubmit = async (data) => {
    // Transform data for backend
    const payload = {
      email: data.email,
      password: data.password,
      rollNumber: data.rollNumber,
      enrollmentNumber: data.enrollmentNumber,
      department: data.department,
      course: data.course,
      semester: data.semester,
      division: data.division,
      batch: data.batch,
      personalDetails: {
        fullName: data.fullName,
        dob: data.dob,
        gender: data.gender,
        phone: data.phone,
        address: data.address
      },
      parentEmail: data.parentEmail,
      parentPassword: data.parentPassword
    };

    if (editStudentId) {
      if (!data.password) delete payload.password; // Don't send empty password on edit
      const res = await dispatch(updateStudent({ id: editStudentId, data: payload }));
      if (!res.error) {
        setIsModalOpen(false);
        setEditStudentId(null);
        reset();
        showToast(`Student updated successfully! ✅`);
      } else {
        showToast(res.payload || 'Failed to update student', 'error');
      }
    } else {
      const res = await dispatch(createStudent(payload));
      if (!res.error) {
        setIsModalOpen(false);
        reset();
        showToast(`Student "${data.fullName}" added successfully! 🎉`);
      } else {
        showToast(res.payload || 'Failed to create student', 'error');
      }
    }
  };

  const filteredStudents = (students || []).filter(student => 
    student.personalDetails?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.enrollmentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 rounded-xl px-5 py-4 shadow-2xl text-sm font-semibold transition-all duration-300 ${
          toast.type === 'error'
            ? 'bg-red-600 text-white'
            : 'bg-emerald-600 text-white'
        }`}>
          <CheckCircle2 size={18} />
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-75 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Directory</h1>
          <p className="text-sm text-slate-500">Manage and view all enrolled students.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700 transition-colors"
        >
          Add New Student
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-500 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-dark-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by name or Enrollment ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white"
            />
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-dark-800 transition-colors">
            <Filter size={16} />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 font-semibold text-slate-500 dark:bg-dark-800">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Enrollment ID</th>
                <th className="px-6 py-4">Course & Sem</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    <LottieLoader size={60} />
                    <p className="mt-2">Loading students...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 font-bold">
                          {student.personalDetails?.fullName?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{student.personalDetails?.fullName}</p>
                          <p className="text-xs text-slate-500">{student.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">{student.enrollmentNumber}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900 dark:text-slate-300">{student.course?.name}</p>
                      <p className="text-xs text-slate-500">{student.semester?.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1 text-xs"><Phone size={12}/> {student.personalDetails?.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        student.user?.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {student.user?.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEditClick(student)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-dark-700 dark:hover:text-slate-300 transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteClick(student._id)} className="rounded-lg p-1 text-slate-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors">
                          <Trash2 size={16} />
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editStudentId ? "Edit Student" : "Add New Student"} hideFooter={true}>
        {fetchingOptions ? (
          <LottieLoader size={60} className="py-8" />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
              <input 
                {...register('fullName', { required: true })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white" 
                placeholder="Enter full name" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                <input 
                  type="email"
                  {...register('email', { required: true })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white" 
                  placeholder="student@erp.com" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <input 
                  type="password"
                  {...register('password', { required: !editStudentId })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white" 
                  placeholder={editStudentId ? "Leave empty to keep same" : "Secret password"} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                <input 
                  {...register('phone', { required: true })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white" 
                  placeholder="Phone number" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Enrollment Number</label>
                <input 
                  {...register('enrollmentNumber', { required: true })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Roll Number</label>
                <input 
                  {...register('rollNumber', { required: true })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department</label>
                <select {...register('department', { required: true })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white">
                  <option value="">Select Dept</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Course</label>
                <select {...register('course', { required: true })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white">
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Semester</label>
                <select {...register('semester', { required: true })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white">
                  <option value="">Select Semester</option>
                  {filteredSemesters.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">DOB</label>
                <input type="date" {...register('dob', { required: true })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
                <select {...register('gender', { required: true })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Division</label>
                <select {...register('division', { required: true })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white">
                  <option value="Division A">Division A</option>
                  <option value="Division B">Division B</option>
                  <option value="Division C">Division C</option>
                  <option value="Division D">Division D</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Batch</label>
                <input {...register('batch', { required: true })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white" placeholder="e.g. 2023-2027" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
              <input {...register('address', { required: true })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white" placeholder="Full Address" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Parent Email (Optional)</label>
                <input 
                  type="email"
                  {...register('parentEmail')}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white" 
                  placeholder="parent@example.com" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Parent Password</label>
                <input 
                  type="password"
                  {...register('parentPassword')}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white" 
                  placeholder="Parent account password" 
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
              {loading ? 'Creating...' : 'Submit'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default StudentDirectory;

import React, { useEffect, useState } from 'react';
import { Building, BookOpen, Plus, Search, Trash2, Edit2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDepartments, getCourses, createDepartment, createCourse, updateDepartment, updateCourse, deleteDepartment, deleteCourse } from '../../api/academic.api';
import { getFacultyAPI } from '../../api/faculty.api';
import Modal from '../../components/common/Modal';
import client from '../../api/client';

const DepartmentsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // View Students Modal
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState(null);
  const [courseStudents, setCourseStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [deptForm, setDeptForm] = useState({ _id: null, name: '', code: '', hod: '' });
  const [courseForm, setCourseForm] = useState({ _id: null, name: '', code: '', department: '', durationSemesters: 8 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, courseRes, facultyRes] = await Promise.all([
        getDepartments(),
        getCourses(),
        getFacultyAPI({ limit: 100 })
      ]);
      if (deptRes.data?.data) setDepartments(deptRes.data.data);
      if (courseRes.data?.data) setCourses(courseRes.data.data);
      if (facultyRes.data?.data?.faculty) setFacultyList(facultyRes.data.data.faculty);
    } catch (error) {
      console.error('Failed to fetch departments/courses/faculty', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...deptForm };
      if (!payload.hod) {
        payload.hod = null; // or delete payload.hod
      }

      if (editMode && deptForm._id) {
        await updateDepartment(deptForm._id, payload);
      } else {
        await createDepartment(payload);
      }
      setIsDeptModalOpen(false);
      setDeptForm({ _id: null, name: '', code: '', hod: '' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save department');
    }
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    if (!courseForm.department) {
      alert("Please select a department");
      return;
    }
    try {
      if (editMode && courseForm._id) {
        await updateCourse(courseForm._id, courseForm);
      } else {
        await createCourse(courseForm);
      }
      setIsCourseModalOpen(false);
      setCourseForm({ _id: null, name: '', code: '', department: '', durationSemesters: 8 });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save course');
    }
  };

  const handleDeleteDept = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await deleteDepartment(id);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete');
      }
    }
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse(id);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete');
      }
    }
  };

  const handleViewStudents = async (course) => {
    setSelectedCourseForStudents(course);
    setCourseStudents([]);
    setIsStudentsModalOpen(true);
    setLoadingStudents(true);
    try {
      const response = await client.get(`/students?course=${course._id}&limit=500`);
      if (response.data.success) {
        setCourseStudents(response.data.data.students);
      }
    } catch (error) {
      console.error('Error fetching students for course', error);
      alert('Failed to fetch students');
    } finally {
      setLoadingStudents(false);
    }
  };

  const filteredData = activeTab === 'departments'
    ? departments.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.code.toLowerCase().includes(searchTerm.toLowerCase()))
    : courses.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Academic Structure</h1>
          <p className="text-sm text-slate-500">Manage departments, courses, and programs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditMode(false);
              if (activeTab === 'departments') {
                setDeptForm({ _id: null, name: '', code: '', hod: '' });
                setIsDeptModalOpen(true);
              } else {
                setCourseForm({ _id: null, name: '', code: '', department: '', durationSemesters: 8 });
                setIsCourseModalOpen(true);
              }
            }}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
          >
            <Plus size={16} />
            Add {activeTab === 'departments' ? 'Department' : 'Course'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-dark-800">
        <div className="flex items-center border-b border-slate-200 px-5 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('departments')}
            className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors ${activeTab === 'departments' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
          >
            <Building size={16} /> Departments
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors ${activeTab === 'courses' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
          >
            <BookOpen size={16} /> Courses
          </button>
        </div>

        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm outline-none focus:border-brand-500 focus:bg-white dark:border-slate-850 dark:bg-dark-900 dark:focus:bg-dark-950"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"></div>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-dark-850 dark:text-slate-400">
                <tr>
                  {activeTab === 'departments' ? (
                    <>
                      <th className="px-6 py-4">Department Name</th>
                      <th className="px-6 py-4">Code</th>
                      <th className="px-6 py-4">HOD</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4">Course Name</th>
                      <th className="px-6 py-4">Code</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">Duration (Sems)</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-750/30">
                      {activeTab === 'departments' ? (
                        <>
                          <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{item.name}</td>
                          <td className="px-6 py-4 font-medium text-brand-600 dark:text-brand-400">{item.code}</td>
                          <td className="px-6 py-4">{item.hod?.fullName || 'Not Assigned'}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => {
                                setEditMode(true);
                                setDeptForm({
                                  _id: item._id,
                                  name: item.name,
                                  code: item.code,
                                  hod: item.hod?._id || ''
                                });
                                setIsDeptModalOpen(true);
                              }}
                              className="rounded-lg p-1 text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/30 dark:hover:text-brand-400 mr-2"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteDept(item._id)} className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{item.name}</td>
                          <td className="px-6 py-4 font-medium text-brand-600 dark:text-brand-400">{item.code}</td>
                          <td className="px-6 py-4">{item.department?.name || 'Unknown'}</td>
                          <td className="px-6 py-4">{item.durationSemesters}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleViewStudents(item)}
                              title="View Students"
                              className="rounded-lg p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 mr-2"
                            >
                              <Users size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setEditMode(true);
                                setCourseForm({
                                  _id: item._id,
                                  name: item.name,
                                  code: item.code,
                                  department: item.department?._id || '',
                                  durationSemesters: item.durationSemesters
                                });
                                setIsCourseModalOpen(true);
                              }}
                              className="rounded-lg p-1 text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/30 dark:hover:text-brand-400 mr-2"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteCourse(item._id)} className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={activeTab === 'departments' ? 4 : 5} className="px-6 py-12 text-center text-slate-500">
                      No {activeTab} found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Department Modal */}
      <Modal isOpen={isDeptModalOpen} onClose={() => setIsDeptModalOpen(false)} title={editMode ? "Edit Department" : "Add Department"} hideFooter={true}>
        <form className="space-y-4 mt-2" onSubmit={handleDeptSubmit}>

          {/* Existing Departments quick-view */}
          {!editMode && departments.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Existing Departments ({departments.length})
              </p>
              <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
                {departments.map((dept) => (
                  <button
                    key={dept._id}
                    type="button"
                    title="Click to view timetable for this department"
                    onClick={() => {
                      setIsDeptModalOpen(false);
                      navigate('/timetable', { state: { departmentId: dept._id, departmentName: dept.name } });
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-brand-50 dark:hover:bg-brand-900/20 group transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-12 items-center justify-center rounded bg-brand-100 text-[10px] font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 flex-shrink-0">
                        {dept.code}
                      </span>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                        {dept.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[90px]">
                        {dept.hod?.fullName || 'No HOD'}
                      </span>
                      <Calendar size={13} className="text-slate-300 group-hover:text-brand-400 dark:text-slate-600 dark:group-hover:text-brand-400 flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Department Name</label>
            <input required type="text" value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800" placeholder="e.g. Computer Science" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Department Code</label>
            <input required type="text" value={deptForm.code} onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800" placeholder="e.g. CSE" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Head of Department (HOD)</label>
            <select value={deptForm.hod} onChange={(e) => setDeptForm({ ...deptForm, hod: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800">
              <option value="">Select HOD (Optional)</option>
              {facultyList.map((faculty) => (
                <option key={faculty._id} value={faculty._id}>{faculty.fullName} ({faculty.employeeId})</option>
              ))}
            </select>
          </div>
          <div className="mt-6 flex justify-end gap-3 flex-shrink-0 pt-4">
            <button type="button" onClick={() => setIsDeptModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-dark-800">Cancel</button>
            <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">{editMode ? 'Update' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      {/* Add/Edit Course Modal */}
      <Modal isOpen={isCourseModalOpen} onClose={() => setIsCourseModalOpen(false)} title={editMode ? "Edit Course" : "Add Course"} hideFooter={true}>
        <form className="space-y-4 mt-2" onSubmit={handleCourseSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Course Name</label>
            <input required type="text" value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800" placeholder="e.g. B.Tech Computer Science" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Course Code</label>
            <input required type="text" value={courseForm.code} onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value.toUpperCase() })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800" placeholder="e.g. BTECH-CSE" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Department</label>
            <select required value={courseForm.department} onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800">
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Duration (Semesters)</label>
            <input required type="number" min="1" max="12" value={courseForm.durationSemesters} onChange={(e) => setCourseForm({ ...courseForm, durationSemesters: parseInt(e.target.value) })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800" />
          </div>
          <div className="mt-6 flex justify-end gap-3 flex-shrink-0 pt-4">
            <button type="button" onClick={() => setIsCourseModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-dark-800">Cancel</button>
            <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">{editMode ? 'Update' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      {/* View Students Modal */}
      <Modal
        isOpen={isStudentsModalOpen}
        onClose={() => setIsStudentsModalOpen(false)}
        title={`Enrolled Students - ${selectedCourseForStudents?.name}`}
        hideFooter={true}
        maxWidth="max-w-4xl"
      >
        <div className="pt-2">
          {loadingStudents ? (
            <div className="flex justify-center items-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"></div>
            </div>
          ) : courseStudents.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Users className="mx-auto h-12 w-12 opacity-20 mb-3" />
              <p>No students are currently enrolled in this course.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courseStudents.map(student => (
                <div key={student._id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-800">
                  <img
                    src={student.user?.profileImage || `https://ui-avatars.com/api/?name=${student.personalDetails?.fullName}&background=random`}
                    alt={student.personalDetails?.fullName}
                    className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div className="flex-1 overflow-hidden">
                    <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">{student.personalDetails?.fullName}</div>
                    <div className="text-xs text-slate-500 truncate">
                      Student ID: <span className="font-mono text-slate-600 dark:text-slate-400">{student.enrollmentNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default DepartmentsPage;

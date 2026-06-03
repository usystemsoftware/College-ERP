import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudents } from '../../features/students/studentSlice';
import { Search, Plus, Filter, MoreVertical, Download } from 'lucide-react';

const StudentsPage = () => {
  const dispatch = useDispatch();
  const { list: students, loading, error, pagination } = useSelector((state) => state.students);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchStudents({ limit: 50 }));
  }, [dispatch]);

  const filteredStudents = students.filter(student => 
    student.personalDetails?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Students Directory</h1>
          <p className="text-sm text-slate-500">Manage student profiles, academic records, and enrollments.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-dark-800 dark:hover:bg-dark-750">
            <Download size={16} />
            Export
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600">
            <Plus size={16} />
            Add Student
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-dark-800">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or roll no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm outline-none focus:border-brand-500 focus:bg-white dark:border-slate-850 dark:bg-dark-900 dark:focus:bg-dark-950"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-dark-750">
              <Filter size={16} /> Filters
            </button>
          </div>
        </div>

        {/* Data Table */}
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
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Roll Number</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Semester</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-750/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={student.user?.profileImage || `https://ui-avatars.com/api/?name=${student.personalDetails?.fullName}&background=random`} 
                            alt={student.personalDetails?.fullName} 
                            className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{student.personalDetails?.fullName}</div>
                            <div className="text-xs text-slate-500">{student.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-brand-600 dark:text-brand-400">{student.rollNumber}</td>
                      <td className="px-6 py-4">{student.course?.name || 'N/A'}</td>
                      <td className="px-6 py-4">{student.semester?.name || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          student.user?.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {student.user?.status || 'Unknown'}
                        </span>
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
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination placeholder */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800 flex items-center justify-between">
          <span className="text-sm text-slate-500">Showing {filteredStudents.length} results</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 text-sm border border-slate-200 rounded-md bg-white text-slate-500 dark:border-slate-700 dark:bg-dark-800 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 text-sm border border-slate-200 rounded-md bg-white text-slate-500 dark:border-slate-700 dark:bg-dark-800 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsPage;

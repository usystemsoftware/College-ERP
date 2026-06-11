import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Briefcase } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { getFacultyAPI } from '../../api/faculty.api';

const FacultyDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaculties();
  }, []);

  async function fetchFaculties() {
    try {
      setLoading(true);
      const res = await getFacultyAPI({ limit: 1000 });
      setFacultyList(res.data?.data?.faculty || []);
    } catch (err) {
      console.error('Error fetching faculties:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredFaculty = facultyList.filter(fac => {
    const fName = fac.fullName || '';
    const dName = fac.department?.name || '';
    return fName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           dName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Faculty Directory</h1>
          <p className="text-sm text-slate-500">Manage teaching staff and professors.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700"
        >
          Add Faculty Member
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-dark-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white"
            />
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-dark-800">
            <Filter size={16} />
            Department Filter
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full py-8 text-center text-slate-500">Loading faculty...</div>
          ) : filteredFaculty.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-500">No faculty found.</div>
          ) : filteredFaculty.map((faculty) => (
            <div key={faculty._id} className="group relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-dark-800">
              <button className="absolute right-4 top-4 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:text-brand-600">
                <MoreVertical size={18} />
              </button>
              
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-3xl font-bold text-brand-600 shadow-sm ring-4 ring-slate-50 dark:bg-brand-900/40 dark:text-brand-400 dark:ring-dark-900">
                  {faculty.fullName ? faculty.fullName.charAt(0).toUpperCase() : 'F'}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{faculty.fullName || 'Unknown'}</h3>
                <p className="text-sm font-medium text-brand-600 dark:text-brand-400">{faculty.designation || 'Faculty'}</p>
                
                <div className="mt-4 flex w-full flex-col gap-2 rounded-lg bg-slate-50 p-3 text-left dark:bg-dark-900/50">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Employee ID:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-300">{faculty.employeeId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Department:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-300">{faculty.department?.name || 'General'}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex w-full justify-center gap-2">
                  <button className="flex-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-dark-700">
                    Profile
                  </button>
                  <button className="flex-1 rounded-md bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-100 dark:bg-brand-900/20 dark:hover:bg-brand-900/40">
                    Assign Subject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Faculty Member">
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
            <input type="text" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white" placeholder="Enter full name" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
            <input type="email" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white" placeholder="faculty@institute.edu" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department</label>
              <select className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white">
                <option>Computer Science</option>
                <option>Mechanical Engineering</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Designation</label>
              <select className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white">
                <option>Professor</option>
                <option>Assistant Professor</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FacultyDirectory;

import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Briefcase } from 'lucide-react';
import Modal from '../../components/common/Modal';

const mockFaculty = [
  { id: 'EMP-001', name: 'Dr. Alan Turing', email: 'alan@institute.edu', department: 'Computer Science', designation: 'HOD', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=5' },
  { id: 'EMP-002', name: 'Dr. Grace Hopper', email: 'grace@institute.edu', department: 'Computer Science', designation: 'Professor', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=6' },
  { id: 'EMP-003', name: 'Prof. Richard Feynman', email: 'richard@institute.edu', department: 'Mechanical Engineering', designation: 'Assistant Professor', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=7' },
];

const FacultyDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredFaculty = mockFaculty.filter(fac => 
    fac.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    fac.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          {filteredFaculty.map((faculty) => (
            <div key={faculty.id} className="group relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-dark-800">
              <button className="absolute right-4 top-4 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:text-brand-600">
                <MoreVertical size={18} />
              </button>
              
              <div className="flex flex-col items-center text-center">
                <img src={faculty.avatar} alt={faculty.name} className="mb-4 h-20 w-20 rounded-full object-cover shadow-sm ring-4 ring-slate-50 dark:ring-dark-900" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{faculty.name}</h3>
                <p className="text-sm font-medium text-brand-600 dark:text-brand-400">{faculty.designation}</p>
                
                <div className="mt-4 flex w-full flex-col gap-2 rounded-lg bg-slate-50 p-3 text-left dark:bg-dark-900/50">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Employee ID:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-300">{faculty.id}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Department:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-300">{faculty.department}</span>
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

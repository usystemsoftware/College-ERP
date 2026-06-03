import React, { useState } from 'react';
import { Search, Filter, Mail, Phone, MapPin, MoreVertical } from 'lucide-react';
import Modal from '../../components/common/Modal';

const mockStudents = [
  { id: 'STU-2023-001', name: 'Alex Johnson', email: 'alex@example.com', phone: '+1 234-567-8901', course: 'B.Tech CS', semester: '5th', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: 'STU-2023-002', name: 'Priya Sharma', email: 'priya@example.com', phone: '+1 234-567-8902', course: 'B.Tech ME', semester: '3rd', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: 'STU-2023-003', name: 'David Smith', email: 'david@example.com', phone: '+1 234-567-8903', course: 'B.Tech CS', semester: '5th', status: 'On Leave', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: 'STU-2023-004', name: 'Emily Chen', email: 'emily@example.com', phone: '+1 234-567-8904', course: 'MBA', semester: '1st', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=4' },
];

const StudentDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredStudents = mockStudents.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Directory</h1>
          <p className="text-sm text-slate-500">Manage and view all enrolled students.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700"
        >
          Add New Student
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-dark-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white"
            />
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-dark-800">
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
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-800/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={student.avatar} alt={student.name} className="h-10 w-10 rounded-full object-cover" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{student.name}</p>
                        <p className="text-xs text-slate-500">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm">{student.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900 dark:text-slate-300">{student.course}</p>
                    <p className="text-xs text-slate-500">{student.semester} Semester</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1 text-xs"><Phone size={12}/> {student.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      student.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-brand-600 dark:hover:text-brand-400">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Student">
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
            <input type="text" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white" placeholder="Enter full name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input type="email" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white" placeholder="Email address" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
              <input type="text" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white" placeholder="Phone number" />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentDirectory;

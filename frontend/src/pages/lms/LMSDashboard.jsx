import React, { useState } from 'react';
import { BookOpen, Video, FileText, Download, Plus, Search } from 'lucide-react';
import { useSelector } from 'react-redux';

// Mock Data
const mockSubjects = [
  { id: 'CS101', name: 'Data Structures' },
  { id: 'CS102', name: 'Algorithms' }
];

const mockResources = [
  { id: 1, title: 'Week 1: Arrays and Linked Lists', type: 'Document', subject: 'Data Structures', date: 'Oct 10, 2023', faculty: 'Dr. Turing' },
  { id: 2, title: 'Lecture Recording: Binary Trees', type: 'Video', subject: 'Data Structures', date: 'Oct 15, 2023', faculty: 'Dr. Turing' },
  { id: 3, title: 'Sorting Algorithms Cheat Sheet', type: 'Document', subject: 'Algorithms', date: 'Oct 12, 2023', faculty: 'Prof. Hopper' },
];

const LMSDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const roleName = typeof user?.role === 'object' ? user?.role?.name : user?.role;
  const isFaculty = roleName === 'Faculty';

  const [activeSubject, setActiveSubject] = useState('All');

  const getIcon = (type) => {
    switch(type) {
      case 'Document': return <FileText size={20} className="text-blue-500" />;
      case 'Video': return <Video size={20} className="text-red-500" />;
      default: return <BookOpen size={20} className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Study Materials</h1>
          <p className="text-sm text-slate-500">Access course resources, lecture notes, and videos.</p>
        </div>
        {isFaculty && (
          <button className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700">
            <Plus size={16} /> Upload Material
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar / Subject Filter */}
        <div className="w-full md:w-64 shrink-0">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-dark-900">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Filter by Subject</h3>
            <div className="space-y-1">
              <button 
                onClick={() => setActiveSubject('All')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${activeSubject === 'All' ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-dark-800'}`}
              >
                All Subjects
              </button>
              {mockSubjects.map(sub => (
                <button 
                  key={sub.id}
                  onClick={() => setActiveSubject(sub.name)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${activeSubject === sub.name ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-dark-800'}`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="flex-1">
          <div className="mb-4 relative">
             <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search materials..."
                className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-dark-900 dark:text-white shadow-sm"
              />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockResources.filter(r => activeSubject === 'All' || r.subject === activeSubject).map((resource) => (
              <div key={resource.id} className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-dark-900 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="rounded-lg bg-slate-50 p-2 dark:bg-dark-800">
                      {getIcon(resource.type)}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-dark-800 px-2 py-1 rounded">
                      {resource.subject}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2">{resource.title}</h3>
                  <p className="text-xs text-slate-500 mt-2">By {resource.faculty} • {resource.date}</p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">{resource.type}</span>
                  <button className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-50 text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition dark:bg-dark-800 dark:text-slate-400 dark:hover:text-brand-400">
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LMSDashboard;

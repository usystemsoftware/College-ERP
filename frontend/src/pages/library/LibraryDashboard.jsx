import React, { useState } from 'react';
import { BookOpen, Search, Filter, Hash, User, Calendar, Plus } from 'lucide-react';
import { useSelector } from 'react-redux';
import Modal from '../../components/common/Modal';

// Mock Data
const mockBooks = [
  { id: 'BK-001', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', category: 'Computer Science', available: 3, total: 5 },
  { id: 'BK-002', title: 'Database System Concepts', author: 'Abraham Silberschatz', category: 'Computer Science', available: 0, total: 2 },
  { id: 'BK-003', title: 'Engineering Mechanics', author: 'R.C. Hibbeler', category: 'Mechanical', available: 4, total: 4 },
  { id: 'BK-004', title: 'Principles of Marketing', author: 'Philip Kotler', category: 'Management', available: 1, total: 3 },
];

const mockCirculation = [
  { id: 'IS-101', book: 'Database System Concepts', user: 'Alex Johnson (CS-001)', issueDate: 'Oct 01, 2023', dueDate: 'Oct 15, 2023', status: 'Overdue' },
  { id: 'IS-102', book: 'Database System Concepts', user: 'Priya Sharma (CS-002)', issueDate: 'Oct 10, 2023', dueDate: 'Oct 24, 2023', status: 'Issued' },
];

const LibraryDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const roleName = typeof user?.role === 'object' ? user?.role?.name : user?.role;
  const isLibrarian = roleName === 'Librarian' || roleName === 'Super Admin' || roleName === 'College Admin';

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Catalog');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');

  const handleOpenModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Library Management</h1>
          <p className="text-sm text-slate-500">
            {isLibrarian ? 'Manage book catalog and track circulation.' : 'Search the library catalog.'}
          </p>
        </div>
        
        {isLibrarian && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleOpenModal('Add Book')}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-dark-800"
            >
              <Plus size={16} /> Add Book
            </button>
            <button 
              onClick={() => handleOpenModal('Issue / Return Book')}
              className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700"
            >
              Issue / Return
            </button>
          </div>
        )}
      </div>

      {isLibrarian && (
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
          <button 
            onClick={() => setActiveTab('Catalog')}
            className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'Catalog' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
            Book Catalog
          </button>
          <button 
            onClick={() => setActiveTab('Circulation')}
            className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'Circulation' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
            Circulation Desk
          </button>
        </div>
      )}

      {activeTab === 'Catalog' ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-dark-900">
          <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
            <div className="relative w-72">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search title, author, ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white"
              />
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-dark-800">
              <Filter size={16} /> Filter
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 font-semibold text-slate-500 dark:bg-dark-800">
                <tr>
                  <th className="px-6 py-4">Book Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Availability</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mockBooks.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase())).map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-800/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex gap-3 items-start">
                        <div className="h-12 w-10 bg-slate-200 dark:bg-dark-700 rounded flex items-center justify-center text-slate-400 flex-shrink-0">
                          <BookOpen size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-base">{book.title}</p>
                          <p className="text-xs text-slate-500">{book.author}</p>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Hash size={10}/> {book.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-dark-800 dark:text-slate-300">
                        {book.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`font-bold ${book.available > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {book.available > 0 ? `${book.available} Available` : 'Out of Stock'}
                        </span>
                        <span className="text-xs text-slate-500">Total: {book.total} copies</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium text-sm">Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-dark-900 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 font-semibold text-slate-500 dark:bg-dark-800">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Book</th>
                <th className="px-6 py-4">Borrower</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockCirculation.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-800/50">
                  <td className="px-6 py-4 font-mono text-xs">{record.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-2"><BookOpen size={14} className="text-slate-400"/> {record.book}</td>
                  <td className="px-6 py-4 flex items-center gap-2"><User size={14} className="text-slate-400"/>{record.user}</td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-500">Issued: {record.issueDate}</p>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1"><Calendar size={12}/> Due: {record.dueDate}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      record.status === 'Issued' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {record.status !== 'Returned' && (
                      <button className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">Mark Returned</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalType}>
        <div className="space-y-4 py-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">Please provide the details for {modalType}.</p>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Identifier (ISBN/ID)</label>
            <input type="text" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white" placeholder="Enter details" />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LibraryDashboard;

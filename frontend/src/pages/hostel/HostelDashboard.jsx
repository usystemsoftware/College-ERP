import React, { useState, useEffect } from 'react';
import { Home, Users, CheckCircle, Search, Filter, Phone, MapPin } from 'lucide-react';
import { useSelector } from 'react-redux';
import Modal from '../../components/common/Modal';
import api from '../../api/axios';

const HostelDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const roleName = typeof user?.role === 'object' ? user?.role?.name : user?.role;
  const isStudent = roleName === 'Student';

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await api.get('/hostel/dashboard');
        setStats(response.data.data);
      } catch (error) {
        console.error("Failed to fetch hostel stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleOpenModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"></div>
      </div>
    );
  }

  const studentAllocation = stats?.studentAllocation || {
    hostel: 'Unassigned',
    roomNumber: 'N/A',
    roomType: 'N/A',
    bedNumber: '-',
    roommates: [],
    warden: '-',
    contact: '-',
    validUntil: '-'
  };
  const hostels = stats?.hostels || [];
  if (isStudent) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hostel Allocation</h1>
          <p className="text-sm text-slate-500">View your current hostel and room details.</p>
        </div>

        <div className="rounded-xl border border-brand-200 bg-brand-50 p-6 shadow-sm dark:border-brand-900/50 dark:bg-brand-900/10">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-brand-100 p-3 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                <Home size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{studentAllocation.hostel}</h2>
                <div className="mt-1 flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1"><MapPin size={14}/> Room {studentAllocation.roomNumber}</span>
                  <span className="flex items-center gap-1"><Users size={14}/> Bed {studentAllocation.bedNumber}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm dark:bg-dark-800 dark:text-slate-300">
                    {studentAllocation.roomType}
                  </span>
                  <span className="inline-flex rounded-md bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 shadow-sm dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle size={12}/> Active until {studentAllocation.validUntil}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-auto rounded-lg bg-white p-4 shadow-sm dark:bg-dark-800 border border-slate-100 dark:border-slate-700">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Warden Contact</h3>
              <p className="mt-1 font-medium text-slate-900 dark:text-white">{studentAllocation.warden}</p>
              <p className="text-sm text-brand-600 dark:text-brand-400 flex items-center gap-1 mt-1"><Phone size={14}/> {studentAllocation.contact}</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-brand-200/50 dark:border-brand-800/30">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Roommates</h3>
            <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
              {studentAllocation.roommates.map((rm, i) => (
                <li key={i}>{rm}</li>
              ))}
              {studentAllocation.roommates.length === 0 && <li>No roommates</li>}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Admin View
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hostel Management</h1>
          <p className="text-sm text-slate-500">Manage hostel blocks, rooms, and student allocations.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleOpenModal('Add Hostel')}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-dark-800"
          >
            Add Hostel
          </button>
          <button 
            onClick={() => handleOpenModal('Allocate Room')}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700"
          >
            Allocate Room
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {hostels.map((hostel) => (
          <div key={hostel.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-dark-900">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Home className="text-brand-500" size={20} />
                  {hostel.name}
                </h3>
                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-dark-800 dark:text-slate-300 mt-1">
                  {hostel.type} Hostel
                </span>
              </div>
              <button className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">View Rooms</button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-dark-800/50">
                <p className="text-xs text-slate-500 mb-1">Occupancy</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{hostel.occupiedRooms}</p>
                  <p className="text-sm text-slate-500 mb-1">/ {hostel.totalRooms} Rooms</p>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-dark-700">
                  <div 
                    className={`h-full rounded-full ${hostel.occupiedRooms === hostel.totalRooms ? 'bg-red-500' : 'bg-green-500'}`} 
                    style={{ width: `${(hostel.occupiedRooms / hostel.totalRooms) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-dark-800/50">
                <p className="text-xs text-slate-500 mb-1">Warden Info</p>
                <p className="font-medium text-slate-900 dark:text-white text-sm">{hostel.warden}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Phone size={10}/> {hostel.contact}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalType}>
        <div className="space-y-4 py-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">Please fill out the details for {modalType}.</p>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name / Identifier</label>
            <input type="text" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white" placeholder="Enter details" />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HostelDashboard;

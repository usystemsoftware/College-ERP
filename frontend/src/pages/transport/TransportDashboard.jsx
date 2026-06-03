import React, { useState } from 'react';
import { Bus, Map, Users, Clock, Plus } from 'lucide-react';
import { useSelector } from 'react-redux';
import Modal from '../../components/common/Modal';

// Mock Data
const mockRoutes = [
  { id: 'R1', name: 'Route 1 - City Center', stops: 5, vehicles: 2, students: 85, capacity: 100 },
  { id: 'R2', name: 'Route 2 - North Suburbs', stops: 8, vehicles: 1, students: 45, capacity: 50 },
];

const mockStudentTransport = {
  route: 'Route 1 - City Center',
  stop: 'Central Library',
  pickupTime: '07:30 AM',
  dropTime: '04:15 PM',
  vehicleNumber: 'KA-01-AB-1234',
  driverName: 'Ramesh Kumar',
  driverContact: '+1 987-654-3210'
};

const TransportDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const roleName = typeof user?.role === 'object' ? user?.role?.name : user?.role;
  const isStudent = roleName === 'Student';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');

  const handleOpenModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  if (isStudent) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transport Details</h1>
          <p className="text-sm text-slate-500">View your assigned bus route and timings.</p>
        </div>

        <div className="rounded-xl border border-brand-200 bg-white p-0 shadow-sm dark:border-slate-800 dark:bg-dark-900 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-2 h-full bg-brand-500"></div>
          
          <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-8 pl-8 md:pl-10">
            <div className="flex-1 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bus className="text-brand-500" /> {mockStudentTransport.route}
                </h2>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-dark-800/50">
                    <p className="text-xs text-slate-500 mb-1">Your Stop</p>
                    <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5"><Map size={14} className="text-slate-400"/> {mockStudentTransport.stop}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-dark-800/50">
                    <p className="text-xs text-slate-500 mb-1">Vehicle</p>
                    <p className="font-mono font-semibold text-slate-900 dark:text-white">{mockStudentTransport.vehicleNumber}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-2 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Pickup</p>
                    <p className="font-bold text-slate-900 dark:text-white">{mockStudentTransport.pickupTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Drop</p>
                    <p className="font-bold text-slate-900 dark:text-white">{mockStudentTransport.dropTime}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-64 rounded-xl bg-slate-50 p-5 dark:bg-dark-800 flex flex-col justify-center h-fit">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 text-center">Driver Information</h3>
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-slate-200 dark:bg-dark-700 flex items-center justify-center mb-3">
                  <Users size={24} className="text-slate-400" />
                </div>
                <p className="font-bold text-slate-900 dark:text-white">{mockStudentTransport.driverName}</p>
                <p className="mt-1 text-sm font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-3 py-1 rounded-full">{mockStudentTransport.driverContact}</p>
              </div>
            </div>
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transport Management</h1>
          <p className="text-sm text-slate-500">Manage bus routes, vehicles, and student allocations.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleOpenModal('Add Route')}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-dark-800"
          >
            Add Route
          </button>
          <button 
            onClick={() => handleOpenModal('Allocate Transport')}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700"
          >
            <Plus size={16} /> Allocate Transport
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {mockRoutes.map((route) => (
          <div key={route.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-dark-900">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Map className="text-brand-500" size={20} />
                  {route.name}
                </h3>
                <p className="text-sm text-slate-500 mt-1">{route.stops} Stops • {route.vehicles} Vehicles assigned</p>
              </div>
              <button className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">View Map</button>
            </div>
            
            <div className="mt-6 rounded-lg bg-slate-50 p-4 dark:bg-dark-800/50">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Seat Utilization</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{route.students} / {route.capacity}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-dark-700">
                <div 
                  className={`h-full rounded-full ${route.students / route.capacity > 0.9 ? 'bg-amber-500' : 'bg-brand-500'}`} 
                  style={{ width: `${(route.students / route.capacity) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalType}>
        <div className="space-y-4 py-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">Please provide the details for {modalType}.</p>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Identifier / Details</label>
            <input type="text" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white" placeholder="Enter details" />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TransportDashboard;

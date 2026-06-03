import React, { useState } from 'react';
import { Monitor, Briefcase, MapPin, Search, Plus, Wrench } from 'lucide-react';
import Modal from '../../components/common/Modal';

// Mock Data
const mockAssets = [
  { id: 'INV-101', name: 'Dell Optiplex 7090', category: 'Electronics', location: 'Computer Lab 1', qty: 30, status: 'In Use' },
  { id: 'INV-102', name: 'Epson Projector', category: 'Electronics', location: 'Lecture Hall A', qty: 2, status: 'Under Repair' },
  { id: 'INV-103', name: 'Microscope', category: 'Lab Equipment', location: 'Biology Lab', qty: 15, status: 'In Use' },
  { id: 'INV-104', name: 'Ergonomic Chairs', category: 'Furniture', location: 'Library', qty: 50, status: 'In Use' },
];

const InventoryDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inventory Management</h1>
          <p className="text-sm text-slate-500">Track and manage college assets and equipment.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700"
        >
          <Plus size={16} /> Add Asset
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-dark-900 flex items-center gap-4">
          <div className="rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"><Monitor size={20}/></div>
          <div><p className="text-xs text-slate-500">Electronics</p><p className="text-lg font-bold text-slate-900 dark:text-white">1,240</p></div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-dark-900 flex items-center gap-4">
          <div className="rounded-full bg-amber-100 p-3 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"><Briefcase size={20}/></div>
          <div><p className="text-xs text-slate-500">Furniture</p><p className="text-lg font-bold text-slate-900 dark:text-white">3,500</p></div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-dark-900 flex items-center gap-4">
          <div className="rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900/30 dark:text-red-400"><Wrench size={20}/></div>
          <div><p className="text-xs text-slate-500">Under Repair</p><p className="text-lg font-bold text-slate-900 dark:text-white">12</p></div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-dark-900">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
           <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white"
              />
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 font-semibold text-slate-500 dark:bg-dark-800">
              <tr>
                <th className="px-6 py-4">Asset Code</th>
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-800/50 transition">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900 dark:text-white">{asset.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{asset.name}</td>
                  <td className="px-6 py-4"><span className="bg-slate-100 dark:bg-dark-800 px-2 py-1 rounded text-xs">{asset.category}</span></td>
                  <td className="px-6 py-4 flex items-center gap-1.5"><MapPin size={14} className="text-slate-400"/> {asset.location}</td>
                  <td className="px-6 py-4 font-bold">{asset.qty}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      asset.status === 'In Use' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium text-sm">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Asset">
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Asset Name</label>
            <input type="text" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white" placeholder="Enter asset name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
              <select className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white">
                <option>Electronics</option>
                <option>Furniture</option>
                <option>Lab Equipment</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Quantity</label>
              <input type="number" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white" placeholder="0" />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InventoryDashboard;

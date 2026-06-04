import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, CheckCircle, XCircle, LogIn, LogOut, Search, Clock } from 'lucide-react';
import { createPortal } from 'react-dom';
import { getGatePassesAPI, createGatePassAPI, approveGatePassAPI, checkInGatePassAPI, checkOutGatePassAPI } from '../../api/gatepass.api';

const GatePassPage = () => {
  const [gatePasses, setGatePasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorIdType, setVisitorIdType] = useState('Aadhar');
  const [visitorIdNumber, setVisitorIdNumber] = useState('');
  const [purpose, setPurpose] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [numberOfVisitors, setNumberOfVisitors] = useState(1);

  useEffect(() => {
    fetchGatePasses();
  }, []);

  const fetchGatePasses = async () => {
    setLoading(true);
    try {
      const res = await getGatePassesAPI();
      setGatePasses(res.data?.data?.passes || []);
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createGatePassAPI({
        visitorName,
        visitorPhone,
        visitorIdType,
        visitorIdNumber,
        purpose,
        vehicleNumber,
        numberOfVisitors
      });
      setIsModalOpen(false);
      resetForm();
      fetchGatePasses();
    } catch (error) {
      console.error('Failed to create gate pass', error);
      alert('Failed to create gate pass');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setVisitorName('');
    setVisitorPhone('');
    setVisitorIdType('Aadhar');
    setVisitorIdNumber('');
    setPurpose('');
    setVehicleNumber('');
    setNumberOfVisitors(1);
  };

  const handleAction = async (id, type) => {
    try {
      if (type === 'Approve') await approveGatePassAPI(id, 'Approved');
      else if (type === 'Reject') await approveGatePassAPI(id, 'Rejected');
      else if (type === 'CheckIn') await checkInGatePassAPI(id);
      else if (type === 'CheckOut') await checkOutGatePassAPI(id);
      
      fetchGatePasses();
    } catch (error) {
      console.error(`Failed to perform action: ${type}`, error);
      alert('Action failed. You might not have the required permissions.');
    }
  };

  const filteredPasses = gatePasses.filter(pass => 
    pass.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pass.visitorPhone.includes(searchTerm)
  );

  const getStatusBadge = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
      Approved: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
      Rejected: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
      CheckedIn: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
      CheckedOut: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400',
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[status] || colors.Pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gate Passes & Security</h1>
          <p className="text-sm text-slate-500">Manage visitor entries, vehicle records, and security approvals.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
        >
          <Plus size={16} />
          New Gate Pass
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-dark-800">
        <div className="flex flex-col sm:flex-row gap-4 border-b border-slate-200 p-5 dark:border-slate-800 sm:items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search visitors..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm outline-none dark:border-slate-700 dark:bg-dark-900 dark:text-white" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 dark:bg-dark-850 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3 font-semibold">Visitor Details</th>
                <th className="px-6 py-3 font-semibold">Purpose</th>
                <th className="px-6 py-3 font-semibold">Vehicle & Pass info</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading gate passes...</td></tr>
              ) : filteredPasses.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No gate passes found.</td></tr>
              ) : (
                filteredPasses.map((pass) => (
                  <tr key={pass._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-750/30">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{pass.visitorName}</div>
                      <div className="text-xs text-slate-500">{pass.visitorPhone} • {pass.numberOfVisitors} {pass.numberOfVisitors > 1 ? 'visitors' : 'visitor'}</div>
                    </td>
                    <td className="px-6 py-4 dark:text-slate-300 max-w-xs truncate" title={pass.purpose}>
                      {pass.purpose}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-700 dark:text-slate-300">Veh: {pass.vehicleNumber || 'N/A'}</div>
                      <div className="text-xs text-slate-500">{pass.visitorIdType}: {pass.visitorIdNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(pass.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {pass.status === 'Pending' && (
                          <>
                            <button onClick={() => handleAction(pass._id, 'Approve')} title="Approve" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg dark:text-blue-400 dark:hover:bg-blue-900/30">
                              <CheckCircle size={18} />
                            </button>
                            <button onClick={() => handleAction(pass._id, 'Reject')} title="Reject" className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg dark:text-red-400 dark:hover:bg-red-900/30">
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        {pass.status === 'Approved' && (
                          <button onClick={() => handleAction(pass._id, 'CheckIn')} title="Check In" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg dark:text-emerald-400 dark:hover:bg-emerald-900/30">
                            <LogIn size={18} />
                          </button>
                        )}
                        {pass.status === 'CheckedIn' && (
                          <button onClick={() => handleAction(pass._id, 'CheckOut')} title="Check Out" className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg dark:text-slate-400 dark:hover:bg-slate-800">
                            <LogOut size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 transition-all duration-300">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/5 dark:bg-dark-800 dark:ring-white/10 animate-in fade-in zoom-in-95 duration-200">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Gate Pass</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Visitor Name *</label>
                  <input required type="text" value={visitorName} onChange={e => setVisitorName(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-dark-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
                  <input required type="tel" value={visitorPhone} onChange={e => setVisitorPhone(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-dark-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ID Type</label>
                  <select value={visitorIdType} onChange={e => setVisitorIdType(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-dark-900 dark:text-white">
                    <option value="Aadhar">Aadhar</option>
                    <option value="PAN">PAN</option>
                    <option value="Passport">Passport</option>
                    <option value="DrivingLicense">Driving License</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ID Number</label>
                  <input type="text" value={visitorIdNumber} onChange={e => setVisitorIdNumber(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-dark-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vehicle Number</label>
                  <input type="text" placeholder="e.g. MH 12 AB 1234" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-dark-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Number of Visitors</label>
                  <input type="number" min="1" value={numberOfVisitors} onChange={e => setNumberOfVisitors(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-dark-900 dark:text-white" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Purpose of Visit *</label>
                  <textarea required rows="2" value={purpose} onChange={e => setPurpose(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-dark-900 dark:text-white" />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="rounded-lg bg-brand-500 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting ? 'Creating...' : 'Create Gate Pass'}
                </button>
              </div>
            </form>
          </div>
        </div>
      , document.body)}
    </div>
  );
};

export default GatePassPage;

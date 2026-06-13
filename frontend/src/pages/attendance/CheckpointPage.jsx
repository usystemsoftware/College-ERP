import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { QrCode, Scan, History, UserCheck, Loader2, Home, MapPin, Building2 } from 'lucide-react';
import api from '../../api/axios';
import { getSocket } from '../../services/socket';
import toast from 'react-hot-toast';

const CheckpointPage = () => {
  const { user } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('scan'); // 'scan', 'generate', 'dashboard'
  const [loading, setLoading] = useState(false);
  
  // Dashboard state
  const [dashboardData, setDashboardData] = useState(null);
  
  // Generate QR state
  const [generatedQR, setGeneratedQR] = useState(null);
  const [selectedType, setSelectedType] = useState('arrived_school');

  // Scanner state
  const [scanResult, setScanResult] = useState('');
  
  const isStudent = user?.role === 'Student';
  const isAdmin = ['Super Admin', 'College Admin', 'Principal', 'Security Officer'].includes(user?.role);

  useEffect(() => {
    if (activeTab === 'dashboard' && isAdmin) {
      fetchDashboard();
    }
  }, [activeTab]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/checkpoints/dashboard');
      setDashboardData(res.data?.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateQR = async () => {
    setLoading(true);
    try {
      const res = await api.post('/checkpoints/generate', { type: selectedType });
      setGeneratedQR(res.data?.data);
      toast.success('QR Code generated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate QR');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateScan = async () => {
    if (!scanResult.trim()) {
      toast.error('Please enter a QR token');
      return;
    }
    
    setLoading(true);
    try {
      // Get current location if possible, otherwise send mock
      const mockLocation = { lat: 18.5975, lng: 73.7898 }; 
      
      await api.post('/checkpoints/scan', { 
        token: scanResult,
        location: mockLocation
      });
      
      toast.success('Checkpoint scanned successfully!');
      setScanResult('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  const getTypeInfo = (type) => {
    switch(type) {
      case 'left_home': return { label: 'Left Home', icon: <Home size={18} />, color: 'bg-blue-100 text-blue-700' };
      case 'arrived_school': return { label: 'Arrived at School', icon: <Building2 size={18} />, color: 'bg-emerald-100 text-emerald-700' };
      case 'left_school': return { label: 'Left School', icon: <MapPin size={18} />, color: 'bg-amber-100 text-amber-700' };
      default: return { label: 'Unknown', icon: <QrCode size={18} />, color: 'bg-slate-100 text-slate-700' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Scan size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Location Checkpoints</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Scan or generate location tracking QR codes</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-dark-800 p-1 rounded-xl">
          {isStudent && (
            <button
              onClick={() => setActiveTab('scan')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'scan' ? 'bg-white dark:bg-dark-700 text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Scan size={16} /> Scan QR
            </button>
          )}
          
          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'dashboard' ? 'bg-white dark:bg-dark-700 text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <History size={16} /> Dashboard
              </button>
              <button
                onClick={() => setActiveTab('generate')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'generate' ? 'bg-white dark:bg-dark-700 text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <QrCode size={16} /> Generate QR
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-h-[400px]">
        
        {/* STUDENT VIEW - SCANNER */}
        {activeTab === 'scan' && (
          <div className="p-8 max-w-md mx-auto w-full flex flex-col items-center justify-center">
            <div className="w-full aspect-square bg-slate-100 dark:bg-dark-700 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden mb-6">
              <Scan size={64} className="text-slate-400 mb-4" />
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">QR Scanner</h3>
              <p className="text-sm text-slate-500 mt-2">Point your camera at a checkpoint QR code to log your location.</p>
              
              <div className="absolute inset-0 border-4 border-brand-500/30 rounded-3xl m-4 pointer-events-none"></div>
              {/* Animated scan line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-brand-500 opacity-50 shadow-[0_0_8px_2px_rgba(59,130,246,0.5)] animate-[scan_2s_ease-in-out_infinite]"></div>
            </div>

            <div className="w-full space-y-3">
              <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-400">Simulator (Manual Entry)</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Paste QR Token..." 
                  value={scanResult}
                  onChange={(e) => setScanResult(e.target.value)}
                  className="flex-1 px-4 py-2 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
                <button 
                  onClick={handleSimulateScan}
                  disabled={loading || !scanResult}
                  className="px-4 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Scan'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN VIEW - GENERATE */}
        {activeTab === 'generate' && isAdmin && (
          <div className="p-8 max-w-lg mx-auto w-full">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Create Checkpoint QR</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Select Checkpoint Type</label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'left_home', ...getTypeInfo('left_home') },
                    { id: 'arrived_school', ...getTypeInfo('arrived_school') },
                    { id: 'left_school', ...getTypeInfo('left_school') }
                  ].map((type) => (
                    <label 
                      key={type.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedType === type.id 
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/10 shadow-sm' 
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-dark-700/50'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="checkpointType" 
                        value={type.id}
                        checked={selectedType === type.id}
                        onChange={() => setSelectedType(type.id)}
                        className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                      />
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${type.color}`}>
                        {type.icon}
                      </div>
                      <div className="font-semibold text-slate-900 dark:text-white">{type.label}</div>
                    </label>
                  ))}
                </div>
              </div>
              
              <button
                onClick={generateQR}
                disabled={loading}
                className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold shadow-md shadow-brand-500/20 hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <QrCode size={20} />}
                Generate QR Code
              </button>
            </div>

            {generatedQR && (
              <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 flex flex-col items-center">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                  {/* Mock QR rendering - in a real app use a library like react-qr-code */}
                  <div className="w-48 h-48 bg-slate-100 flex flex-col items-center justify-center text-center p-4">
                    <QrCode size={64} className="text-slate-800 mb-2" />
                    <p className="text-xs font-mono break-all text-slate-500">{generatedQR.token.substring(0, 30)}...</p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">{getTypeInfo(generatedQR.type).label}</h3>
                  <p className="text-sm text-slate-500 mt-1">Valid for 2 hours. Print or display this on a screen.</p>
                </div>
                
                <div className="mt-6 w-full p-4 bg-slate-50 dark:bg-dark-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Token (For Simulator)</p>
                  <code className="block text-xs font-mono bg-white dark:bg-dark-800 p-2 rounded border border-slate-200 dark:border-slate-700 break-all select-all">
                    {generatedQR.token}
                  </code>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ADMIN VIEW - DASHBOARD */}
        {activeTab === 'dashboard' && isAdmin && (
          <div className="p-6">
            {loading && !dashboardData ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-600" size={32} /></div>
            ) : dashboardData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 dark:bg-dark-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Scans Today</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{dashboardData.stats.totalScans}</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                    <div className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Home size={14} /> Left Home
                    </div>
                    <div className="text-2xl font-black text-blue-700 dark:text-blue-300">{dashboardData.stats.leftHome}</div>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                    <div className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Building2 size={14} /> Arrived School
                    </div>
                    <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{dashboardData.stats.arrivedSchool}</div>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30">
                    <div className="text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <MapPin size={14} /> Left School
                    </div>
                    <div className="text-2xl font-black text-amber-700 dark:text-amber-300">{dashboardData.stats.leftSchool}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4">Recent Scans</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="pb-3 text-sm font-semibold text-slate-500 px-4">Time</th>
                          <th className="pb-3 text-sm font-semibold text-slate-500 px-4">Student</th>
                          <th className="pb-3 text-sm font-semibold text-slate-500 px-4">Checkpoint</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.checkpoints.length === 0 ? (
                          <tr><td colSpan="3" className="text-center py-8 text-slate-500">No scans recorded today.</td></tr>
                        ) : (
                          dashboardData.checkpoints.map(cp => {
                            const info = getTypeInfo(cp.type);
                            return (
                              <tr key={cp._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-dark-700/30">
                                <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-white">
                                  {new Date(cp.scannedAt).toLocaleTimeString()}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="font-semibold text-sm text-slate-900 dark:text-white">{cp.student?.personalDetails?.fullName}</div>
                                  <div className="text-xs text-slate-500">{cp.student?.rollNumber}</div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${info.color}`}>
                                    {info.icon} {info.label}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

      </div>
    </div>
  );
};

export default CheckpointPage;

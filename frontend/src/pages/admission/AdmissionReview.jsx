import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import client from '../../api/client';

const getBackendUrl = (path) => {
  const apiUrl = client.defaults.baseURL || 'http://localhost:5050/api';
  return `${apiUrl.replace('/api', '')}${path}`;
};

const AdmissionReview = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  
  // For Approval Modal
  const [reviewNotes, setReviewNotes] = useState('');
  const [allottedBatchId, setAllottedBatchId] = useState('');
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    if (selectedApp?.courseId?._id) {
      client.get(`/batches?courseId=${selectedApp.courseId._id}`)
        .then(res => {
          if (res.data.success) setBatches(res.data.data);
        })
        .catch(err => console.error('Error fetching batches', err));
    } else {
      setBatches([]);
    }
  }, [selectedApp]);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const url = statusFilter !== 'All' ? `/admission/applications?status=${statusFilter}` : '/admission/applications';
      const response = await client.get(url);
      if (response.data.success) {
        setApplications(response.data.data.applications);
      }
    } catch (error) {
      console.error('Error fetching applications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (status) => {
    if (status === 'Approved' && !allottedBatchId) {
      alert('Please provide an allotted batch ID to approve.');
      return;
    }
    
    try {
      const response = await client.put(`/admission/applications/${selectedApp._id}/review`, {
        status,
        reviewNotes,
        allottedBatchId: status === 'Approved' ? allottedBatchId : undefined
      });
      
      if (response.data.success) {
        alert(`Application ${status} successfully!`);
        setSelectedApp(null);
        setReviewNotes('');
        setAllottedBatchId('');
        fetchApplications();
      }
    } catch (error) {
      console.error('Error reviewing application', error);
      alert(error.response?.data?.message || 'Error updating status');
    }
  };

  const filteredApps = applications.filter(app => {
    const searchString = searchTerm.toLowerCase();
    const nameMatch = `${app.firstName} ${app.lastName}`.toLowerCase().includes(searchString);
    const idMatch = app._id.toLowerCase().includes(searchString);
    return nameMatch || idMatch;
  });

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admission Review</h1>
          <p className="text-sm text-slate-500">Review applications, verify documents, and allot seats.</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-dark-900 overflow-hidden shadow-sm">
        
        {/* Controls */}
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search Applicant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm outline-none focus:border-brand-500 focus:bg-white dark:border-slate-700 dark:bg-dark-800 dark:focus:bg-dark-950 dark:text-white"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="text-slate-400" size={16} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-dark-800 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4">App ID</th>
                <th className="px-6 py-4">Applicant Name</th>
                <th className="px-6 py-4">Applied Course</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8">Loading applications...</td></tr>
              ) : filteredApps.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8">No applications found.</td></tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-800/50 transition">
                    <td className="px-6 py-4 font-mono text-brand-600 dark:text-brand-400 font-medium">APP-{app._id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{app.firstName} {app.lastName}</td>
                    <td className="px-6 py-4">{app.courseId?.name || 'Unknown Course'}</td>
                    <td className="px-6 py-4">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        app.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        app.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        app.status === 'Reviewed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {app.status === 'Approved' && <CheckCircle size={12} />}
                        {app.status === 'Pending' && <Clock size={12} />}
                        {app.status === 'Reviewed' && <Eye size={12} />}
                        {app.status === 'Rejected' && <XCircle size={12} />}
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedApp(app)}
                        className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium text-sm"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-dark-900 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Review Application</h2>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-slate-600"><XCircle /></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Applicant Name</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedApp.firstName} {selectedApp.lastName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Email & Phone</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedApp.email} | {selectedApp.phone}</p>
                </div>
                <div>
                  <p className="text-slate-500">Gender & DOB</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedApp.gender} | {new Date(selectedApp.dob).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-slate-500">Course Applied</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedApp.courseId?.name}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Uploaded Documents</h3>
                <div className="flex gap-4">
                  {selectedApp.documents?.photoUrl && (
                    <a href={getBackendUrl(selectedApp.documents.photoUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-dark-800 rounded-lg text-sm text-brand-600 hover:underline">
                      <ExternalLink size={16} /> Photo
                    </a>
                  )}
                  {selectedApp.documents?.idProofUrl && (
                    <a href={getBackendUrl(selectedApp.documents.idProofUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-dark-800 rounded-lg text-sm text-brand-600 hover:underline">
                      <ExternalLink size={16} /> ID Proof
                    </a>
                  )}
                  {selectedApp.documents?.marksheetUrl && (
                    <a href={getBackendUrl(selectedApp.documents.marksheetUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-dark-800 rounded-lg text-sm text-brand-600 hover:underline">
                      <ExternalLink size={16} /> Marksheet
                    </a>
                  )}
                  {!selectedApp.documents?.photoUrl && !selectedApp.documents?.idProofUrl && !selectedApp.documents?.marksheetUrl && (
                    <p className="text-sm text-slate-500">No documents uploaded.</p>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white">Admin Action</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Review Notes</label>
                  <textarea 
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-dark-800 px-4 py-2 text-sm outline-none focus:border-brand-500"
                    rows="2"
                    placeholder="Add notes about document verification..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Allotted Batch (Required for Approval)</label>
                  <select 
                    value={allottedBatchId}
                    onChange={(e) => setAllottedBatchId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-dark-800 px-4 py-2 text-sm outline-none focus:border-brand-500"
                  >
                    <option value="">Select a batch...</option>
                    {batches.map(b => (
                      <option key={b._id} value={b._id}>{b.name} ({b.startYear}-{b.endYear})</option>
                    ))}
                  </select>
                  {batches.length === 0 && <p className="text-xs text-amber-500 mt-1">No active batches found for this course. Please create one first.</p>}
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    onClick={() => handleReviewAction('Rejected')}
                    className="px-4 py-2 rounded-lg font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleReviewAction('Reviewed')}
                    className="px-4 py-2 rounded-lg font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 transition"
                  >
                    Mark as Reviewed
                  </button>
                  <button 
                    onClick={() => handleReviewAction('Approved')}
                    className="px-4 py-2 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition"
                  >
                    Approve & Allot Seat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionReview;

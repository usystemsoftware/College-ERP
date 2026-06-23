import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Archive, Plus, X, Upload, FileText, CheckCircle, AlertCircle, Clock, Download, ExternalLink } from 'lucide-react';
import { getMyDocumentsAPI, uploadDocumentAPI, updateDocumentStatusAPI, getStudentDocumentsAPI } from '../../api/documents.api';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const BASE_URL = API_URL.replace('/api/v1', '');

const UploadModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    documentType: 'Aadhar / National ID',
  });
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('documentType', formData.documentType);
    data.append('document', file);

    try {
      setIsSubmitting(true);
      await uploadDocumentAPI(data);
      toast.success('Document uploaded successfully');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-dark-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upload Document</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-dark-800 dark:hover:text-slate-300">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Document Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Aadhar Card Front"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-dark-700 dark:bg-dark-950 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Document Type</label>
            <select
              required
              value={formData.documentType}
              onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-dark-700 dark:bg-dark-950 dark:text-white"
            >
              <option value="Aadhar / National ID">Aadhar / National ID</option>
              <option value="10th Marksheet">10th Marksheet</option>
              <option value="12th Marksheet">12th Marksheet</option>
              <option value="Migration Certificate">Migration Certificate</option>
              <option value="Degree Certificate">Degree Certificate</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">File</label>
            <div 
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md cursor-pointer hover:border-brand-500 transition-colors dark:border-dark-700"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-slate-400" />
                <div className="flex text-sm text-slate-600 dark:text-slate-400">
                  <span className="relative cursor-pointer rounded-md font-medium text-brand-600 hover:text-brand-500 focus-within:outline-none dark:text-brand-400">
                    <span>Upload a file</span>
                    <input 
                      ref={fileInputRef} 
                      type="file" 
                      className="sr-only" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                  </span>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-500">
                  {file ? file.name : "PNG, JPG, PDF up to 5MB"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-dark-800">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-dark-700 dark:bg-dark-900 dark:text-slate-300">Cancel</button>
            <button type="submit" disabled={isSubmitting || !file} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 flex items-center gap-2">
              {isSubmitting ? 'Uploading...' : <><Upload size={16} /> Upload Document</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DigitalLocker = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = ['Super Admin', 'College Admin', 'Principal', 'Admission Officer'].includes(user?.role?.name || user?.role);

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [studentIdInput, setStudentIdInput] = useState(''); // For Admin to search a student

  const fetchDocuments = async (studentId = null) => {
    try {
      setLoading(true);
      let res;
      if (isAdmin && studentId) {
        res = await getStudentDocumentsAPI(studentId);
      } else if (!isAdmin) {
        res = await getMyDocumentsAPI();
      } else {
        setDocuments([]);
        return;
      }
      setDocuments(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      fetchDocuments();
    } else {
      setLoading(false); // Wait for admin to search
    }
  }, [isAdmin]);

  const handleAdminSearch = (e) => {
    e.preventDefault();
    if (!studentIdInput.trim()) {
      toast.error('Please enter a Student ID');
      return;
    }
    fetchDocuments(studentIdInput);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateDocumentStatusAPI(id, { status: newStatus });
      toast.success('Document status updated');
      fetchDocuments(isAdmin ? studentIdInput : null);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Verified': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock size={14} />;
      case 'Verified': return <CheckCircle size={14} />;
      case 'Rejected': return <AlertCircle size={14} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Archive className="text-brand-500" /> Digital Locker
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin ? 'Verify and manage student documents.' : 'Securely store and manage your essential documents.'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {isAdmin && (
            <form onSubmit={handleAdminSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Student ID (_id)"
                value={studentIdInput}
                onChange={(e) => setStudentIdInput(e.target.value)}
                className="w-full sm:w-64 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-dark-700 dark:bg-dark-900 dark:text-white"
              />
              <button type="submit" className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600">
                Search
              </button>
            </form>
          )}
          {!isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              <Upload size={16} /> Upload New
            </button>
          )}
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"></div>
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 dark:border-slate-700 dark:bg-dark-800/50">
          <div className="rounded-full bg-slate-200 p-4 text-slate-500 dark:bg-slate-800 dark:text-slate-400 mb-4">
            <Archive size={32} />
          </div>
          <p className="text-lg font-medium text-slate-900 dark:text-white">No Documents Found</p>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin ? "Search for a student ID to view their documents." : "You haven't uploaded any documents yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {documents.map((doc) => (
            <div key={doc._id} className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-dark-800 dark:bg-dark-900">
              
              <div className="p-5 flex-1">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <FileText size={20} />
                  </div>
                  <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColor(doc.status)}`}>
                    {getStatusIcon(doc.status)} {doc.status}
                  </span>
                </div>
                
                <h3 className="mb-1 font-bold text-slate-900 dark:text-white line-clamp-1" title={doc.title}>
                  {doc.title}
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">
                  {doc.documentType}
                </p>

                <div className="text-[11px] text-slate-400 mt-auto">
                  Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="grid grid-cols-2 border-t border-slate-100 bg-slate-50 dark:border-dark-800 dark:bg-dark-800/50">
                <a
                  href={`${BASE_URL}${doc.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-dark-700 dark:hover:text-brand-400 border-r border-slate-100 dark:border-dark-800"
                >
                  <ExternalLink size={16} /> View
                </a>
                <a
                  href={`${BASE_URL}${doc.fileUrl}`}
                  download
                  className="flex items-center justify-center gap-2 p-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-dark-700 dark:hover:text-brand-400"
                >
                  <Download size={16} /> Download
                </a>
              </div>

              {/* Admin Actions Overlay */}
              {isAdmin && doc.status === 'Pending' && (
                <div className="absolute inset-0 bg-white/90 dark:bg-dark-900/90 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity p-4">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white text-center mb-2">Verify Document?</p>
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => handleStatusUpdate(doc._id, 'Verified')}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-green-500 px-3 py-2 text-xs font-semibold text-white hover:bg-green-600 shadow-sm"
                    >
                      <CheckCircle size={14} /> Verify
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(doc._id, 'Rejected')}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 text-red-600 px-3 py-2 text-xs font-semibold hover:bg-red-100 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <UploadModal 
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchDocuments();
          }}
        />
      )}
    </div>
  );
};

export default DigitalLocker;

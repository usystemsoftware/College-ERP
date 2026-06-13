import React, { useState, useEffect } from 'react';
import { ShieldAlert, Send, Eye, EyeOff, MapPin, Paperclip, Sparkles, AlertTriangle, CheckCircle2, Loader2, List, FileText, Image, Mic, X } from 'lucide-react';
import { submitIncidentAPI, getMyIncidentsAPI } from '../../api/incidents.api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: '', label: 'Let AI decide (recommended)', icon: '🤖' },
  { value: 'Safety Issue', label: 'Safety Issue', icon: '🛡️' },
  { value: 'Harassment Complaint', label: 'Harassment Complaint', icon: '🚫' },
  { value: 'Infrastructure Problem', label: 'Infrastructure Problem', icon: '🏗️' },
  { value: 'Medical Emergency', label: 'Medical Emergency', icon: '🏥' },
  { value: 'Bullying', label: 'Bullying', icon: '😤' },
  { value: 'Theft', label: 'Theft', icon: '🔒' },
  { value: 'Other', label: 'Other', icon: '📋' },
];

const urgencyColors = {
  Critical: 'bg-red-500',
  High: 'bg-orange-500',
  Medium: 'bg-yellow-500',
  Low: 'bg-green-500',
};

const IncidentReportPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const [activeTab, setActiveTab] = useState('submit');
  const [myIncidents, setMyIncidents] = useState([]);
  const [loadingIncidents, setLoadingIncidents] = useState(false);

  useEffect(() => {
    if (activeTab === 'my-reports') {
      fetchMyIncidents();
    }
  }, [activeTab]);

  const fetchMyIncidents = async () => {
    setLoadingIncidents(true);
    try {
      const res = await getMyIncidentsAPI();
      setMyIncidents(res.data?.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load your reports');
    } finally {
      setLoadingIncidents(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in the title and description');
      return;
    }
    setSubmitting(true);
    try {
      // Use FormData for file upload
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      if (category) formData.append('category', category);
      if (location.trim()) formData.append('location', location.trim());
      formData.append('isAnonymous', isAnonymous);
      
      files.forEach(file => {
        formData.append('attachments', file);
      });

      const res = await submitIncidentAPI(formData);
      setAiResult(res.data?.data?.aiCategorization || null);
      setSubmitted(true);
      toast.success('Your report has been submitted securely.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setLocation('');
    setIsAnonymous(true);
    setFiles([]);
    setSubmitted(false);
    setAiResult(null);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      toast.error('You can upload a maximum of 5 files.');
      return;
    }
    const validFiles = selectedFiles.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isAudio = file.type.startsWith('audio/');
      if (!isImage && !isAudio) {
        toast.error(`${file.name} is not a valid image or audio file.`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB.`);
        return false;
      }
      return true;
    });
    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (indexToRemove) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Success state
  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] animate-in fade-in zoom-in-95 duration-500">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 size={40} className="text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Report Submitted Successfully</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Your report has been securely submitted{isAnonymous ? ' anonymously' : ''} and is now being reviewed by campus security.
          </p>

          {aiResult && (
            <div className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-left space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <Sparkles size={16} className="text-indigo-500" />
                AI Analysis Result
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Category</p>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-semibold">
                    {aiResult.category}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Urgency</p>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-sm font-semibold ${urgencyColors[aiResult.urgency] || 'bg-slate-500'}`}>
                    {aiResult.urgency}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Confidence</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                      style={{ width: `${(aiResult.confidence || 0) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {((aiResult.confidence || 0) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">{aiResult.reasoning}</p>
            </div>
          )}

          <button
            onClick={resetForm}
            className="px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20 mb-4">
          <ShieldAlert size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent dark:from-rose-400 dark:to-orange-400">
          Incident Reports
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Report safety concerns, harassment, or emergencies. Your identity will be hidden from administrators.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-slate-100 dark:bg-dark-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'submit'
                ? 'bg-white dark:bg-dark-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Send size={16} /> Submit Report
          </button>
          <button
            onClick={() => setActiveTab('my-reports')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'my-reports'
                ? 'bg-white dark:bg-dark-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <List size={16} /> My Reports
          </button>
        </div>
      </div>

      {activeTab === 'submit' ? (
        <>
      {/* Anonymous Toggle */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isAnonymous ? (
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <EyeOff size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Eye size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-800 dark:text-white text-sm">
                {isAnonymous ? 'Anonymous Mode Active' : 'Identity Visible'}
              </p>
              <p className="text-xs text-slate-400">
                {isAnonymous
                  ? 'Your identity will be hidden from administrators.'
                  : 'Your identity will be visible to administrators reviewing this report.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${
              isAnonymous ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                isAnonymous ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Report Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Report Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the incident..."
              maxLength={200}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white"
            />
            <p className="text-xs text-slate-400 mt-1 text-right">{title.length}/200</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe what happened, when it happened, and where. Include any details that may help in the investigation..."
              rows={6}
              maxLength={5000}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white resize-none"
            />
            <p className="text-xs text-slate-400 mt-1 text-right">{description.length}/5000</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                    category === cat.value
                      ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20 dark:bg-brand-900/30 dark:border-brand-400 dark:text-brand-300'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-dark-900 dark:text-slate-400 dark:hover:border-slate-600'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Location <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Block A - 3rd Floor, Science Lab, Library..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white"
              />
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Attachments <span className="text-slate-400 font-normal">(Photos/Audio)</span>
            </label>
            <div className="mt-2 flex justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-6 py-8 bg-slate-50 dark:bg-dark-900/50 hover:bg-slate-100 dark:hover:bg-dark-900 transition-colors">
              <div className="text-center">
                <Paperclip className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
                <div className="mt-4 flex text-sm leading-6 text-slate-600 dark:text-slate-400 justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-semibold text-brand-600 focus-within:outline-none hover:text-brand-500 dark:text-brand-400"
                  >
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*,audio/*" onChange={handleFileSelect} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-slate-500 mt-1">PNG, JPG, MP3, WAV up to 5MB (Max 5)</p>
              </div>
            </div>
            
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-800">
                    <div className="flex items-center gap-3">
                      {file.type.startsWith('image/') ? <Image size={18} className="text-blue-500" /> : <Mic size={18} className="text-amber-500" />}
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px] sm:max-w-xs">{file.name}</span>
                    </div>
                    <button type="button" onClick={() => removeFile(idx)} className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Info Banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30">
          <Sparkles size={18} className="text-indigo-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">AI-Powered Categorization</p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
              Our AI will automatically analyze your report to assign the correct category and urgency level. Critical and high-urgency reports are immediately escalated to campus security.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || !title.trim() || !description.trim()}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 text-white font-bold text-base shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:from-rose-700 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {submitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Submitting securely...
            </>
          ) : (
            <>
              <Send size={18} />
              Submit Report Securely
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          🔒 All reports are encrypted and stored securely. Your identity will be hidden from administrators.
        </p>
      </form>
        </>
      ) : (
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">My Submitted Reports</h2>
          {loadingIncidents ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 size={32} className="animate-spin mb-4" />
              <p>Loading your reports...</p>
            </div>
          ) : myIncidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center">
              <FileText size={48} className="text-slate-300 mb-4 dark:text-slate-600" />
              <p className="font-medium text-slate-600 dark:text-slate-300">No reports found.</p>
              <p className="text-sm mt-1">You haven't submitted any incident reports yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myIncidents.map((incident) => (
                <div key={incident._id} className="border border-slate-100 dark:border-slate-700 rounded-xl p-4 hover:bg-slate-50 dark:hover:bg-dark-750 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{incident.title}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                      incident.status === 'Resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      incident.status === 'Pending' || incident.status === 'New' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      incident.status === 'Dismissed' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {incident.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{incident.description}</p>
                  <div className="flex items-center gap-3 flex-wrap text-xs font-medium">
                    <span className="text-slate-500 dark:text-slate-400">{new Date(incident.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className={`px-2 py-0.5 rounded text-white ${urgencyColors[incident.urgency] || 'bg-slate-500'}`}>{incident.urgency}</span>
                    <span className="text-slate-500 bg-slate-100 dark:bg-dark-700 px-2 py-0.5 rounded">{incident.category}</span>
                    {incident.attachments && incident.attachments.length > 0 && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Paperclip size={12} /> {incident.attachments.length}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IncidentReportPage;

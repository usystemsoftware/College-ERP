import React, { useState } from 'react';
import { ShieldAlert, Send, Eye, EyeOff, MapPin, Paperclip, Sparkles, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { submitIncidentAPI } from '../../api/incidents.api';
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
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in the title and description');
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitIncidentAPI({
        title: title.trim(),
        description: description.trim(),
        category: category || undefined,
        location: location.trim() || undefined,
        isAnonymous,
      });
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
    setSubmitted(false);
    setAiResult(null);
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
          Anonymous Incident Report
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Report safety concerns, harassment, or emergencies. Your identity is protected by default. AI will automatically categorize and prioritize your report.
        </p>
      </div>

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
                  ? 'Your identity will not be stored or shared with anyone.'
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
          🔒 All reports are encrypted and stored securely. Anonymous reports cannot be traced back to you.
        </p>
      </form>
    </div>
  );
};

export default IncidentReportPage;

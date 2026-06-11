import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Filter, Clock, AlertTriangle, CheckCircle2, Eye, ChevronDown, Loader2, MessageSquare, X } from 'lucide-react';
import { getIncidentsAPI, updateIncidentAPI } from '../../api/incidents.api';
import toast from 'react-hot-toast';

const urgencyConfig = {
  Critical: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', dot: 'bg-red-500', border: 'border-red-200 dark:border-red-800/40' },
  High: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', dot: 'bg-orange-500', border: 'border-orange-200 dark:border-orange-800/40' },
  Medium: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', dot: 'bg-yellow-500', border: 'border-yellow-200 dark:border-yellow-800/40' },
  Low: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', dot: 'bg-green-500', border: 'border-green-200 dark:border-green-800/40' },
};

const statusConfig = {
  'New': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Under Review': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Investigating': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Resolved': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Dismissed': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const categoryEmoji = {
  'Safety Issue': '🛡️',
  'Harassment Complaint': '🚫',
  'Infrastructure Problem': '🏗️',
  'Medical Emergency': '🏥',
  'Bullying': '😤',
  'Theft': '🔒',
  'Other': '📋',
};

const IncidentDashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, investigating: 0, resolved: 0, critical: 0, high: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Detail modal
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchIncidents();
  }, [filterStatus, filterUrgency]);

  async function fetchIncidents() {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterUrgency) params.urgency = filterUrgency;
      const res = await getIncidentsAPI(params);
      setIncidents(res.data?.data?.incidents || []);
      setStats(res.data?.data?.stats || stats);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast.error('Failed to load incidents');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(incidentId, newStatus) {
    setUpdatingStatus(true);
    try {
      const payload = { status: newStatus };
      if (reviewNote.trim()) payload.reviewNote = reviewNote.trim();
      await updateIncidentAPI(incidentId, payload);
      toast.success(`Incident marked as ${newStatus}`);
      setReviewNote('');
      setSelectedIncident(null);
      fetchIncidents();
    } catch (error) {
      toast.error('Failed to update incident');
    } finally {
      setUpdatingStatus(false);
    }
  }

  const filteredIncidents = incidents.filter(i =>
    i.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent dark:from-rose-400 dark:to-orange-400">
            Incident Reports
          </h1>
          <p className="text-slate-500 mt-1">Review and manage anonymous campus incident reports.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Reports', value: stats.total, icon: ShieldAlert, color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800' },
          { label: 'New', value: stats.new, icon: AlertTriangle, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Investigating', value: stats.investigating, icon: Search, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Critical', value: stats.critical, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'High Priority', value: stats.high, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-dark-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
              <stat.icon size={16} className={stat.color} />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-700">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search incidents..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none dark:border-slate-700 dark:bg-dark-900 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="New">New</option>
            <option value="Under Review">Under Review</option>
            <option value="Investigating">Investigating</option>
            <option value="Resolved">Resolved</option>
            <option value="Dismissed">Dismissed</option>
          </select>
          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none dark:border-slate-700 dark:bg-dark-900 dark:text-white"
          >
            <option value="">All Urgency</option>
            <option value="Critical">🔴 Critical</option>
            <option value="High">🟠 High</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Low">🟢 Low</option>
          </select>
        </div>

        {/* Incident List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
              <Loader2 size={20} className="animate-spin" /> Loading incidents...
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
              <ShieldAlert size={32} className="text-slate-300" />
              <p className="text-sm">No incidents found.</p>
            </div>
          ) : (
            filteredIncidents.map((incident) => {
              const urg = urgencyConfig[incident.urgency] || urgencyConfig.Medium;
              return (
                <div
                  key={incident._id}
                  className={`flex items-start gap-4 p-5 hover:bg-slate-50/70 dark:hover:bg-dark-750/30 cursor-pointer transition-colors border-l-4 ${urg.border}`}
                  onClick={() => setSelectedIncident(incident)}
                >
                  <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${urg.dot} ${incident.urgency === 'Critical' ? 'animate-pulse' : ''}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">{incident.title}</h3>
                      {incident.isAnonymous && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                          ANONYMOUS
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                      {incident.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${urg.color}`}>
                        {incident.urgency}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${statusConfig[incident.status] || statusConfig.New}`}>
                        {incident.status}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {categoryEmoji[incident.category] || '📋'} {incident.category}
                      </span>
                      {incident.location && (
                        <span className="text-[11px] text-slate-400">📍 {incident.location}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-400">
                      {new Date(incident.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(incident.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detail / Action Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setSelectedIncident(null)}>
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-dark-800 shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-6 border-b border-slate-100 dark:border-slate-700">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-3 h-3 rounded-full ${(urgencyConfig[selectedIncident.urgency] || urgencyConfig.Medium).dot}`} />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">{selectedIncident.title}</h2>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${(urgencyConfig[selectedIncident.urgency] || urgencyConfig.Medium).color}`}>
                    {selectedIncident.urgency}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${statusConfig[selectedIncident.status] || statusConfig.New}`}>
                    {selectedIncident.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    {categoryEmoji[selectedIncident.category]} {selectedIncident.category}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedIncident(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-700 rounded-lg text-slate-400">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{selectedIncident.description}</p>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Submitted</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {new Date(selectedIncident.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Location</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{selectedIncident.location || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Reporter</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {selectedIncident.isAnonymous ? '🔒 Anonymous' : (selectedIncident.submittedBy?.email || 'Unknown')}
                  </p>
                </div>
                {selectedIncident.aiCategorization && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">AI Confidence</h4>
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {((selectedIncident.aiCategorization.confidence || 0) * 100).toFixed(0)}%
                    </p>
                  </div>
                )}
              </div>

              {/* AI Reasoning */}
              {selectedIncident.aiCategorization?.reasoning && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-xl p-4">
                  <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1">🤖 AI Analysis</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">{selectedIncident.aiCategorization.reasoning}</p>
                </div>
              )}

              {/* Review Notes */}
              {selectedIncident.reviewNotes?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Review Notes</h4>
                  <div className="space-y-2">
                    {selectedIncident.reviewNotes.map((note, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-dark-700 rounded-lg p-3">
                        <p className="text-sm text-slate-700 dark:text-slate-300">{note.note}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {note.addedBy?.email || 'Admin'} · {new Date(note.addedAt).toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Actions */}
              {selectedIncident.status !== 'Resolved' && selectedIncident.status !== 'Dismissed' && (
                <div className="border-t border-slate-100 dark:border-slate-700 pt-5 space-y-3">
                  <div className="relative">
                    <MessageSquare size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      placeholder="Add a review note (optional)..."
                      className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedIncident.status === 'New' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedIncident._id, 'Under Review')}
                        disabled={updatingStatus}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
                      >
                        Start Review
                      </button>
                    )}
                    {(selectedIncident.status === 'New' || selectedIncident.status === 'Under Review') && (
                      <button
                        onClick={() => handleUpdateStatus(selectedIncident._id, 'Investigating')}
                        disabled={updatingStatus}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
                      >
                        Mark Investigating
                      </button>
                    )}
                    <button
                      onClick={() => handleUpdateStatus(selectedIncident._id, 'Resolved')}
                      disabled={updatingStatus}
                      className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedIncident._id, 'Dismissed')}
                      disabled={updatingStatus}
                      className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentDashboard;

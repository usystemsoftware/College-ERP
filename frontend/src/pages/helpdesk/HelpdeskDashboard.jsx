import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { LifeBuoy, Plus, X, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { getMyTicketsAPI, getAllTicketsAPI, createTicketAPI, updateTicketStatusAPI } from '../../api/helpdesk.api';
import toast from 'react-hot-toast';

const TicketModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'IT Support',
    priority: 'Medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await createTicketAPI(formData);
      toast.success('Ticket submitted successfully');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-dark-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Raise a New Ticket</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-dark-800 dark:hover:text-slate-300">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Issue Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief description of the issue"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-dark-700 dark:bg-dark-950 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-dark-700 dark:bg-dark-950 dark:text-white"
              >
                <option value="IT Support">IT Support</option>
                <option value="Facilities & Maintenance">Facilities & Maintenance</option>
                <option value="Academic">Academic</option>
                <option value="Hostel">Hostel</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Priority</label>
              <select
                required
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-dark-700 dark:bg-dark-950 dark:text-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Detailed Description</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please provide as much detail as possible..."
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-dark-700 dark:bg-dark-950 dark:text-white"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-dark-700 dark:bg-dark-900 dark:text-slate-300">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
              {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const HelpdeskDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = ['Super Admin', 'College Admin', 'Principal', 'HOD'].includes(user?.role?.name || user?.role);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = isAdmin 
        ? await getAllTicketsAPI(filterStatus ? { status: filterStatus } : {}) 
        : await getMyTicketsAPI();
      setTickets(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [isAdmin, filterStatus]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateTicketStatusAPI(id, { status: newStatus });
      toast.success('Status updated');
      fetchTickets();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'In Progress': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Resolved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Closed': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 dark:text-red-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'Low': return 'text-green-600 dark:text-green-400';
      default: return 'text-slate-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return <AlertCircle size={14} />;
      case 'In Progress': return <RefreshCw size={14} className="animate-spin-slow" />;
      case 'Resolved': return <CheckCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LifeBuoy className="text-brand-500" /> Grievance & Helpdesk
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin ? 'Manage and resolve reported issues.' : 'Report issues and track their resolution status.'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {isAdmin && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-dark-700 dark:bg-dark-900 dark:text-white"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          )}
          {!isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              <Plus size={16} /> Raise Ticket
            </button>
          )}
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"></div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 dark:border-slate-700 dark:bg-dark-800/50">
          <div className="rounded-full bg-slate-200 p-4 text-slate-500 dark:bg-slate-800 dark:text-slate-400 mb-4">
            <CheckCircle size={32} />
          </div>
          <p className="text-lg font-medium text-slate-900 dark:text-white">No Tickets Found</p>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin ? "There are no tickets matching your filter." : "You haven't raised any tickets yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-dark-800 dark:bg-dark-900">
              
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2" title={ticket.title}>
                  {ticket.title}
                </h3>
                <span className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusColor(ticket.status)}`}>
                  {getStatusIcon(ticket.status)} {ticket.status}
                </span>
              </div>

              <p className="mb-4 flex-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                {ticket.description}
              </p>

              <div className="mb-4 grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-4 dark:border-dark-800">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-0.5">Category</p>
                  <p className="font-medium text-slate-900 dark:text-white">{ticket.category}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-0.5">Priority</p>
                  <p className={`font-semibold ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</p>
                </div>
                {isAdmin && ticket.createdBy && (
                  <div className="col-span-2 mt-1">
                    <p className="text-slate-500 dark:text-slate-400 mb-0.5">Reported By</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {ticket.createdBy.firstName} {ticket.createdBy.lastName} ({ticket.createdBy.role})
                    </p>
                  </div>
                )}
              </div>

              {/* Admin Actions */}
              {isAdmin && ticket.status !== 'Closed' && (
                <div className="mt-auto flex gap-2">
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusUpdate(ticket._id, e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium focus:border-brand-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800 dark:text-white"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Close Ticket</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <TicketModal 
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchTickets();
          }}
        />
      )}
    </div>
  );
};

export default HelpdeskDashboard;

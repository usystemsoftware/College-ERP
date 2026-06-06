import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Clock, Inbox, Search, Trash2, Loader2 } from 'lucide-react';
import { getMyNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../api/notifications.api';
import { subscribeToNotifications, unsubscribeFromNotifications } from '../../services/socket';
import { toast } from 'react-hot-toast';

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab !== 'All') {
        if (activeTab === 'Unread') params.status = 'Unread';
        else if (activeTab === 'Alerts') params.category = 'Alert';
        else params.category = activeTab; // Academic, Placements, etc.
      }
      const res = await getMyNotifications(params);
      setNotifications(res?.data?.data?.notifications || []);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    subscribeToNotifications((newNotif) => {
      // Prepend the new notification if it matches the current tab filter
      setNotifications(prev => [
        { ...newNotif, _id: newNotif._id || Date.now(), createdAt: new Date().toISOString(), status: 'Unread' },
        ...prev
      ]);
    });

    return () => {
      unsubscribeFromNotifications();
    };
  }, [activeTab]);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'Read' } : n));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, status: 'Read' })));
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const filteredNotifications = notifications.filter(n => 
    n.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications center</h1>
          <p className="text-sm text-slate-500">Stay updated with alerts, academic notices, and campus news.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-dark-800 dark:hover:bg-dark-750 text-brand-600"
          >
            <CheckCircle2 size={16} />
            Mark all as read
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-dark-800">
        <div className="flex flex-col sm:flex-row border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-1 overflow-x-auto hide-scrollbar p-2 gap-2">
            {['All', 'Unread', 'Academic', 'Alerts', 'Placement', 'General'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab 
                    ? 'bg-slate-100 text-slate-900 dark:bg-dark-700 dark:text-white' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="p-2 sm:border-l border-slate-200 dark:border-slate-800">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search notifications..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent pl-9 pr-3 py-2 text-sm outline-none text-slate-700 dark:text-slate-300" 
              />
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-slate-100 p-4 dark:bg-dark-800">
                <Inbox className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">You're all caught up!</h3>
              <p className="mt-1 text-sm text-slate-500">No new notifications right now.</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div key={notif._id} className={`flex gap-4 p-5 hover:bg-slate-50 dark:hover:bg-dark-750/50 transition-colors group ${notif.status === 'Unread' ? 'bg-brand-50/30 dark:bg-brand-900/10' : ''}`}>
                <div className="mt-1">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    notif.category === 'Alert' ? 'bg-red-100 text-red-500 dark:bg-red-500/20' :
                    notif.category === 'Academic' ? 'bg-indigo-100 text-indigo-500 dark:bg-indigo-500/20' :
                    notif.category === 'Placement' ? 'bg-emerald-100 text-emerald-500 dark:bg-emerald-500/20' :
                    'bg-brand-100 text-brand-500 dark:bg-brand-500/20'
                  }`}>
                    <Bell size={20} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className={`text-sm ${notif.status === 'Unread' ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                        {notif.title}
                      </h4>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {notif.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock size={12}/> {formatTime(notif.createdAt)}
                      </span>
                      {notif.status === 'Unread' && <span className="h-2 w-2 rounded-full bg-brand-500"></span>}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    {notif.status === 'Unread' && (
                      <button 
                        onClick={() => handleMarkAsRead(notif._id)}
                        className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                      >
                        Mark as read
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(notif._id)}
                      className="text-xs font-medium text-red-500 flex items-center gap-1 hover:text-red-600"
                    >
                      <Trash2 size={12}/> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;

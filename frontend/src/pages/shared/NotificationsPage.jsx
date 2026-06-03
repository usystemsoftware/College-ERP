import React, { useState } from 'react';
import { Bell, Check, CheckCircle2, Clock, Inbox, Search, Trash2 } from 'lucide-react';

const mockNotifications = [
  { id: 1, title: 'Fee Payment Overdue', message: 'Your tuition fee for Semester 5 is overdue by 5 days. Please pay immediately to avoid late fines.', type: 'Alert', time: '10 mins ago', read: false },
  { id: 2, title: 'New Assignment Uploaded', message: 'Dr. Alan Turing has uploaded a new assignment for Data Structures. Deadline is Oct 15.', type: 'Academic', time: '2 hours ago', read: false },
  { id: 3, title: 'Gate Pass Approved', message: 'Your gate pass request for weekend excursion has been approved by the hostel warden.', type: 'General', time: '1 day ago', read: true },
  { id: 4, title: 'Campus Drive: Google', message: 'Google is visiting the campus next week. Eligible students must register before Friday.', type: 'Placement', time: '2 days ago', read: true },
  { id: 5, title: 'Library Book Due', message: 'The book "Introduction to Algorithms" is due tomorrow. Please return or renew.', type: 'Reminder', time: '3 days ago', read: true },
];

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState('All');

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications center</h1>
          <p className="text-sm text-slate-500">Stay updated with alerts, academic notices, and campus news.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-dark-800 dark:hover:bg-dark-750 text-brand-600">
            <CheckCircle2 size={16} />
            Mark all as read
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-dark-800">
        <div className="flex flex-col sm:flex-row border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-1 overflow-x-auto hide-scrollbar p-2 gap-2">
            {['All', 'Unread', 'Academic', 'Alerts', 'Placements'].map(tab => (
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
              <input type="text" placeholder="Search notifications..." className="w-full bg-transparent pl-9 pr-3 py-2 text-sm outline-none text-slate-700 dark:text-slate-300" />
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {mockNotifications.map((notif) => (
            <div key={notif.id} className={`flex gap-4 p-5 hover:bg-slate-50 dark:hover:bg-dark-750/50 transition-colors group ${!notif.read ? 'bg-brand-50/30 dark:bg-brand-900/10' : ''}`}>
              <div className="mt-1">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  notif.type === 'Alert' ? 'bg-red-100 text-red-500 dark:bg-red-500/20' :
                  notif.type === 'Academic' ? 'bg-indigo-100 text-indigo-500 dark:bg-indigo-500/20' :
                  notif.type === 'Placement' ? 'bg-emerald-100 text-emerald-500 dark:bg-emerald-500/20' :
                  'bg-brand-100 text-brand-500 dark:bg-brand-500/20'
                }`}>
                  <Bell size={20} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className={`text-sm ${!notif.read ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                      {notif.title}
                    </h4>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {notif.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={12}/> {notif.time}
                    </span>
                    {!notif.read && <span className="h-2 w-2 rounded-full bg-brand-500"></span>}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                    Mark as read
                  </button>
                  <button className="text-xs font-medium text-red-500 flex items-center gap-1 hover:text-red-600">
                    <Trash2 size={12}/> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {mockNotifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-slate-100 p-4 dark:bg-dark-800">
                <Inbox className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">You're all caught up!</h3>
              <p className="mt-1 text-sm text-slate-500">No new notifications right now.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;

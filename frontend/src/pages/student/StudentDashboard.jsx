import React from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Award,
  Bell
} from 'lucide-react';
import { useSelector } from 'react-redux';

const StudentDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 p-8 shadow-lg dark:from-brand-800 dark:to-indigo-900">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>

        <div className="relative z-10 text-white">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="mt-2 max-w-xl text-brand-100">
            You have 2 assignments due this week and your overall attendance is looking great. Keep up the good work!
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="rounded-lg bg-green-500/10 p-3 text-green-500">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Attendance</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">88%</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="rounded-lg bg-brand-500/10 p-3 text-brand-500">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Enrolled Courses</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">6</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="rounded-lg bg-orange-500/10 p-3 text-orange-500">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Assignments</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">2</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="rounded-lg bg-indigo-500/10 p-3 text-indigo-500">
            <Award size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Current CGPA</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">8.4</p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's Schedule */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Today's Schedule</h3>
            <button className="text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400">View Full Timetable</button>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-750 dark:bg-dark-750">
              <div className="flex flex-col items-center justify-center rounded bg-white px-3 py-2 text-center shadow-sm dark:bg-dark-850">
                <span className="text-xs font-semibold text-slate-500">09:00</span>
                <span className="text-xs text-slate-400">AM</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">Data Structures & Algorithms</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Room 304 • Prof. Alan Turing</p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-750 dark:bg-dark-750">
              <div className="flex flex-col items-center justify-center rounded bg-white px-3 py-2 text-center shadow-sm dark:bg-dark-850">
                <span className="text-xs font-semibold text-slate-500">11:30</span>
                <span className="text-xs text-slate-400">AM</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">Database Management Systems</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Lab 2 • Prof. Grace Hopper</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Announcements</h3>
            <Bell size={18} className="text-slate-400" />
          </div>
          <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">

            <div className="pt-2 pb-4">
              <span className="mb-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                EXAMS
              </span>
              <h4 className="font-semibold text-slate-900 dark:text-white">Mid-Semester Exam Schedule Released</h4>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                The detailed schedule for the upcoming mid-semester examinations is now available on the portal. Please download your hall tickets before Friday.
              </p>
              <p className="mt-2 text-xs text-slate-400">Posted 2 hours ago</p>
            </div>

            <div className="pt-4">
              <span className="mb-1 inline-block rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                EVENTS
              </span>
              <h4 className="font-semibold text-slate-900 dark:text-white">Annual Tech Fest Registrations Open</h4>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                Join us for the biggest tech event of the year. Register your team for hackathons, coding challenges, and robotics competitions.
              </p>
              <p className="mt-2 text-xs text-slate-400">Posted yesterday</p>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default StudentDashboard;

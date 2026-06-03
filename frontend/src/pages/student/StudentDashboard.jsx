import React from 'react';
<<<<<<< HEAD
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

=======
import { useSelector } from 'react-redux';
import { BookOpen, Calendar, Clock, GraduationCap, DollarSign, Library, FileText, Download } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const mockAttendance = [
  { name: 'Present', value: 85, color: '#10b981' },
  { name: 'Absent', value: 15, color: '#f43f5e' },
];

const StudentDashboard = () => {
  const { user } = useSelector(state => state.auth);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 p-6 shadow-lg">
        <div className="flex items-center gap-4 text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <GraduationCap size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              Hello, {user?.email?.split('@')[0] || 'Student'}!
            </h1>
            <p className="mt-1 text-sm text-brand-100">
              B.Tech Computer Science • Semester 5 • Division A
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition">
            View ID Card
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Attendance Summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800 flex flex-col justify-between">
          <div>
            <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Clock size={18} /> Attendance Overview
            </h3>
            <p className="text-xs text-slate-500 mt-1">Current Semester</p>
          </div>
          <div className="relative h-48 w-full mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockAttendance}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {mockAttendance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">85%</span>
              <span className="text-xs font-semibold text-green-500">Good</span>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Calendar size={18} /> Today's Classes
            </h3>
            <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-1 rounded dark:bg-brand-900/30 dark:text-brand-400">
              3 Remaining
            </span>
          </div>
          <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent dark:before:via-slate-800">
            {[
              { time: '09:00 AM', subject: 'Data Structures', room: 'L-101', done: true },
              { time: '11:15 AM', subject: 'Operating Systems', room: 'L-102', done: false },
              { time: '02:00 PM', subject: 'OS Lab', room: 'Lab-3', done: false },
            ].map((cls, i) => (
              <div key={i} className={`relative flex items-center justify-between p-3 rounded-lg border ${cls.done ? 'bg-slate-50 border-slate-200 opacity-60 dark:bg-dark-900 dark:border-slate-800' : 'bg-white border-brand-200 dark:bg-dark-800 dark:border-brand-800'}`}>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">{cls.subject}</h4>
                  <p className="text-xs text-slate-500">{cls.time} • {cls.room}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Center */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800 flex flex-col gap-4">
          <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200">Action Center</h3>
          
          <div className="flex items-center justify-between p-4 rounded-xl border border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg dark:bg-orange-900/50 dark:text-orange-400">
                <DollarSign size={20} />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Fees Due</p>
                <p className="text-xs text-slate-500">₹25,000 pending</p>
              </div>
            </div>
            <button className="text-xs font-bold text-white bg-orange-500 px-3 py-1.5 rounded-lg hover:bg-orange-600">Pay</button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/50 dark:text-blue-400">
                <FileText size={20} />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">2 Assignments</p>
                <p className="text-xs text-slate-500">Due this week</p>
              </div>
            </div>
            <button className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-900 border border-transparent dark:border-blue-800">View</button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg dark:bg-emerald-900/50 dark:text-emerald-400">
                <Library size={20} />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Library</p>
                <p className="text-xs text-slate-500">1 book to return</p>
              </div>
            </div>
          </div>

        </div>
      </div>
>>>>>>> 7b4a3a7751aa63252c46edeef69f5e1c88a642af
    </div>
  );
};

export default StudentDashboard;

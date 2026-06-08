import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BookOpen, Calendar, Clock, Users, GraduationCap, FileText, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';
import { QRCodeSVG } from 'qrcode.react';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const FacultyDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const { socket } = useNotification();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // View QR Modal state
  const [viewQRModalOpen, setViewQRModalOpen] = useState(false);
  const [activeQRData, setActiveQRData] = useState(null);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewNotification = (data) => {
      if (data.metadata?.type === 'QR_ATTENDANCE') {
        toast((t) => (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800">📋 New QR Attendance for {data.metadata.subject || 'Class'}</p>
              <p className="text-xs text-slate-500 line-clamp-1">{data.message}</p>
            </div>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                setActiveQRData(data.metadata);
                setViewQRModalOpen(true);
              }}
              className="bg-brand-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-brand-600 transition-colors whitespace-nowrap"
            >
              Tap to view
            </button>
          </div>
        ), { duration: 15000, position: 'top-right' });
      }
    };

    socket.on('new_notification', handleNewNotification);
    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/faculty/dashboard');
        setStats(response.data.data);
      } catch (error) {
        console.error("Failed to fetch faculty stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleMarkAttendance = async (timetableId, status) => {
    try {
      await api.post('/attendance/faculty-lecture', {
        timetableId,
        date: new Date().toISOString().split('T')[0],
        status
      });
      // update local stats
      setStats(prev => {
        if(!prev) return prev;
        const newClasses = prev.todaysClasses.map(cls => {
          if(cls._id === timetableId) {
            return { ...cls, done: status === 'Present', attendanceStatus: status };
          }
          return cls;
        });
        return { ...prev, todaysClasses: newClasses };
      });
    } catch(err) {
      console.error("Failed to mark attendance", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"></div>
      </div>
    );
  }

  const todaysClasses = stats?.todaysClasses || [];
  const attendanceStats = stats?.attendanceStats || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-6 dark:border-brand-900/50 dark:bg-brand-900/10">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400">
            <GraduationCap size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome back, {user?.email?.split('@')[0] || 'Professor'}!
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              You have {todaysClasses.length} classes scheduled for today. {stats?.pendingGrading || 0} assignments are pending grading.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Today's Classes</span>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500"><Calendar size={20} /></div>
          </div>
          <div className="mt-4"><h3 className="text-2xl font-bold text-slate-900 dark:text-white">{todaysClasses.length}</h3></div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Total Students</span>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-500"><Users size={20} /></div>
          </div>
          <div className="mt-4"><h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.totalStudents || 0}</h3></div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Pending Grading</span>
            <div className="rounded-lg bg-orange-500/10 p-2 text-orange-500"><FileText size={20} /></div>
          </div>
          <div className="mt-4"><h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.pendingGrading || 0}</h3></div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Avg Attendance</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500"><CheckCircle size={20} /></div>
          </div>
          <div className="mt-4"><h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.avgAttendance || 0}%</h3></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's Schedule */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-dark-800">
          <h3 className="text-md font-semibold mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Clock size={18} /> Today's Schedule
          </h3>
          <div className="space-y-4">
            {todaysClasses.map((cls, i) => (
              <div key={i} className={`flex items-center justify-between rounded-lg border p-4 ${cls.done ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-900/10' : 'border-brand-200 bg-brand-50 dark:border-brand-900/30 dark:bg-brand-900/10'}`}>
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-2 rounded-full ${cls.done ? 'bg-emerald-500' : 'bg-brand-500'}`}></div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{cls.subject}</p>
                    <p className="text-xs text-slate-500">{cls.time} • Room {cls.room}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${cls.type === 'Theory' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                    {cls.type}
                  </span>
                  
                  {/* Self-attendance marking buttons */}
                  {cls._id && (
                    <div className="flex gap-1 border-l pl-4 dark:border-slate-700">
                      <button 
                        onClick={() => handleMarkAttendance(cls._id, 'Present')}
                        className={`p-1.5 rounded-md transition-colors ${cls.attendanceStatus === 'Present' ? 'bg-emerald-500 text-white' : 'text-emerald-600 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/50'}`}
                        title="Mark Present"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button 
                        onClick={() => handleMarkAttendance(cls._id, 'Absent')}
                        className={`p-1.5 rounded-md transition-colors ${cls.attendanceStatus === 'Absent' ? 'bg-red-500 text-white' : 'text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50'}`}
                        title="Mark Absent"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Insights Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-dark-800">
          <h3 className="text-md font-semibold mb-4 text-slate-800 dark:text-slate-200">Class Attendance Averages</h3>
          <div className="h-64 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceStats} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                <XAxis type="number" domain={[0, 100]} fontSize={12} stroke="#64748b" />
                <YAxis type="category" dataKey="subject" fontSize={12} stroke="#64748b" />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="classAvg" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* View QR Modal */}
      <Modal isOpen={viewQRModalOpen} onClose={() => setViewQRModalOpen(false)} title="Lecture QR Attendance">
        <div className="flex flex-col items-center justify-center p-6 space-y-6">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Display this QR code to your students. They can scan it from their portal to instantly mark their attendance.
          </p>
          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">
            {activeQRData?.qrSessionId && (
              <QRCodeSVG 
                value={activeQRData.qrSessionId} 
                size={256} 
                level="H" 
                includeMargin={true} 
              />
            )}
          </div>
          <div className="w-full rounded-lg bg-slate-50 p-4 border border-slate-100 dark:bg-dark-800 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-brand-100 text-brand-600 p-2 rounded-lg dark:bg-brand-900/40 dark:text-brand-400">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{activeQRData?.subject || 'Lecture'} Session</h4>
                  <p className="text-xs text-slate-500 font-medium">Session Active</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Expires In</span>
                <span className="text-lg font-bold text-rose-500 flex items-center gap-1">
                  <Clock size={16} /> 10:00
                </span>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FacultyDashboard;

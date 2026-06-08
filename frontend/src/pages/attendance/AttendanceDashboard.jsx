import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Save, Filter } from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import { QrCode, X, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { generateQRAPI } from '../../api/attendance.api';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

const AttendanceDashboard = () => {
  const { user } = useSelector(state => state.auth);
  
  const roleName = typeof user?.role === 'object' ? user?.role?.name : user?.role;
  const isStudent = roleName === 'Student';

  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrToken, setQrToken] = useState('');
  const [generatingQR, setGeneratingQR] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/attendance/dashboard');
        if (isStudent) {
          setStats(response.data.data);
        } else {
          setAttendance(response.data.data.students || []);
        }
      } catch (error) {
        console.error("Failed to fetch attendance stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [isStudent]);

  const handleStatusChange = (id, newStatus) => {
    setAttendance(attendance.map(student => 
      student.id === id ? { ...student, status: newStatus } : student
    ));
  };

  const handleSave = () => {
    console.log("Saved Attendance for", selectedDate, attendance);
    toast.success("Attendance saved successfully!");
  };

  const handleGenerateQR = async () => {
    setGeneratingQR(true);
    try {
      // Using a placeholder ObjectId for the subject since dropdowns are mock data
      const subjectId = '65fa123b456c789d012e345f'; 
      const res = await generateQRAPI({
        subject: subjectId,
        date: selectedDate,
        lectureType: 'Theory'
      });
      setQrToken(res.data.data.token);
      setQrModalOpen(true);
      toast.success('QR Token generated');
    } catch (error) {
      toast.error('Failed to generate QR Code. ' + (error.response?.data?.message || error.message));
    } finally {
      setGeneratingQR(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"></div>
      </div>
    );
  }

  if (isStudent) {
    const overall = stats?.overallAttendance || 0;
    const attended = stats?.classesAttended || 0;
    const missed = stats?.classesMissed || 0;

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Attendance</h1>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-dark-900">
            <h3 className="text-sm font-medium text-slate-500">Overall Attendance</h3>
            <p className="mt-2 text-4xl font-bold text-brand-600 dark:text-brand-400">{overall}%</p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-dark-800">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${overall}%` }}></div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-dark-900">
            <h3 className="text-sm font-medium text-slate-500">Classes Attended</h3>
            <p className="mt-2 text-4xl font-bold text-green-600 dark:text-green-400">{attended}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-dark-900">
            <h3 className="text-sm font-medium text-slate-500">Classes Missed</h3>
            <p className="mt-2 text-4xl font-bold text-red-600 dark:text-red-400">{missed}</p>
          </div>
        </div>
      </div>
    );
  }

  // Faculty View
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mark Attendance</h1>
          <p className="text-sm text-slate-500">Select course and date to mark student attendance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleGenerateQR}
            disabled={generatingQR}
            className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100 dark:border-brand-800/30 dark:bg-brand-900/20 dark:text-brand-400 dark:hover:bg-brand-900/40 transition disabled:opacity-50"
          >
            {generatingQR ? <Loader2 size={16} className="animate-spin" /> : <QrCode size={16} />} 
            Generate QR
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700 transition"
          >
            <Save size={16} /> Save Attendance
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-dark-900">
        
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 border-b border-slate-200 p-4 dark:border-slate-800 bg-slate-50 dark:bg-dark-800/50">
          <div className="flex items-center gap-2">
            <Calendar className="text-slate-400" size={18} />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none dark:border-slate-700 dark:bg-dark-900 dark:text-white"
            />
          </div>
          <select className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none dark:border-slate-700 dark:bg-dark-900 dark:text-white">
            <option>B.Tech CS - 5th Sem</option>
            <option>B.Tech ME - 3rd Sem</option>
          </select>
          <select className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none dark:border-slate-700 dark:bg-dark-900 dark:text-white">
            <option>Data Structures</option>
            <option>Operating Systems</option>
          </select>
        </div>

        {/* Attendance Roster */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-white font-semibold text-slate-500 dark:bg-dark-900">
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4">Roll No</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Quick Mark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {attendance.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-800/50 transition">
                  <td className="px-6 py-4 font-mono font-medium text-slate-700 dark:text-slate-300">{student.roll}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{student.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      student.status === 'Present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      student.status === 'Absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {student.status === 'Present' && <CheckCircle size={12} />}
                      {student.status === 'Absent' && <XCircle size={12} />}
                      {student.status === 'Late' && <Clock size={12} />}
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleStatusChange(student.id, 'Present')}
                        className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${student.status === 'Present' ? 'bg-green-500 text-white shadow-md shadow-green-500/30' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700'}`}
                        title="Present"
                      >
                        P
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student.id, 'Absent')}
                        className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${student.status === 'Absent' ? 'bg-red-500 text-white shadow-md shadow-red-500/30' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700'}`}
                        title="Absent"
                      >
                        A
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student.id, 'Late')}
                        className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${student.status === 'Late' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700'}`}
                        title="Late"
                      >
                        L
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} title="Lecture QR Attendance">
        <div className="flex flex-col items-center justify-center p-6 space-y-6">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Ask students to scan this QR code from their portal to instantly mark their attendance. 
            This code will expire in 10 minutes.
          </p>
          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">
            {qrToken && (
              <QRCodeSVG 
                value={qrToken} 
                size={256} 
                level="H" 
                includeMargin={true} 
              />
            )}
          </div>
          <div className="w-full rounded-lg bg-slate-50 p-4 border border-slate-100 dark:bg-dark-800 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <QrCode className="text-brand-500" size={24} />
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Active Session</h4>
                <p className="text-xs text-slate-500">Date: {selectedDate} | Type: Theory</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AttendanceDashboard;

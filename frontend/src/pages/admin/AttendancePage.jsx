import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Filter, CheckCircle, XCircle, Clock, Search, Download, Radio, MapPin, User, RefreshCw, QrCode, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getSubjects } from '../../api/academic.api';
import { getStudentsAPI } from '../../api/students.api';
import { getAttendanceBySubjectDateAPI, markAttendanceAPI, getAdminLiveFeedAPI, generateQRAPI } from '../../api/attendance.api';
import { getSocket } from '../../services/socket';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

const mockTrendData = [
  { name: 'Week 1', rate: 95 },
  { name: 'Week 2', rate: 92 },
  { name: 'Week 3', rate: 88 },
  { name: 'Week 4', rate: 94 },
];

const AttendancePage = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Live feed state
  const [liveFeed, setLiveFeed] = useState([]);
  const [liveFeedLoading, setLiveFeedLoading] = useState(true);
  const liveFeedRef = useRef(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSubject, setModalSubject] = useState('');
  const [modalDate, setModalDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalLectureType, setModalLectureType] = useState('Theory');
  const [students, setStudents] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({}); // { studentId: 'Present'|'Absent'|'Late' }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // QR Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrToken, setQrToken] = useState('');
  const [generatingQR, setGeneratingQR] = useState(false);

  useEffect(() => {
    fetchSubjects();
    fetchLiveFeed();
  }, []);

  // Socket listener for real-time student check-ins
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = (data) => {
      setLiveFeed(prev => [data, ...prev].slice(0, 50));
      // scroll to top of live feed
      if (liveFeedRef.current) liveFeedRef.current.scrollTop = 0;
    };
    socket.on('student_checkin', handler);
    return () => socket.off('student_checkin', handler);
  }, []);

  useEffect(() => {
    if (subject && date) {
      fetchAttendanceData();
    }
  }, [subject, date]);

  const fetchSubjects = async () => {
    try {
      const res = await getSubjects();
      const list = res.data?.data || [];
      setSubjects(list);
      if (list.length > 0) {
        setSubject(list[0]._id);
        setModalSubject(list[0]._id);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchLiveFeed = async () => {
    setLiveFeedLoading(true);
    try {
      const res = await getAdminLiveFeedAPI();
      const records = res.data?.data || [];
      // Normalize to match socket payload shape
      const normalized = records.map(r => ({
        type: 'student_checkin',
        student: {
          id: r.student?._id,
          name: r.student?.personalDetails?.fullName,
          rollNumber: r.student?.rollNumber,
          department: r.student?.department?.name,
        },
        checkInTime: r.checkInTime,
        location: r.location || {},
      }));
      setLiveFeed(normalized);
    } catch (err) {
      console.error('Live feed error:', err);
    } finally {
      setLiveFeedLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const res = await getAttendanceBySubjectDateAPI({ subject, date });
      setAttendanceRecords(res.data?.data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsForModal = async () => {
    if (!modalSubject) return;
    setModalLoading(true);
    try {
      const selectedSubjObj = subjects.find(s => s._id === modalSubject);
      if (!selectedSubjObj) return;

      let res = await getStudentsAPI({
        department: selectedSubjObj.department?._id || selectedSubjObj.department,
        course: selectedSubjObj.course?._id || selectedSubjObj.course,
        semester: selectedSubjObj.semester?._id || selectedSubjObj.semester,
        limit: 1000 // get all
      });
      let studentList = res.data?.data?.students || [];

      // Fallback: If no students match the exact subject criteria, just fetch all students
      // so the user can still mark attendance (useful for mock data environments)
      if (studentList.length === 0) {
        res = await getStudentsAPI({ limit: 1000 });
        studentList = res.data?.data?.students || [];
      }
      setStudents(studentList);
      
      const initialStatus = {};
      studentList.forEach(s => {
        initialStatus[s._id] = 'Present'; // default to Present
      });
      setAttendanceStatus(initialStatus);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen && modalSubject) {
      fetchStudentsForModal();
    }
  }, [isModalOpen, modalSubject]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceStatus(prev => ({ ...prev, [studentId]: status }));
  };

  const submitAttendance = async () => {
    setIsSubmitting(true);
    try {
      const records = Object.keys(attendanceStatus).map(studentId => ({
        student: studentId,
        status: attendanceStatus[studentId],
        remarks: ''
      }));

      await markAttendanceAPI({
        subject: modalSubject,
        date: modalDate,
        lectureType: modalLectureType,
        records
      });

      alert('Attendance marked successfully!');
      setIsModalOpen(false);
      if (subject === modalSubject && date === modalDate) {
        fetchAttendanceData();
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert(error.response?.data?.message || error.message || 'Failed to mark attendance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateQR = async () => {
    if (!subject || !date) {
      toast.error('Please select a subject and date first');
      return;
    }
    setGeneratingQR(true);
    try {
      const res = await generateQRAPI({
        subject: subject,
        date: date,
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

  // Stats calculation
  const totalStudents = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const overallRate = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 0;
  
  const filteredRecords = attendanceRecords.filter(r => 
    r.student?.personalDetails?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.student?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance Management</h1>
          <p className="text-sm text-slate-500">Track, mark and review student attendance records.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-dark-800 dark:hover:bg-dark-750 text-slate-700 dark:text-slate-300">
            <Download size={16} />
            Export Report
          </button>
          <button 
            onClick={handleGenerateQR}
            disabled={generatingQR}
            className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100 dark:border-brand-800/30 dark:bg-brand-900/20 dark:text-brand-400 dark:hover:bg-brand-900/40 transition disabled:opacity-50"
          >
            {generatingQR ? <Loader2 size={16} className="animate-spin" /> : <QrCode size={16} />} 
            Generate QR
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
          >
            <CheckCircle size={16} />
            Mark Today's Attendance
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="text-sm font-semibold text-slate-500">Selected Subject Attendance Rate</div>
          <div className="mt-2 text-3xl font-bold text-brand-600">{overallRate}%</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="text-sm font-semibold text-slate-500">Total Students Present</div>
          <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{presentCount} / {totalStudents}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <div className="text-sm font-semibold text-slate-500">Total Absent</div>
          <div className="mt-2 text-3xl font-bold text-red-500">{totalStudents - presentCount}</div>
        </div>
      </div>

      {/* ─── Live Self Check-In Feed ─── */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-dark-800 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Radio size={16} className="text-rose-500 animate-pulse" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Live Student Self Check-Ins</span>
            <span className="ml-2 inline-flex items-center rounded-full bg-rose-100 dark:bg-rose-900/30 px-2 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
              Today · {liveFeed.length}
            </span>
          </div>
          <button onClick={fetchLiveFeed} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-700 text-slate-400 transition" title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>
        <div ref={liveFeedRef} className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {liveFeedLoading ? (
            <div className="flex items-center justify-center py-8 text-slate-400 text-sm gap-2">
              <RefreshCw size={14} className="animate-spin" /> Loading feed…
            </div>
          ) : liveFeed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400 text-sm gap-2">
              <Radio size={20} className="text-slate-300" />
              No student self check-ins yet today
            </div>
          ) : (
            liveFeed.map((entry, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-dark-750/40 transition">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                    {entry.student?.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{entry.student?.name || 'Unknown'}</p>
                    <p className="text-xs text-slate-400">{entry.student?.rollNumber} {entry.student?.department ? `· ${entry.student.department}` : ''}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {entry.checkInTime ? new Date(entry.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'}
                  </span>
                  {entry.location?.latitude ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <MapPin size={10} /> GPS ✓
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">No GPS</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Attendance Table */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-dark-800">
          <div className="flex flex-col sm:flex-row gap-4 border-b border-slate-200 p-5 dark:border-slate-800 sm:items-center justify-between">
            <div className="flex gap-4 items-center">
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-dark-900 dark:text-white"
              />
              <select 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-dark-900 dark:text-white"
              >
                {subjects.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search student..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm outline-none dark:border-slate-700 dark:bg-dark-900 dark:text-white" 
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 dark:bg-dark-850 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3 font-semibold">Student Name</th>
                  <th className="px-6 py-3 font-semibold">Roll No</th>
                  <th className="px-6 py-3 font-semibold">Lecture Type</th>
                  <th className="px-6 py-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan="4" className="px-6 py-4 text-center text-slate-500">Loading attendance...</td></tr>
                ) : filteredRecords.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-4 text-center text-slate-500">No attendance records found for this date and subject.</td></tr>
                ) : (
                  filteredRecords.map((record, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-dark-750/30">
                      <td className="px-6 py-4 font-medium dark:text-white">{record.student?.personalDetails?.fullName}</td>
                      <td className="px-6 py-4 dark:text-slate-300">{record.student?.rollNumber}</td>
                      <td className="px-6 py-4 dark:text-slate-300">{record.lectureType}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          record.status === 'Present' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                          record.status === 'Late' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' :
                          'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar trend graph */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-dark-800">
          <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-200">Attendance Trends (Mock)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrendData}>
                <defs>
                  <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" fontSize={12} stroke="#888" />
                <YAxis fontSize={12} stroke="#888" domain={[0, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="rate" stroke="#10b981" fillOpacity={1} fill="url(#colorAtt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Mark Attendance Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 transition-all duration-300">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/5 dark:bg-dark-800 dark:ring-white/10 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Mark Attendance</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                <select 
                  value={modalSubject}
                  onChange={(e) => setModalSubject(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-dark-900 dark:text-white"
                >
                  {subjects.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input 
                  type="date"
                  value={modalDate}
                  onChange={(e) => setModalDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-dark-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lecture Type</label>
                <select 
                  value={modalLectureType}
                  onChange={(e) => setModalLectureType(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-dark-900 dark:text-white"
                >
                  <option value="Theory">Theory</option>
                  <option value="Practical">Practical</option>
                  <option value="Tutorial">Tutorial</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 sticky top-0 z-10 dark:bg-dark-900">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Roll No</th>
                    <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Student Name</th>
                    <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {modalLoading ? (
                    <tr><td colSpan="3" className="px-4 py-8 text-center text-slate-500">Loading students...</td></tr>
                  ) : students.length === 0 ? (
                    <tr><td colSpan="3" className="px-4 py-8 text-center text-slate-500">No students found for this subject's batch.</td></tr>
                  ) : (
                    students.map(student => (
                      <tr key={student._id} className="hover:bg-slate-50 dark:hover:bg-dark-750/50">
                        <td className="px-4 py-3 dark:text-slate-300">{student.rollNumber}</td>
                        <td className="px-4 py-3 font-medium dark:text-white">{student.personalDetails?.fullName}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-1 bg-slate-50 dark:bg-dark-900 gap-1">
                            <button
                              onClick={() => handleStatusChange(student._id, 'Present')}
                              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                                attendanceStatus[student._id] === 'Present' 
                                  ? 'bg-green-500 text-white shadow-sm' 
                                  : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => handleStatusChange(student._id, 'Absent')}
                              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                                attendanceStatus[student._id] === 'Absent' 
                                  ? 'bg-red-500 text-white shadow-sm' 
                                  : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              onClick={() => handleStatusChange(student._id, 'Late')}
                              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                                attendanceStatus[student._id] === 'Late' 
                                  ? 'bg-yellow-500 text-white shadow-sm' 
                                  : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              Late
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button 
                onClick={submitAttendance}
                disabled={isSubmitting || students.length === 0}
                className="rounded-lg bg-brand-500 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      {/* QR Modal */}
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
                <p className="text-xs text-slate-500">Date: {date} | Subject: {subjects.find(s => s._id === subject)?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AttendancePage;

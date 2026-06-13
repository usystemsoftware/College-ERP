import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Filter, CheckCircle, XCircle, Clock, Search, Download, Radio, MapPin, User, RefreshCw, QrCode, Loader2, Send } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getSubjects } from '../../api/academic.api';
import { getStudentsAPI } from '../../api/students.api';
import { getAttendanceBySubjectDateAPI, markAttendanceAPI, getAdminLiveFeedAPI, generateQRAPI, sendQRToStudentsAPI, getAttendanceDashboardStatsAPI } from '../../api/attendance.api';
import { getFacultyAPI } from '../../api/faculty.api';
import { getSocket } from '../../services/socket';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';


const AttendancePage = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [trendData, setTrendData] = useState([]);

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
  const [qrTimeLeft, setQrTimeLeft] = useState(0);
  const [isLateQR, setIsLateQR] = useState(false);

  // Send QR Modal State
  const [sendQRModalOpen, setSendQRModalOpen] = useState(false);
  const [facultySearch, setFacultySearch] = useState('');
  const [facultyDeptFilter, setFacultyDeptFilter] = useState('All');
  const [selectedFacultyIds, setSelectedFacultyIds] = useState([]);
  const [sendMethod, setSendMethod] = useState('both');
  const [sendMessage, setSendMessage] = useState('');
  const [sendingQR, setSendingQR] = useState(false);
  const [sentFacultyIds, setSentFacultyIds] = useState([]);
  const [facultyList, setFacultyList] = useState([]);

  // Received QR Modal State
  const [viewQRModalOpen, setViewQRModalOpen] = useState(false);
  const [activeQRData, setActiveQRData] = useState(null);

  useEffect(() => {
    fetchSubjects();
    fetchLiveFeed();
    fetchFaculties();
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats() {
    try {
      const res = await getAttendanceDashboardStatsAPI();
      if (res.data?.data?.trendData) {
        setTrendData(res.data.data.trendData);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  }

  async function fetchFaculties() {
    try {
      const res = await getFacultyAPI({ limit: 1000 });
      setFacultyList(res.data?.data?.faculty || []);
    } catch (err) {
      console.error('Error fetching faculties:', err);
    }
  };

  // Socket listener for real-time student check-ins and notifications
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    
    const checkinHandler = (data) => {
      setLiveFeed(prev => [data, ...prev].slice(0, 50));
      if (liveFeedRef.current) liveFeedRef.current.scrollTop = 0;
    };
    
    const notificationHandler = (data) => {
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

    socket.on('student_checkin', checkinHandler);
    socket.on('new_notification', notificationHandler);
    
    return () => {
      socket.off('student_checkin', checkinHandler);
      socket.off('new_notification', notificationHandler);
    };
  }, []);

  useEffect(() => {
    if (subject && date) {
      fetchAttendanceData();
    }
  }, [subject, date]);

  async function fetchSubjects() {
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

  async function fetchLiveFeed() {
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

  async function fetchAttendanceData() {
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

  async function fetchStudentsForModal() {
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

  async function submitAttendance() {
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

  const handleGenerateQR = async (isLate = false) => {
    if (!subject || !date) {
      toast.error('Please select a subject and date first');
      return;
    }
    setGeneratingQR(true);
    try {
      const res = await generateQRAPI({
        subject: subject,
        date: date,
        lectureType: 'Theory',
        isLate: isLate === true
      });
      const newToken = res.data.data.token;
      setQrToken(newToken);
      setIsLateQR(isLate === true);
      setQrTimeLeft(res.data.data.expiresIn || 600);
      setQrModalOpen(true);
      toast.success(isLate ? 'Late QR Token generated' : 'QR Token generated');

      if (isLate === true && sentFacultyIds.length > 0) {
        await sendQRToStudentsAPI({
          qrSessionId: newToken,
          subjectId: subject,
          facultyIds: sentFacultyIds
        });
        toast.success(`Late QR auto-pushed to ${sentFacultyIds.length} faculty and class.`);
      }
    } catch (error) {
      toast.error('Failed to generate QR Code. ' + (error.response?.data?.message || error.message));
    } finally {
      setGeneratingQR(false);
    }
  };

  useEffect(() => {
    let interval;
    if (qrModalOpen && qrTimeLeft > 0) {
      interval = setInterval(() => {
        setQrTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            if (!isLateQR) {
              handleGenerateQR(true);
            } else {
              toast.error('Late Check-in Window Expired');
              setQrModalOpen(false);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [qrModalOpen, qrTimeLeft, isLateQR]); // Add dependencies to keep closure fresh

  async function handleSendQRToStudents() {
    if (selectedFacultyIds.length === 0) {
      toast.error('Please select at least one faculty');
      return;
    }
    setSendingQR(true);
    try {
      const res = await sendQRToStudentsAPI({
        qrSessionId: qrToken,
        subjectId: subject,
        facultyIds: selectedFacultyIds
      });
      toast.success(`✅ QR pushed to ${res.data.data.sentTo} students`);
      setSentFacultyIds(prev => [...prev, ...selectedFacultyIds]);
      setSelectedFacultyIds([]);
    } catch (error) {
      toast.error('Failed to push QR: ' + (error.response?.data?.message || error.message));
    } finally {
      setSendingQR(false);
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

  const filteredFaculty = facultyList.filter(f => {
    const deptName = f.department?.name || 'General';
    const fName = f.fullName || 'Unknown Faculty';
    return (facultyDeptFilter === 'All' || deptName === facultyDeptFilter) &&
           (fName.toLowerCase().includes(facultySearch.toLowerCase()) || deptName.toLowerCase().includes(facultySearch.toLowerCase()));
  });

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
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${record.status === 'Present' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
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
          <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-200">Attendance Trends</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${attendanceStatus[student._id] === 'Present'
                                  ? 'bg-green-500 text-white shadow-sm'
                                  : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => handleStatusChange(student._id, 'Absent')}
                              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${attendanceStatus[student._id] === 'Absent'
                                  ? 'bg-red-500 text-white shadow-sm'
                                  : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                              Absent
                            </button>
                            <button
                              onClick={() => handleStatusChange(student._id, 'Late')}
                              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${attendanceStatus[student._id] === 'Late'
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
          <div className={`w-full ${isLateQR ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800/50 dark:text-amber-300' : 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-900/30 dark:border-brand-800/50 dark:text-brand-300'} border rounded-lg p-3 text-sm flex items-start gap-3`}>
            <CheckCircle className="shrink-0 mt-0.5" size={18} />
            <p>
              <strong className={`block mb-1 ${isLateQR ? 'text-amber-800 dark:text-amber-200' : 'text-brand-800 dark:text-brand-200'}`}>
                {isLateQR ? 'Late Check-in Window Active!' : 'You have received this active QR from the Superadmin!'}
              </strong>
              {isLateQR 
                ? 'Students scanning this QR will be marked as Late. Display this QR code to your students.' 
                : 'Display this QR code to your students. They can scan it from their portal to instantly mark their attendance for this session.'}
            </p>
          </div>
          <div className={`p-4 bg-white rounded-xl shadow-sm border ${isLateQR ? 'border-amber-300 shadow-amber-100 dark:border-amber-700 dark:shadow-none' : 'border-slate-200'}`}>
            {qrToken && (
              <QRCodeSVG
                value={qrToken}
                size={256}
                level="H"
                includeMargin={true}
                fgColor={isLateQR ? "#d97706" : "#000000"}
              />
            )}
          </div>
          <div className="w-full rounded-lg bg-slate-50 p-4 border border-slate-100 dark:bg-dark-800 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <QrCode className={isLateQR ? "text-amber-500" : "text-brand-500"} size={24} />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{isLateQR ? 'Late Session' : 'Active Session'}</h4>
                <p className="text-xs text-slate-500">Date: {date} | Subject: {subjects.find(s => s._id === subject)?.name}</p>
              </div>
              <div className="flex flex-col items-end mr-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Expires In</span>
                <span className="text-lg font-bold text-rose-500 flex items-center gap-1">
                  <Clock size={16} /> 
                  {Math.floor(qrTimeLeft / 60).toString().padStart(2, '0')}:{(qrTimeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <button
                onClick={() => setSendQRModalOpen(true)}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${isLateQR ? 'border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30' : 'border-brand-500 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30'}`}
              >
                <Send size={16} />
                Push to Class
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Push QR to Class Modal */}
      <Modal isOpen={sendQRModalOpen} onClose={() => setSendQRModalOpen(false)} title="Push QR to Class">
        <div className="p-6 flex flex-col max-h-[85vh]">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Select faculty members to push this QR to their enrolled students in real-time.
          </p>
          
          {/* Lecture Info Card */}
          <div className="flex items-center justify-between p-3 mb-6 bg-slate-50 border border-slate-200 rounded-lg dark:bg-dark-800 dark:border-slate-700">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lecture Session</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{subjects.find(s => s._id === subject)?.name || 'Class'} • {date}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 mb-1">
                Active
              </span>
              <p className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12} /> Expires in 10:00</p>
            </div>
          </div>

          {/* Section 2 — Faculty Selection */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search faculty by name or department..."
                  value={facultySearch}
                  onChange={(e) => setFacultySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white dark:bg-dark-900 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
              {['All', 'CSE', 'IT', 'MECH', 'CIVIL', 'ECE'].map(dept => (
                <button
                  key={dept}
                  onClick={() => setFacultyDeptFilter(dept)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${facultyDeptFilter === dept ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-dark-700 dark:text-slate-300 dark:hover:bg-dark-600'}`}
                >
                  {dept}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center mb-2 px-1">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filteredFaculty.length > 0 && selectedFacultyIds.length === filteredFaculty.length}
                  onChange={(e) => setSelectedFacultyIds(e.target.checked ? filteredFaculty.map(f => f.id) : [])}
                  className="rounded text-brand-500 focus:ring-brand-500"
                />
                Select All
              </label>
              <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                {selectedFacultyIds.length} faculty selected
              </span>
            </div>

            <div className="overflow-y-auto max-h-[300px] border border-slate-200 rounded-lg divide-y divide-slate-100 dark:border-slate-700 dark:divide-slate-800">
              {filteredFaculty.map(faculty => {
                const fName = faculty.fullName || 'Unknown Faculty';
                const deptName = faculty.department?.name || 'General';
                const isOnline = faculty.user?.status === 'active' || faculty.user?.status === 'Active';
                return (
                <label key={faculty._id} className="flex items-center p-3 hover:bg-slate-50 dark:hover:bg-dark-750/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedFacultyIds.includes(faculty._id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedFacultyIds(prev => [...prev, faculty._id]);
                      else setSelectedFacultyIds(prev => prev.filter(id => id !== faculty._id));
                    }}
                    className="rounded text-brand-500 focus:ring-brand-500 mt-1"
                  />
                  <div className="ml-3 relative">
                    <div className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
                      {fName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-dark-800 ${isOnline ? 'bg-green-400' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {fName}
                      {sentFacultyIds.includes(faculty._id) && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold dark:bg-green-900/30 dark:text-green-400">Sent ✓</span>}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <span className="inline-block bg-slate-100 dark:bg-dark-700 px-1.5 py-0.5 rounded mr-2">{deptName}</span>
                      {faculty.designation || 'Faculty'}
                    </p>
                  </div>
                </label>
              )})}
              {filteredFaculty.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-sm">No faculty members found.</div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setSendQRModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg dark:text-slate-300 dark:hover:bg-dark-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSendQRToStudents}
              disabled={selectedFacultyIds.length === 0 || sendingQR}
              className="px-6 py-2 text-sm font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
            >
              {sendingQR ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Push to Students ({selectedFacultyIds.length})
            </button>
          </div>
        </div>
      </Modal>

      {/* Received QR Modal */}
      <Modal isOpen={viewQRModalOpen} onClose={() => setViewQRModalOpen(false)} title="Lecture QR Attendance">
        <div className="flex flex-col items-center justify-center p-6 space-y-6">
          <div className="w-full bg-brand-50 text-brand-700 border border-brand-200 rounded-lg p-3 text-sm flex items-start gap-3 dark:bg-brand-900/30 dark:border-brand-800/50 dark:text-brand-300">
            <CheckCircle className="shrink-0 mt-0.5" size={18} />
            <p>
              <strong className="block mb-1 text-brand-800 dark:text-brand-200">You have received this active QR from the Superadmin!</strong>
              Display this QR code to your students. They can scan it from their portal to instantly mark their attendance for this session.
            </p>
          </div>
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

export default AttendancePage;

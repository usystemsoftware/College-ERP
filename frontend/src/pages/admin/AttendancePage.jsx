import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Filter, CheckCircle, XCircle, Clock, Search, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getSubjects } from '../../api/academic.api';
import { getStudentsAPI } from '../../api/students.api';
import { getAttendanceBySubjectDateAPI, markAttendanceAPI } from '../../api/attendance.api';

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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSubject, setModalSubject] = useState('');
  const [modalDate, setModalDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalLectureType, setModalLectureType] = useState('Theory');
  const [students, setStudents] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({}); // { studentId: 'Present'|'Absent'|'Late' }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchSubjects();
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
    </div>
  );
};

export default AttendancePage;

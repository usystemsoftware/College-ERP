import React, { useState, useEffect } from 'react';
import { getMyParentProfileAPI } from '../../api/parents.api';
import { getStudentAttendanceAPI } from '../../api/attendance.api';
import { Clock, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';
import LottieLoader from '../../components/common/LottieLoader';

const ParentAttendancePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [attLoading, setAttLoading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await getMyParentProfileAPI();
        const parentData = response.data?.data?.parent;
        setProfile(parentData);
        
        if (parentData?.students?.length > 0) {
          setSelectedStudent(parentData.students[0]);
        }
      } catch (err) {
        setError('Failed to load parent profile.');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      async function fetchAttendance() {
        setAttLoading(true);
        try {
          const res = await getStudentAttendanceAPI({ studentId: selectedStudent._id });
          setAttendanceData(res.data?.data || []);
        } catch (err) {
          console.error('Failed to fetch attendance', err);
        } finally {
          setAttLoading(false);
        }
      }
      fetchAttendance();
    }
  }, [selectedStudent]);

  if (loading) return <div className="flex justify-center p-12"><LottieLoader size={60} /></div>;
  if (error) return <div className="text-center p-12 text-red-500">{error}</div>;
  if (!profile || !profile.students || profile.students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
        <GraduationCap size={48} className="mb-4 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">No Linked Students</h2>
        <p>There are no students linked to your parent account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="text-brand-500" /> Attendance Tracker
          </h1>
          <p className="text-sm text-slate-500 mt-1">Monitor your children's class attendance and performance.</p>
        </div>
      </div>

      {/* Student Selector */}
      {profile.students.length > 1 && (
        <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
          {profile.students.map(student => (
            <button
              key={student._id}
              onClick={() => setSelectedStudent(student)}
              className={`pb-2 px-1 text-sm font-semibold transition-all ${
                selectedStudent?._id === student._id
                  ? 'border-b-2 border-brand-500 text-brand-600 dark:text-brand-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {student.personalDetails?.fullName}
            </button>
          ))}
        </div>
      )}

      {/* Attendance Content */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-dark-900">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
            <GraduationCap size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {selectedStudent?.personalDetails?.fullName}
            </h2>
            <p className="text-sm text-slate-500">
              {selectedStudent?.course?.name} - {selectedStudent?.semester?.name || selectedStudent?.semester}
            </p>
          </div>
        </div>

        <div className="p-6">
          {attLoading ? (
            <div className="flex justify-center p-8"><LottieLoader size={40} /></div>
          ) : attendanceData.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-dark-800/50">
              <p className="text-slate-600 dark:text-slate-400">No attendance records found for this student.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50 font-semibold text-slate-500 dark:bg-dark-800">
                  <tr>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4 text-center">Total Classes</th>
                    <th className="px-6 py-4 text-center">Present</th>
                    <th className="px-6 py-4 text-center">Absent</th>
                    <th className="px-6 py-4 text-right">Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {attendanceData.map((record, index) => {
                    const percentage = parseFloat(record.percentage);
                    return (
                      <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-dark-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-300">
                          {record.subject?.name || 'Self Check-in'}
                        </td>
                        <td className="px-6 py-4 text-center font-medium">{record.total}</td>
                        <td className="px-6 py-4 text-center text-green-600 dark:text-green-400 font-semibold">{record.present}</td>
                        <td className="px-6 py-4 text-center text-red-600 dark:text-red-400 font-semibold">{record.absent}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                            percentage >= 75 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : percentage >= 60
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {percentage >= 75 ? <CheckCircle2 size={14}/> : <AlertCircle size={14}/>}
                            {percentage}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentAttendancePage;

import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, User, Clock, Check, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../../api/axios';

const FacultyLectureAttendance = () => {
  const { user } = useSelector(state => state.auth);
  const roleName = typeof user?.role === 'object' ? user?.role?.name : user?.role;
  const isFaculty = roleName === 'Faculty';

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(isFaculty ? user.profileId : ''); // Assumes user.profileId points to Faculty ID
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isFaculty) {
      // Fetch faculty list for admin/HR
      const fetchFaculties = async () => {
        try {
          const response = await api.get('/faculty');
          if (response.data?.data) {
            setFacultyList(response.data.data);
          }
        } catch (error) {
          console.error("Failed to fetch faculties", error);
        }
      };
      fetchFaculties();
    } else {
      // Set the profile ID for faculty
      if (user.profileId) {
        setSelectedFaculty(user.profileId);
      }
    }
  }, [isFaculty, user]);

  useEffect(() => {
    // If we have a faculty selected and a date, fetch the lectures
    const fetchLectures = async () => {
      if (!selectedFaculty || !date) return;
      setLoading(true);
      try {
        const response = await api.get(`/attendance/faculty-lecture?facultyId=${selectedFaculty}&date=${date}`);
        if (response.data?.data) {
          setLectures(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch faculty lectures", error);
        setLectures([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLectures();
  }, [selectedFaculty, date]);

  const markAttendance = async (timetableId, status) => {
    try {
      await api.post('/attendance/faculty-lecture', {
        facultyId: selectedFaculty,
        timetableId,
        date,
        status
      });
      // Update local state
      setLectures(prev => prev.map(item => {
        if (item.timetable._id === timetableId) {
          return { ...item, attendance: { ...item.attendance, status } };
        }
        return item;
      }));
    } catch (error) {
      console.error("Failed to mark attendance", error);
      alert("Failed to mark attendance");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-dark-900">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Lecture Attendance</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={16} className="text-slate-400" />
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pl-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white"
              />
            </div>
          </div>
          
          {!isFaculty && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Faculty Member</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={16} className="text-slate-400" />
                </div>
                <select
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="pl-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white"
                >
                  <option value="">Select Faculty</option>
                  {facultyList.map(f => (
                    <option key={f._id} value={f._id}>{f.user?.personalDetails?.fullName || f._id}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"></div>
          </div>
        ) : (
          <div>
            {!selectedFaculty ? (
              <p className="text-sm text-slate-500 text-center py-4">Please select a faculty member to view their lectures.</p>
            ) : lectures.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No lectures scheduled for this date.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                  <thead className="bg-slate-50 font-semibold text-slate-500 dark:bg-dark-800">
                    <tr>
                      <th className="px-6 py-4">Time Slot</th>
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Room/Division</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-dark-900">
                    {lectures.map((item) => (
                      <tr key={item.timetable._id} className="hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-slate-400" />
                            {item.timetable.startTime} - {item.timetable.endTime}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-900 dark:text-white">{item.timetable.subject?.name || 'Unknown Subject'}</span>
                          <span className="block text-xs text-slate-500">{item.timetable.course?.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          Room: {item.timetable.roomNumber} <br />
                          Div: {item.timetable.division}
                        </td>
                        <td className="px-6 py-4">
                          {item.attendance?.status === 'Present' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              <CheckCircle size={14} /> Present
                            </span>
                          ) : item.attendance?.status === 'Absent' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                              <XCircle size={14} /> Absent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              Not Marked
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => markAttendance(item.timetable._id, 'Present')}
                              className={`flex items-center justify-center rounded-lg p-2 transition-colors ${
                                item.attendance?.status === 'Present' 
                                  ? 'bg-green-600 text-white' 
                                  : 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                              }`}
                              title="Mark Present"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => markAttendance(item.timetable._id, 'Absent')}
                              className={`flex items-center justify-center rounded-lg p-2 transition-colors ${
                                item.attendance?.status === 'Absent' 
                                  ? 'bg-red-600 text-white' 
                                  : 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                              }`}
                              title="Mark Absent"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyLectureAttendance;

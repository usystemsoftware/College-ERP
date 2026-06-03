import React, { useState } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Save, Filter } from 'lucide-react';
import { useSelector } from 'react-redux';

// Mock Data
const mockStudents = [
  { id: '1', name: 'Alex Johnson', roll: 'CS-001', status: 'Present' },
  { id: '2', name: 'Priya Sharma', roll: 'CS-002', status: 'Present' },
  { id: '3', name: 'David Smith', roll: 'CS-003', status: 'Absent' },
  { id: '4', name: 'Emily Chen', roll: 'CS-004', status: 'Late' },
  { id: '5', name: 'Michael Brown', roll: 'CS-005', status: 'Present' },
];

const AttendanceDashboard = () => {
  const { user } = useSelector(state => state.auth);
  
  // Safely get role
  const roleName = typeof user?.role === 'object' ? user?.role?.name : user?.role;
  const isStudent = roleName === 'Student';

  const [attendance, setAttendance] = useState(mockStudents);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleStatusChange = (id, newStatus) => {
    setAttendance(attendance.map(student => 
      student.id === id ? { ...student, status: newStatus } : student
    ));
  };

  const handleSave = () => {
    console.log("Saved Attendance for", selectedDate, attendance);
    alert("Attendance saved successfully!");
  };

  if (isStudent) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Attendance</h1>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-dark-900">
            <h3 className="text-sm font-medium text-slate-500">Overall Attendance</h3>
            <p className="mt-2 text-4xl font-bold text-brand-600 dark:text-brand-400">85%</p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-dark-800">
              <div className="h-full rounded-full bg-brand-500" style={{ width: '85%' }}></div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-dark-900">
            <h3 className="text-sm font-medium text-slate-500">Classes Attended</h3>
            <p className="mt-2 text-4xl font-bold text-green-600 dark:text-green-400">102</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-dark-900">
            <h3 className="text-sm font-medium text-slate-500">Classes Missed</h3>
            <p className="mt-2 text-4xl font-bold text-red-600 dark:text-red-400">18</p>
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
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700"
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
    </div>
  );
};

export default AttendanceDashboard;

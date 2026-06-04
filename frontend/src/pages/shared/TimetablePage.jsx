import React, { useState } from 'react';
import { Calendar, Clock, Filter, Plus, Search, MapPin, User as UserIcon, X } from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const timeslots = ['09:00', '10:00', '11:15', '12:15', '14:00', '15:00', '16:00'];

const initialSchedule = [
  { id: 1, day: 'Monday', time: '09:00', subject: 'Data Structures', type: 'Theory', faculty: 'Dr. Alan Turing', room: 'L-101', duration: 1, department: 'Computer Science', semester: 'Semester 5', division: 'Division A' },
  { id: 2, day: 'Monday', time: '10:00', subject: 'Operating Systems', type: 'Theory', faculty: 'Prof. Linus Torvalds', room: 'L-102', duration: 1, department: 'Computer Science', semester: 'Semester 5', division: 'Division A' },
  { id: 3, day: 'Monday', time: '14:00', subject: 'OS Lab', type: 'Practical', faculty: 'Prof. Linus Torvalds', room: 'Lab-3', duration: 2, department: 'Computer Science', semester: 'Semester 5', division: 'Division A' },
  { id: 4, day: 'Tuesday', time: '09:00', subject: 'Computer Networks', type: 'Theory', faculty: 'Dr. Vint Cerf', room: 'L-105', duration: 1, department: 'Computer Science', semester: 'Semester 5', division: 'Division A' },
  { id: 5, day: 'Wednesday', time: '11:15', subject: 'DBMS', type: 'Theory', faculty: 'Dr. Edgar Codd', room: 'L-201', duration: 1, department: 'Computer Science', semester: 'Semester 5', division: 'Division A' },
];

const TimetablePage = () => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [schedule, setSchedule] = useState(initialSchedule);
  
  // Filters state
  const [filters, setFilters] = useState({
    department: 'Computer Science',
    semester: 'Semester 5',
    division: 'Division A'
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    day: 'Monday',
    time: '09:00',
    subject: '',
    type: 'Theory',
    faculty: '',
    room: ''
  });

  // Filter the schedule based on selected filters
  const filteredSchedule = schedule.filter(c => 
    c.department === filters.department &&
    c.semester === filters.semester &&
    c.division === filters.division
  );

  const getClass = (day, time) => filteredSchedule.find(c => c.day === day && c.time === time);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (day = 'Monday', time = '09:00') => {
    setFormData(prev => ({ ...prev, day, time }));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      day: 'Monday',
      time: '09:00',
      subject: '',
      type: 'Theory',
      faculty: '',
      room: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newClass = {
      ...formData,
      id: Date.now(),
      duration: 1,
      department: filters.department,
      semester: filters.semester,
      division: filters.division
    };
    
    // Replace if exists, or add new
    setSchedule(prev => {
      const existingIdx = prev.findIndex(c => c.day === newClass.day && c.time === newClass.time && c.department === newClass.department && c.semester === newClass.semester && c.division === newClass.division);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newClass;
        return updated;
      }
      return [...prev, newClass];
    });
    closeModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Master Timetable</h1>
          <p className="text-sm text-slate-500">View and manage schedules across departments and semesters.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
          >
            <Plus size={16} />
            Schedule Class
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-dark-800">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex gap-4 items-center flex-wrap">
            <select 
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-dark-900"
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Information Tech">Information Tech</option>
              <option value="Electronics">Electronics</option>
            </select>
            <select 
              name="semester"
              value={filters.semester}
              onChange={handleFilterChange}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-dark-900"
            >
              <option value="Semester 5">Semester 5</option>
              <option value="Semester 6">Semester 6</option>
            </select>
            <select 
              name="division"
              value={filters.division}
              onChange={handleFilterChange}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-dark-900"
            >
              <option value="Division A">Division A</option>
              <option value="Division B">Division B</option>
            </select>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-dark-750">
            <Filter size={16} /> Advanced Filters
          </button>
        </div>

        {/* Desktop Weekly View */}
        <div className="hidden lg:block overflow-x-auto p-5">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr>
                <th className="border border-slate-200 bg-slate-50 p-3 text-center text-slate-500 dark:border-slate-700 dark:bg-dark-850 w-24">Time</th>
                {days.map(day => (
                  <th key={day} className="border border-slate-200 bg-slate-50 p-3 text-center font-semibold text-slate-700 dark:border-slate-700 dark:bg-dark-850 dark:text-slate-300">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeslots.map((time, idx) => (
                <React.Fragment key={time}>
                  {/* Break Row */}
                  {(time === '11:15' || time === '14:00') && (
                    <tr>
                      <td className="border border-slate-200 p-2 text-center text-xs font-medium text-slate-400 dark:border-slate-700 bg-slate-50 dark:bg-dark-900">
                        {time === '11:15' ? '11:00' : '13:15'}
                      </td>
                      <td colSpan="6" className="border border-slate-200 p-2 text-center text-xs font-semibold tracking-widest text-slate-400 uppercase bg-slate-50 dark:border-slate-700 dark:bg-dark-900">
                        {time === '11:15' ? 'Short Break' : 'Lunch Break'}
                      </td>
                    </tr>
                  )}
                  {/* Standard Row */}
                  <tr>
                    <td className="border border-slate-200 p-3 text-center font-medium text-slate-500 dark:border-slate-700">
                      {time}
                    </td>
                    {days.map(day => {
                      const session = getClass(day, time);
                      return (
                        <td key={`${day}-${time}`} className="border border-slate-200 p-2 align-top dark:border-slate-700 h-28 w-48">
                          {session ? (
                            <div className={`h-full rounded-lg border p-3 flex flex-col justify-between ${
                              session.type === 'Practical' 
                                ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/10'
                                : 'border-brand-200 bg-brand-50 dark:border-brand-900/50 dark:bg-brand-900/10'
                            }`}>
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-white line-clamp-1 text-sm">{session.subject}</div>
                                <div className={`text-[10px] mt-1 inline-block px-1.5 py-0.5 rounded font-medium ${
                                  session.type === 'Practical' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                                }`}>
                                  {session.type}
                                </div>
                              </div>
                              <div className="mt-2 space-y-1">
                                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                  <UserIcon size={12}/> <span className="line-clamp-1">{session.faculty}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                  <MapPin size={12}/> <span>{session.room}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div 
                              onClick={() => openModal(day, time)}
                              className="flex h-full w-full items-center justify-center text-slate-300 dark:text-slate-700 border-2 border-dashed border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-lg cursor-pointer transition-colors"
                            >
                              <Plus size={20} />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden">
          <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 p-2 hide-scrollbar">
            {days.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 whitespace-nowrap rounded-full text-sm font-medium ${
                  selectedDay === day 
                    ? 'bg-brand-500 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
          <div className="p-4 space-y-4">
            {timeslots.map(time => {
              const session = getClass(selectedDay, time);
              if (!session) return null;
              return (
                <div key={time} className="flex gap-4">
                  <div className="w-16 flex-shrink-0 text-right pt-1">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{time}</span>
                  </div>
                  <div className={`flex-1 rounded-xl border p-4 ${
                    session.type === 'Practical' 
                      ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-900/10'
                      : 'border-brand-200 bg-brand-50 dark:border-brand-900/30 dark:bg-brand-900/10'
                  }`}>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-900 dark:text-white">{session.subject}</h4>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-white dark:bg-dark-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{session.type}</span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2"><UserIcon size={14}/> {session.faculty}</div>
                      <div className="flex items-center gap-2"><MapPin size={14}/> {session.room}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-dark-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Schedule Class</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Day</label>
                  <select 
                    name="day" 
                    value={formData.day} 
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 p-2 outline-none dark:border-slate-700 dark:bg-dark-800"
                  >
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Time</label>
                  <select 
                    name="time" 
                    value={formData.time} 
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 p-2 outline-none dark:border-slate-700 dark:bg-dark-800"
                  >
                    {timeslots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Subject</label>
                <input 
                  type="text" 
                  name="subject" 
                  value={formData.subject} 
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-slate-200 p-2 outline-none dark:border-slate-700 dark:bg-dark-800"
                  placeholder="e.g. Data Structures"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
                <select 
                  name="type" 
                  value={formData.type} 
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 p-2 outline-none dark:border-slate-700 dark:bg-dark-800"
                >
                  <option value="Theory">Theory</option>
                  <option value="Practical">Practical</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Faculty</label>
                <input 
                  type="text" 
                  name="faculty" 
                  value={formData.faculty} 
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-slate-200 p-2 outline-none dark:border-slate-700 dark:bg-dark-800"
                  placeholder="e.g. Dr. Alan Turing"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Room</label>
                <input 
                  type="text" 
                  name="room" 
                  value={formData.room} 
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-slate-200 p-2 outline-none dark:border-slate-700 dark:bg-dark-800"
                  placeholder="e.g. L-101"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-dark-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                >
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetablePage;


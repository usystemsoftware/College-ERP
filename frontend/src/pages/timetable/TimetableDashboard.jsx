import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, User, Plus } from 'lucide-react';
import Modal from '../../components/common/Modal';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const timeSlots = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', 
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
];

// Mock data
const mockTimetable = [
  { day: 'Monday', time: '09:00 AM', duration: 2, subject: 'Data Structures', faculty: 'Dr. Alan Turing', room: 'Lab 1', type: 'Lab' },
  { day: 'Monday', time: '11:00 AM', duration: 1, subject: 'Database Systems', faculty: 'Dr. Grace Hopper', room: 'Room 304', type: 'Lecture' },
  { day: 'Tuesday', time: '10:00 AM', duration: 1, subject: 'Operating Systems', faculty: 'Prof. Richard', room: 'Room 305', type: 'Lecture' },
  { day: 'Wednesday', time: '02:00 PM', duration: 2, subject: 'Computer Networks', faculty: 'Dr. Vint Cerf', room: 'Lab 3', type: 'Lab' },
];

const TimetableDashboard = () => {
  const [selectedCourse, setSelectedCourse] = useState('B.Tech CS - 5th Sem');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getSlotData = (day, time) => {
    return mockTimetable.find(slot => slot.day === day && slot.time === time);
  };

  const isSlotCoveredByPrevious = (day, timeIndex) => {
    // Check if a previous slot with duration > 1 covers this time
    for (let i = 1; i <= timeIndex; i++) {
      const prevTime = timeSlots[timeIndex - i];
      const prevSlot = getSlotData(day, prevTime);
      if (prevSlot && prevSlot.duration > i) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Timetable Manager</h1>
          <p className="text-sm text-slate-500">Manage and view class schedules.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-slate-200"
          >
            <option>B.Tech CS - 5th Sem</option>
            <option>B.Tech ME - 3rd Sem</option>
            <option>MBA - 1st Sem</option>
          </select>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700"
          >
            <Plus size={16} />
            Add Slot
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-dark-900 overflow-hidden">
        
        {/* Header Controls */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800 bg-slate-50 dark:bg-dark-800/50">
          <div className="flex items-center gap-4">
            <button className="p-1 rounded text-slate-400 hover:bg-white hover:text-slate-700 dark:hover:bg-dark-700 dark:hover:text-slate-200 shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition">
              <ChevronLeft size={20} />
            </button>
            <h2 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Calendar size={18} className="text-brand-500" />
              Fall Semester 2023
            </h2>
            <button className="p-1 rounded text-slate-400 hover:bg-white hover:text-slate-700 dark:hover:bg-dark-700 dark:hover:text-slate-200 shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition">
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Lecture</span>
            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Lab</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Tutorial</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Grid Header (Days) */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900">
              <div className="p-4 border-r border-slate-200 dark:border-slate-800 text-center font-semibold text-sm text-slate-400">Time</div>
              {days.map(day => (
                <div key={day} className="p-4 border-r border-slate-200 dark:border-slate-800 text-center font-semibold text-sm text-slate-700 dark:text-slate-300 last:border-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid Body */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-slate-50/30 dark:bg-dark-950/20">
              {timeSlots.map((time, timeIndex) => (
                <div key={time} className="grid grid-cols-7 min-h-[100px]">
                  
                  {/* Time Column */}
                  <div className="p-3 border-r border-slate-200 dark:border-slate-800 flex items-start justify-center bg-white dark:bg-dark-900">
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-dark-800 px-2 py-1 rounded">{time}</span>
                  </div>

                  {/* Days Columns */}
                  {days.map(day => {
                    if (isSlotCoveredByPrevious(day, timeIndex)) {
                      return null; // Skip rendering cell if previous slot spans over it
                    }

                    const slot = getSlotData(day, time);
                    const rowSpanClass = slot && slot.duration > 1 ? `row-span-${slot.duration}` : '';

                    return (
                      <div 
                        key={`${day}-${time}`} 
                        className={`p-2 border-r border-slate-200 dark:border-slate-800 last:border-0 relative group transition hover:bg-slate-50 dark:hover:bg-dark-800/50 ${rowSpanClass}`}
                        style={slot && slot.duration > 1 ? { gridRowEnd: `span ${slot.duration}` } : {}}
                      >
                        {slot ? (
                          <div className={`h-full w-full rounded-lg p-3 border shadow-sm ${
                            slot.type === 'Lab' 
                              ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800/50' 
                              : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50'
                          }`}>
                            <h4 className={`font-semibold text-sm mb-2 leading-tight ${
                              slot.type === 'Lab' ? 'text-purple-900 dark:text-purple-100' : 'text-blue-900 dark:text-blue-100'
                            }`}>{slot.subject}</h4>
                            
                            <div className="space-y-1.5">
                              <p className={`flex items-center gap-1.5 text-xs ${
                                slot.type === 'Lab' ? 'text-purple-700 dark:text-purple-300' : 'text-blue-700 dark:text-blue-300'
                              }`}><User size={12} /> {slot.faculty}</p>
                              <p className={`flex items-center gap-1.5 text-xs ${
                                slot.type === 'Lab' ? 'text-purple-700 dark:text-purple-300' : 'text-blue-700 dark:text-blue-300'
                              }`}><MapPin size={12} /> {slot.room}</p>
                            </div>
                            
                            {/* Hover Actions */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-white/90 dark:bg-dark-900/90 rounded px-1 py-0.5 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                              <button className="text-xs text-brand-600 hover:text-brand-800">Edit</button>
                            </div>
                          </div>
                        ) : (
                          // Empty Cell Clickable Area
                          <button 
                            onClick={() => setIsModalOpen(true)}
                            className="w-full h-full min-h-[80px] rounded border border-dashed border-transparent hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 transition"
                          >
                            <Plus size={20} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Timetable Slot">
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Subject</label>
            <input type="text" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white" placeholder="Enter subject name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Day</label>
              <select className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white">
                {days.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Time</label>
              <select className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white">
                {timeSlots.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TimetableDashboard;

import React, { useState } from 'react';
import { Calendar, Clock, Filter, Plus, Search, MapPin, User as UserIcon } from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const timeslots = ['09:00', '10:00', '11:15', '12:15', '14:00', '15:00', '16:00'];

const mockSchedule = [
  { id: 1, day: 'Monday', time: '09:00', subject: 'Data Structures', type: 'Theory', faculty: 'Dr. Alan Turing', room: 'L-101', duration: 1 },
  { id: 2, day: 'Monday', time: '10:00', subject: 'Operating Systems', type: 'Theory', faculty: 'Prof. Linus Torvalds', room: 'L-102', duration: 1 },
  { id: 3, day: 'Monday', time: '14:00', subject: 'OS Lab', type: 'Practical', faculty: 'Prof. Linus Torvalds', room: 'Lab-3', duration: 2 },
  { id: 4, day: 'Tuesday', time: '09:00', subject: 'Computer Networks', type: 'Theory', faculty: 'Dr. Vint Cerf', room: 'L-105', duration: 1 },
  { id: 5, day: 'Wednesday', time: '11:15', subject: 'DBMS', type: 'Theory', faculty: 'Dr. Edgar Codd', room: 'L-201', duration: 1 },
];

const TimetablePage = () => {
  const [selectedDay, setSelectedDay] = useState('Monday');

  // Simple helper to find a class for a specific day and time slot
  const getClass = (day, time) => mockSchedule.find(c => c.day === day && c.time === time);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Master Timetable</h1>
          <p className="text-sm text-slate-500">View and manage schedules across departments and semesters.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600">
            <Plus size={16} />
            Schedule Class
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-dark-800">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex gap-4 items-center flex-wrap">
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-dark-900">
              <option>Computer Science</option>
              <option>Information Tech</option>
              <option>Electronics</option>
            </select>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-dark-900">
              <option>Semester 5</option>
              <option>Semester 6</option>
            </select>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-dark-900">
              <option>Division A</option>
              <option>Division B</option>
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
                            <div className="flex h-full w-full items-center justify-center text-slate-300 dark:text-slate-700 border-2 border-dashed border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-lg cursor-pointer transition-colors">
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
    </div>
  );
};

export default TimetablePage;

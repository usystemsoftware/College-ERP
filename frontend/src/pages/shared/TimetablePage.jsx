import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Filter, Plus, Search, MapPin, User as UserIcon, X, Edit2, Trash2 } from 'lucide-react';
import { get } from '../../api/client';
import { getSemesters, getSubjects, getCurrentAcademicYear } from '../../api/academic.api';
import { getFacultyAPI } from '../../api/faculty.api';
import { getTimetableAPI, createTimetableSlotAPI, deleteTimetableSlotAPI } from '../../api/timetable.api';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const timeslots = ['09:00', '10:00', '11:15', '12:15', '2:00', '3:00'];

const TimetablePage = () => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [schedule, setSchedule] = useState([]);
  
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [currentAcademicYear, setCurrentAcademicYear] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    department: '',
    course: '',
    semester: '',
    division: 'Division A'
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    day: 'Monday',
    time: '09:00',
    subject: '',
    type: 'Theory',
    faculty: '',
    room: ''
  });

  // Initial Data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [yearRes, deptRes, semRes] = await Promise.all([
          getCurrentAcademicYear(),
          get('/departments'),
          getSemesters()
        ]);
        
        if (yearRes.data?.data) setCurrentAcademicYear(yearRes.data.data._id);
        if (semRes.data?.data) setSemesters(semRes.data.data);
        if (deptRes.data?.data) {
          setDepartments(deptRes.data.data);
          if (deptRes.data.data.length > 0) {
            setFilters(prev => ({ ...prev, department: deptRes.data.data[0]._id }));
          }
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch Courses when Department changes
  useEffect(() => {
    const fetchCoursesAndFaculty = async () => {
      if (!filters.department) {
        setCourses([]);
        setFaculties([]);
        return;
      }
      try {
        const [courseRes, facultyRes] = await Promise.all([
          get(`/courses?department=${filters.department}`),
          getFacultyAPI()
        ]);
        
        if (facultyRes.data?.data?.faculty) setFaculties(facultyRes.data.data.faculty);
        if (courseRes.data?.data) {
          setCourses(courseRes.data.data);
          if (courseRes.data.data.length > 0) {
            if (!courseRes.data.data.find(c => c._id === filters.course)) {
              setFilters(prev => ({ ...prev, course: courseRes.data.data[0]._id }));
            }
          } else {
            setFilters(prev => ({ ...prev, course: '' }));
          }
        }
      } catch (error) {
        console.error('Error fetching courses/faculty:', error);
      }
    };
    fetchCoursesAndFaculty();
  }, [filters.department]);

  // Handle auto-selecting valid semester based on course
  useEffect(() => {
    if (courses.length > 0 && filters.course && semesters.length > 0) {
       // Just pick the first semester available for this course to start with
       // Ideally you'd filter semesters by course duration
       if(!filters.semester) {
         setFilters(prev => ({ ...prev, semester: semesters[0]._id }));
       }
    }
  }, [filters.course, courses, semesters]);

  // Fetch Subjects when Course/Semester change
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!filters.course || !filters.semester) {
        setSubjects([]);
        return;
      }
      try {
        const res = await getSubjects();
        if (res.data?.data) setSubjects(res.data.data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
  }, [filters.course, filters.semester]);

  // Fetch Timetable when filters change
  useEffect(() => {
    const fetchTimetable = async () => {
      if (!filters.department || !filters.semester) return;
      try {
        const res = await getTimetableAPI(filters);
        if (res.data?.data) {
          setSchedule(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching timetable:', error);
      }
    };
    fetchTimetable();
  }, [filters]);

  const getClass = (day, time) => schedule.find(c => c.dayOfWeek === day && c.startTime === time);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (day = 'Monday', time = '09:00', session = null) => {
    if (session) {
      setFormData({
        id: session._id,
        day: session.dayOfWeek,
        time: session.startTime,
        subject: session.subject?._id || '',
        type: session.isLab ? 'Practical' : 'Theory',
        faculty: session.faculty?._id || '',
        room: session.roomNumber || ''
      });
    } else {
      setFormData({
        id: null,
        day,
        time,
        subject: subjects.length > 0 ? subjects[0]._id : '',
        type: 'Theory',
        faculty: faculties.length > 0 ? faculties[0]._id : '',
        room: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await deleteTimetableSlotAPI(id);
        toast.success('Deleted successfully');
        setSchedule(prev => prev.filter(c => c._id !== id));
      } catch (error) {
        toast.error('Error deleting class');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentAcademicYear) {
      toast.error('Current academic year is not set');
      return;
    }

    const getEndTime = (start) => {
      const times = {
        '09:00': '10:00',
        '10:00': '11:00',
        '11:15': '12:15',
        '12:15': '13:15',
        '2:00': '3:00',
        '3:00': '4:00'
      };
      return times[start] || '12:00';
    };

    const payload = {
      department: filters.department,
      course: filters.course,
      semester: filters.semester,
      division: filters.division,
      academicYear: currentAcademicYear,
      dayOfWeek: formData.day,
      startTime: formData.time,
      endTime: getEndTime(formData.time),
      subject: formData.subject,
      faculty: formData.faculty,
      roomNumber: formData.room,
      isLab: formData.type === 'Practical'
    };

    try {
      if (formData.id) {
        // Mock update: Not fully implementing update endpoint for simplicity, wait, backend has updateTimetableEntry
        toast.error("Updating existing slot not fully supported in this demo. Please delete and recreate.");
      } else {
        await createTimetableSlotAPI(payload);
        toast.success('Timetable slot created successfully');
      }
      
      const res = await getTimetableAPI(filters);
      if (res.data?.data) setSchedule(res.data.data);
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving class');
    }
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
              {departments.length === 0 && <option value="">No Departments</option>}
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
            <select
              name="course"
              value={filters.course}
              onChange={handleFilterChange}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-dark-900"
            >
              {courses.length === 0 && <option value="">No Courses</option>}
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.name}</option>
              ))}
            </select>
            <select
              name="semester"
              value={filters.semester}
              onChange={handleFilterChange}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-dark-900"
            >
              {semesters.length === 0 && <option value="">No Semesters</option>}
              {semesters.map(sem => (
                <option key={sem._id} value={sem._id}>{sem.name}</option>
              ))}
            </select>
            <select
              name="division"
              value={filters.division}
              onChange={handleFilterChange}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-dark-900"
            >
              <option value="Division A">Division A</option>
              <option value="Division B">Division B</option>
              <option value="Division C">Division C</option>
              <option value="Division D">Division D</option>
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
                  {(time === '11:15' || time === '2:00') && (
                    <tr>
                      <td className="border border-slate-200 p-2 text-center text-xs font-medium text-slate-400 dark:border-slate-700 bg-slate-50 dark:bg-dark-900">
                        {time === '11:15' ? '11:00' : '1:00'}
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
                            <div className={`group relative h-full rounded-lg border p-3 flex flex-col justify-between ${session.isLab
                              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/10'
                              : 'border-brand-200 bg-brand-50 dark:border-brand-900/50 dark:bg-brand-900/10'
                              }`}>
                              <div className="absolute top-2 right-2 hidden group-hover:flex gap-1 bg-white/90 dark:bg-dark-900/90 rounded p-1 shadow-sm border border-slate-200 dark:border-slate-700">
                                <button onClick={(e) => { e.stopPropagation(); openModal(day, time, session); }} className="p-1 text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">
                                  <Edit2 size={14} />
                                </button>
                                <button onClick={(e) => handleDelete(session._id, e)} className="p-1 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-white line-clamp-1 text-sm">{session.subject?.name || 'Unknown Subject'}</div>
                                <div className={`text-[10px] mt-1 inline-block px-1.5 py-0.5 rounded font-medium ${session.isLab ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                                  }`}>
                                  {session.isLab ? 'Practical' : 'Theory'}
                                </div>
                              </div>
                              <div className="mt-2 space-y-1">
                                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                  <UserIcon size={12} /> <span className="line-clamp-1">{session.faculty?.fullName || 'Unknown Faculty'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                  <MapPin size={12} /> <span>{session.roomNumber}</span>
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
                className={`px-4 py-2 whitespace-nowrap rounded-full text-sm font-medium ${selectedDay === day
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
                  <div className={`flex-1 rounded-xl border p-4 ${session.isLab
                    ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-900/10'
                    : 'border-brand-200 bg-brand-50 dark:border-brand-900/30 dark:bg-brand-900/10'
                    }`}>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-900 dark:text-white pr-4">{session.subject?.name}</h4>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-white dark:bg-dark-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{session.isLab ? 'Practical' : 'Theory'}</span>
                        <div className="flex gap-2">
                          <button onClick={(e) => { e.stopPropagation(); openModal(selectedDay, time, session); }} className="p-1 text-slate-400 hover:text-brand-500 bg-white dark:bg-dark-800 rounded border border-slate-200 dark:border-slate-700"><Edit2 size={14} /></button>
                          <button onClick={(e) => handleDelete(session._id, e)} className="p-1 text-slate-400 hover:text-red-500 bg-white dark:bg-dark-800 rounded border border-slate-200 dark:border-slate-700"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2"><UserIcon size={14} /> {session.faculty?.fullName}</div>
                      <div className="flex items-center gap-2"><MapPin size={14} /> {session.roomNumber}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* Schedule Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Schedule Class" hideFooter={true}>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
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
            <select
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-slate-200 p-2 outline-none dark:border-slate-700 dark:bg-dark-800"
            >
              <option value="">Select Subject</option>
              {subjects.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
            </select>
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
            <select
              name="faculty"
              value={formData.faculty}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-slate-200 p-2 outline-none dark:border-slate-700 dark:bg-dark-800"
            >
              <option value="">Select Faculty</option>
              {faculties.map(fac => <option key={fac._id} value={fac._id}>{fac.fullName}</option>)}
            </select>
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
          <div className="mt-6 flex justify-end gap-3 flex-shrink-0 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-dark-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Save Class
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TimetablePage;

import React, { useState, useEffect } from 'react';
import { Plus, MapPin, User as UserIcon, Edit2, Trash2, BookOpen, Loader2, ChevronRight, Users } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { get } from '../../api/client';
import { getSemesters, getSubjects, getCurrentAcademicYear, createSubject } from '../../api/academic.api';
import { getFacultyAPI } from '../../api/faculty.api';
import { getMyParentProfileAPI } from '../../api/parents.api';
import { getTimetableAPI, createTimetableSlotAPI, deleteTimetableSlotAPI, updateTimetableSlotAPI } from '../../api/timetable.api';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import LottieLoader from '../../components/common/LottieLoader';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const timeslots = ['09:00', '10:00', '11:15', '12:15', '2:00', '3:00'];
const ADMIN_ROLES = ['Super Admin', 'College Admin', 'Principal', 'HOD', 'Class Coordinator'];
const DIVISIONS = ['Division A', 'Division B', 'Division C', 'Division D'];

const sessionColors = (isLab) => isLab
  ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/10'
  : 'border-brand-200 bg-brand-50 dark:border-brand-900/50 dark:bg-brand-900/10';

const badgeColors = (isLab) => isLab
  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
  : 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400';

// ── Shared session card ──────────────────────────────────────────────────────
const SessionCard = ({ session, onEdit, onDelete, isAdmin }) => (
  <div className={`group relative h-full rounded-lg border p-3 flex flex-col justify-between ${sessionColors(session.isLab)}`}>
    {isAdmin && (
      <div className="absolute top-2 right-2 hidden group-hover:flex gap-1 bg-white/90 dark:bg-dark-900/90 rounded p-1 shadow-sm border border-slate-200 dark:border-slate-700">
        <button onClick={onEdit} className="p-1 text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"><Edit2 size={14} /></button>
        <button onClick={onDelete} className="p-1 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"><Trash2 size={14} /></button>
      </div>
    )}
    <div>
      <div className="font-semibold text-slate-900 dark:text-white line-clamp-1 text-sm">{session.subject?.name || 'Unknown Subject'}</div>
      <span className={`text-[10px] mt-1 inline-block px-1.5 py-0.5 rounded font-medium ${badgeColors(session.isLab)}`}>
        {session.isLab ? 'Practical' : 'Theory'}
      </span>
    </div>
    <div className="mt-2 space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
        <UserIcon size={12} /> <span className="line-clamp-1">{session.faculty?.fullName || 'Unknown Faculty'}</span>
      </div>
      {(session.department || session.course || session.semester) && (
        <div className="flex flex-wrap items-center text-[10px] text-slate-500 dark:text-slate-400 mt-1 gap-x-1">
          {[
            session.department ? (session.department.code || session.department.name) : null,
            session.course ? (session.course.code || session.course.name) : null,
            session.semester ? session.semester.name : null,
            session.division ? session.division : null
          ].filter(Boolean).map((text, idx, arr) => (
            <React.Fragment key={idx}>
              <span className={idx < 2 ? "font-medium" : ""}>{text}</span>
              {idx < arr.length - 1 && <span className="opacity-40">•</span>}
            </React.Fragment>
          ))}
        </div>
      )}
      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
        <MapPin size={12} /> <span>{session.roomNumber}</span>
      </div>
    </div>
  </div>
);

// ── Label helper ─────────────────────────────────────────────────────────────
const Label = ({ children, required }) => (
  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
    {children}{required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const selectCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800";
const inputCls  = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800";

// ════════════════════════════════════════════════════════════════════════════
const TimetablePage = () => {
  const { user }    = useSelector((s) => s.auth);
  const location    = useLocation();
  const userRole    = typeof user?.role === 'object' ? user?.role?.name : user?.role;
  const isAdmin     = ADMIN_ROLES.includes(userRole);
  const isStudent   = userRole === 'Student';
  const isFaculty   = userRole === 'Faculty';
  const isParent    = userRole === 'Parent';
  const [viewMode, setViewMode] = useState(isFaculty ? 'my' : 'master');
  const canViewFilters = isAdmin || (isFaculty && viewMode === 'master');

  const [selectedDay, setSelectedDay] = useState('Monday');
  const [schedule,    setSchedule]    = useState([]);
  const [loading,     setLoading]     = useState(false);

  const [parentStudents, setParentStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // ── Lookup data (admin) ──────────────────────────────────────────────────
  const [allDepts,    setAllDepts]    = useState([]);
  const [allSemesters,setAllSemesters]= useState([]);
  const [allFaculties,setAllFaculties]= useState([]);
  const [currentAY,   setCurrentAY]   = useState(null);

  // ── View filters (admin timetable grid) ──────────────────────────────────
  const [filters, setFilters] = useState({ department: '', course: '', semester: '', division: 'Division A' });
  const [viewCourses, setViewCourses] = useState([]);

  // ── Modal state ──────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  // All modal selections live here — department, course, sem, division, day, time, subject, type, faculty, room
  const [modal, setModal] = useState({
    department: '', course: '', semester: '', division: 'Division A',
    day: 'Monday', time: '09:00', subject: '', type: 'Theory', faculty: '', room: ''
  });

  // Dependent data inside modal
  const [modalCourses,   setModalCourses]   = useState([]);
  const [modalSubjects,  setModalSubjects]  = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingSubjects,setLoadingSubjects]= useState(false);

  // Inline add-subject form
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', code: '', credits: 3, type: 'Theory' });
  const [savingSubject, setSavingSubject] = useState(false);

  const setNS = (f, v) => setNewSubject(p => ({ ...p, [f]: v }));

  const setM = (field, value) => setModal(p => ({ ...p, [field]: value }));

  // ── 1. Boot: fetch academic year, departments, semesters, faculty ────────
  useEffect(() => {
    if (!isAdmin && !isFaculty) return;
    (async () => {
      try {
        const [yearRes, deptRes, semRes, facRes] = await Promise.all([
          getCurrentAcademicYear(),
          get('/departments'),
          getSemesters(),
          getFacultyAPI({ limit: 200 }),
        ]);
        if (yearRes.data?.data)          setCurrentAY(yearRes.data.data._id);
        if (semRes.data?.data) {
          setAllSemesters(semRes.data.data);
          const firstSem = semRes.data.data[0]?._id;
          if (firstSem) setFilters(p => ({ ...p, semester: firstSem }));
        }
        if (facRes.data?.data?.faculty)  setAllFaculties(facRes.data.data.faculty);
        if (deptRes.data?.data) {
          setAllDepts(deptRes.data.data);
          const preId   = location.state?.departmentId;
          const firstId = deptRes.data.data[0]?._id;
          const deptId  = (preId && deptRes.data.data.find(d => d._id === preId)) ? preId : firstId;
          if (deptId) setFilters(p => ({ ...p, department: deptId }));
        }
      } catch (e) { console.error(e); }
    })();
  }, [isAdmin, isFaculty, location.state]);

  // ── 2. Parent Boot: fetch linked students ──────────────────────────────
  useEffect(() => {
    if (!isParent) return;
    (async () => {
      try {
        const res = await getMyParentProfileAPI();
        const students = res.data?.data?.parent?.students || [];
        setParentStudents(students);
        if (students.length > 0) setSelectedStudent(students[0]);
      } catch (e) { console.error(e); }
    })();
  }, [isParent]);

  // ── 3. Student, Faculty 'my' view & Parent: auto-load timetable ────────
  useEffect(() => {
    if (isStudent || (isFaculty && viewMode === 'my')) {
      (async () => {
        setLoading(true);
        try {
          const res = await getTimetableAPI(isFaculty ? { view: 'my' } : {});
          if (res.data?.data) setSchedule(res.data.data);
        } catch { toast.error('Failed to load timetable'); }
        finally { setLoading(false); }
      })();
    } else if (isParent && selectedStudent) {
      (async () => {
        setLoading(true);
        try {
          const res = await getTimetableAPI({ studentId: selectedStudent._id });
          if (res.data?.data) setSchedule(res.data.data);
        } catch { toast.error('Failed to load timetable'); }
        finally { setLoading(false); }
      })();
    }
  }, [isStudent, isFaculty, viewMode, isParent, selectedStudent]);

  // ── 4. Admin/Faculty Master view: reload courses when dept changes ──────
  useEffect(() => {
    if (!canViewFilters || !filters.department) return;
    (async () => {
      try {
        const res = await get(`/courses?department=${filters.department}`);
        const list = res.data?.data || [];
        setViewCourses(list);
        if (!list.find(c => c._id === filters.course))
          setFilters(p => ({ ...p, course: list[0]?._id || '' }));
      } catch (e) { console.error(e); }
    })();
  }, [filters.department, canViewFilters]);

  // ── 5. Admin/Faculty Master view: reload timetable when filters change ──
  useEffect(() => {
    if (!canViewFilters || !filters.department || !filters.semester) return;
    (async () => {
      setLoading(true);
      try {
        const res = await getTimetableAPI(filters);
        if (res.data?.data) setSchedule(res.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [filters, canViewFilters]);

  // ── 6. Modal: load courses when modal dept changes ───────────────────────
  useEffect(() => {
    if (!modal.department) { setModalCourses([]); setM('course', ''); return; }
    setLoadingCourses(true);
    get(`/courses?department=${modal.department}`)
      .then(res => {
        const list = res.data?.data || [];
        setModalCourses(list);
        setM('course', list[0]?._id || '');
      })
      .catch(console.error)
      .finally(() => setLoadingCourses(false));
  }, [modal.department]);

  // ── 7. Modal: load subjects when modal course + semester change ───────────
  useEffect(() => {
    if (!modal.course || !modal.semester) { setModalSubjects([]); return; }
    setShowAddSubject(false);
    setLoadingSubjects(true);
    getSubjects({ course: modal.course, semester: modal.semester })
      .then(res => {
        const list = res.data?.data || [];
        setModalSubjects(list);
        setM('subject', list[0]?._id || '');
      })
      .catch(console.error)
      .finally(() => setLoadingSubjects(false));
  }, [modal.course, modal.semester]);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!modal.department || !modal.course || !modal.semester) {
      toast.error('Select Department, Course and Semester first');
      return;
    }
    setSavingSubject(true);
    try {
      const res = await createSubject({
        name:       newSubject.name.trim(),
        code:       newSubject.code.trim().toUpperCase(),
        credits:    Number(newSubject.credits),
        type:       newSubject.type,
        department: modal.department,
        course:     modal.course,
        semester:   modal.semester,
      });
      const created = res.data?.data;
      if (created) {
        setModalSubjects(prev => [...prev, created]);
        setM('subject', created._id);
        toast.success(`Subject "${created.name}" added!`);
      }
      setNewSubject({ name: '', code: '', credits: 3, type: 'Theory' });
      setShowAddSubject(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create subject');
    } finally {
      setSavingSubject(false);
    }
  };

  const openModal = (day = 'Monday', time = '09:00', session = null) => {
    if (session) {
      setEditId(session._id);
      setModal({
        department: filters.department, course: filters.course,
        semester: filters.semester, division: filters.division,
        day: session.dayOfWeek, time: session.startTime,
        subject: session.subject?._id || '', type: session.isLab ? 'Practical' : 'Theory',
        faculty: session.faculty?._id || '', room: session.roomNumber || ''
      });
    } else {
      setEditId(null);
      setModal(p => ({
        ...p,
        department: filters.department || '',
        course: filters.course || '',
        semester: filters.semester || '',
        division: filters.division,
        day, time, subject: '', type: 'Theory', faculty: '', room: ''
      }));
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this class?')) return;
    try {
      await deleteTimetableSlotAPI(id);
      toast.success('Class deleted');
      setSchedule(p => p.filter(c => c._id !== id));
    } catch { toast.error('Failed to delete'); }
  };

  const getEndTime = (t) => ({ '09:00':'10:00','10:00':'11:00','11:15':'12:15','12:15':'13:15','2:00':'3:00','3:00':'4:00' }[t] || '10:00');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentAY)           { toast.error('Academic year not configured'); return; }
    if (!modal.department)    { toast.error('Please select a department');   return; }
    if (!modal.course)        { toast.error('Please select a course');       return; }
    if (!modal.semester)      { toast.error('Please select a semester');     return; }
    if (!modal.subject)       { toast.error('Please select a subject');      return; }
    if (!modal.faculty)       { toast.error('Please select a faculty');      return; }
    if (!modal.room.trim())   { toast.error('Please enter a room number');   return; }

    const payload = {
      department:   modal.department,
      course:       modal.course,
      semester:     modal.semester,
      division:     modal.division,
      academicYear: currentAY,
      dayOfWeek:    modal.day,
      startTime:    modal.time,
      endTime:      getEndTime(modal.time),
      subject:      modal.subject,
      faculty:      modal.faculty,
      roomNumber:   modal.room,
      isLab:        modal.type === 'Practical',
    };

    try {
      if (editId) {
        await updateTimetableSlotAPI(editId, payload);
        toast.success(`Class updated successfully!`);
      } else {
        await createTimetableSlotAPI(payload);
        const deptName = allDepts.find(d => d._id === modal.department)?.name || '';
        const divName  = modal.division;
        toast.success(`Class saved! All ${deptName} ${divName} students will see this in their timetable.`, { duration: 4000 });
      }

      // Sync view filters to what was just saved so grid updates
      setFilters({
        department: modal.department,
        course:     modal.course,
        semester:   modal.semester,
        division:   modal.division,
      });
      setIsModalOpen(false);
      setEditId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save class');
    }
  };

  const getClass = (day, time) => schedule.find(c => c.dayOfWeek === day && c.startTime === time);

  // ─────────────────────────────────────────────────────────────────────────
  // Sub-component: desktop grid
  const DesktopGrid = () => (
    <div className="hidden lg:block overflow-x-auto p-5">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LottieLoader size={80} />
        </div>
      ) : (
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr>
              <th className="border border-slate-200 bg-slate-50 p-3 text-center text-slate-500 dark:border-slate-700 dark:bg-dark-850 w-24">Time</th>
              {days.map(d => (
                <th key={d} className="border border-slate-200 bg-slate-50 p-3 text-center font-semibold text-slate-700 dark:border-slate-700 dark:bg-dark-850 dark:text-slate-300">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeslots.map(time => (
              <React.Fragment key={time}>
                {(time === '11:15' || time === '2:00') && (
                  <tr>
                    <td className="border border-slate-200 p-2 text-center text-xs font-medium text-slate-400 dark:border-slate-700 bg-slate-50 dark:bg-dark-900">
                      {time === '11:15' ? '11:00' : '1:00'}
                    </td>
                    <td colSpan={6} className="border border-slate-200 p-2 text-center text-xs font-semibold tracking-widest text-slate-400 uppercase bg-slate-50 dark:border-slate-700 dark:bg-dark-900">
                      {time === '11:15' ? 'Short Break' : 'Lunch Break'}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="border border-slate-200 p-3 text-center font-medium text-slate-500 dark:border-slate-700">{time}</td>
                  {days.map(day => {
                    const session = getClass(day, time);
                    return (
                      <td key={`${day}-${time}`} className="border border-slate-200 p-2 align-top dark:border-slate-700 h-28 w-48">
                        {session ? (
                          <SessionCard
                            session={session}
                            isAdmin={isAdmin}
                            onEdit={e => { e?.stopPropagation?.(); openModal(day, time, session); }}
                            onDelete={e => handleDelete(session._id, e)}
                          />
                        ) : isAdmin ? (
                          <div
                            onClick={() => openModal(day, time)}
                            className="flex h-full w-full items-center justify-center text-slate-300 dark:text-slate-700 border-2 border-dashed border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-lg cursor-pointer transition-colors"
                          >
                            <Plus size={20} />
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // Sub-component: mobile list
  const MobileList = () => (
    <div className="lg:hidden">
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 p-2 hide-scrollbar gap-1">
        {days.map(d => (
          <button key={d} onClick={() => setSelectedDay(d)}
            className={`px-4 py-2 whitespace-nowrap rounded-full text-sm font-medium ${selectedDay === d ? 'bg-brand-500 text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
            {d}
          </button>
        ))}
      </div>
      <div className="p-4 space-y-4">
        {loading && <div className="flex justify-center py-8"><LottieLoader size={60} /></div>}
        {!loading && timeslots.map(time => {
          const session = getClass(selectedDay, time);
          if (!session) return null;
          return (
            <div key={time} className="flex gap-4">
              <div className="w-16 flex-shrink-0 text-right pt-1">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{time}</span>
              </div>
              <div className={`flex-1 rounded-xl border p-4 ${sessionColors(session.isLab)}`}>
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-900 dark:text-white pr-4">{session.subject?.name}</h4>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${badgeColors(session.isLab)}`}>{session.isLab ? 'Practical' : 'Theory'}</span>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button onClick={e => { e.stopPropagation(); openModal(selectedDay, time, session); }} className="p-1 text-slate-400 hover:text-brand-500 bg-white dark:bg-dark-800 rounded border border-slate-200 dark:border-slate-700"><Edit2 size={14} /></button>
                        <button onClick={e => handleDelete(session._id, e)} className="p-1 text-slate-400 hover:text-red-500 bg-white dark:bg-dark-800 rounded border border-slate-200 dark:border-slate-700"><Trash2 size={14} /></button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2"><UserIcon size={14} /> {session.faculty?.fullName}</div>
                  <div className="flex items-center gap-2"><MapPin size={14} /> {session.roomNumber}</div>
                  <div className="col-span-2 flex flex-wrap gap-x-1 text-xs mt-1">
                    {[
                      session.department ? (session.department.code || session.department.name) : null,
                      session.course ? (session.course.code || session.course.name) : null,
                      session.semester ? session.semester.name : null,
                      session.division ? session.division : null
                    ].filter(Boolean).map((text, idx, arr) => (
                      <React.Fragment key={idx}>
                        <span className={idx < 2 ? "font-medium" : ""}>{text}</span>
                        {idx < arr.length - 1 && <span className="opacity-40">•</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {!loading && !timeslots.some(t => getClass(selectedDay, t)) && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <BookOpen size={32} className="mb-3 opacity-40" />
            <p className="text-sm">No classes scheduled on {selectedDay}</p>
            {isAdmin && (
              <button onClick={() => openModal(selectedDay)} className="mt-4 flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white">
                <Plus size={16} /> Schedule a Class
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  const deptLabel = schedule[0]?.department?.name || '';
  const courseLabel = schedule[0]?.course?.name || '';
  const semLabel  = schedule[0]?.semester?.name  || '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {(isStudent || isParent || (isFaculty && viewMode === 'my')) ? 'My Timetable' : 'Master Timetable'}
          </h1>
          <p className="text-sm text-slate-500">
            {isStudent
              ? deptLabel ? `${deptLabel} — ${semLabel}` : 'Your class schedule'
              : isParent
                ? 'Your child\'s class schedule'
                : (isFaculty && viewMode === 'my')
                  ? 'Your assigned lectures across all departments'
                  : 'View and manage class schedules across departments.'}
          </p>
        </div>
        <div className="flex gap-2">
          {isFaculty && (
            <div className="flex bg-slate-100 p-1 rounded-lg dark:bg-dark-800 border border-slate-200 dark:border-slate-700">
              <button 
                onClick={() => setViewMode('my')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'my' ? 'bg-white text-brand-600 shadow-sm dark:bg-dark-900 dark:text-brand-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                My Schedule
              </button>
              <button 
                onClick={() => setViewMode('master')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'master' ? 'bg-white text-brand-600 shadow-sm dark:bg-dark-900 dark:text-brand-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Master
              </button>
            </div>
          )}
          {isAdmin && (
            <button onClick={() => openModal()}
              className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600">
              <Plus size={16} /> Schedule Class
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-dark-800">

        {/* Parent student selection tabs */}
        {isParent && parentStudents.length > 1 && (
          <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 p-4">
            {parentStudents.map(student => (
              <button
                key={student._id}
                onClick={() => setSelectedStudent(student)}
                className={`pb-1 px-1 text-sm font-semibold transition-all ${
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

        {/* Admin/Master view filters */}
        {canViewFilters && (
          <div className="flex flex-wrap gap-3 p-4 border-b border-slate-200 dark:border-slate-800 items-center">
            <select value={filters.department} onChange={e => setFilters(p => ({ ...p, department: e.target.value }))}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-dark-900">
              {allDepts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
            <select value={filters.course} onChange={e => setFilters(p => ({ ...p, course: e.target.value }))}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-dark-900">
              {viewCourses.length === 0 && <option value="">No Courses</option>}
              {viewCourses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <select value={filters.semester} onChange={e => setFilters(p => ({ ...p, semester: e.target.value }))}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-dark-900">
              {allSemesters.length === 0 && <option value="">No Semesters</option>}
              {allSemesters.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <select value={filters.division} onChange={e => setFilters(p => ({ ...p, division: e.target.value }))}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-dark-900">
              {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        )}

        {/* Student/Faculty info bar */}
        {(isStudent || isParent) && schedule.length > 0 && (
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 px-5 py-3 bg-brand-50/40 dark:bg-brand-900/10">
            <BookOpen size={16} className="text-brand-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {deptLabel && <span className="mr-3">Dept: <strong>{deptLabel}</strong></span>}
              {courseLabel && <span className="mr-3">Course: <strong>{courseLabel}</strong></span>}
              {semLabel  && <span className="mr-3">Semester: <strong>{semLabel}</strong></span>}
              {schedule[0]?.division && <span>Division: <strong>{schedule[0].division}</strong></span>}
            </span>
          </div>
        )}

        {/* Student/Faculty/Parent — no timetable */}
        {(isStudent || isParent || (isFaculty && viewMode === 'my')) && !loading && schedule.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="rounded-full bg-slate-100 p-5 dark:bg-dark-800 mb-4">
              <BookOpen size={32} className="text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No timetable assigned yet</h3>
            <p className="mt-1 text-sm text-slate-500">Your timetable will appear here once your classes are scheduled.</p>
          </div>
        )}

        {(isAdmin || schedule.length > 0 || loading) && (
          <>
            <DesktopGrid />
            <MobileList />
          </>
        )}
      </div>

      {/* ════ Schedule Class Modal (Admin only) ════════════════════════════ */}
      {isAdmin && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Class" hideFooter={true}>
          <form onSubmit={handleSubmit} className="space-y-5 mt-2">

            {/* ── Step 1: Target class group ─────────────────────────────── */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                Step 1 — Select Target Class Group
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <Label required>Department</Label>
                  <select value={modal.department} onChange={e => setM('department', e.target.value)} required className={selectCls}>
                    <option value="">— Select Department —</option>
                    {allDepts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label required>Course</Label>
                  <select value={modal.course} onChange={e => setM('course', e.target.value)} required disabled={!modal.department || loadingCourses} className={selectCls}>
                    <option value="">{loadingCourses ? 'Loading…' : '— Select Course —'}</option>
                    {modalCourses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label required>Semester</Label>
                  <select value={modal.semester} onChange={e => setM('semester', e.target.value)} required className={selectCls}>
                    <option value="">— Select Semester —</option>
                    {allSemesters.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <Label required>Division</Label>
                  <select value={modal.division} onChange={e => setM('division', e.target.value)} className={selectCls}>
                    {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Target summary pill */}
              {modal.department && modal.course && modal.semester && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs rounded-lg bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 px-3 py-2">
                  <Users size={13} className="text-brand-500 flex-shrink-0" />
                  <span className="font-semibold text-brand-700 dark:text-brand-300">Visible to:</span>
                  <span className="text-slate-600 dark:text-slate-300">
                    All <strong>{allDepts.find(d => d._id === modal.department)?.name}</strong> students in{' '}
                    <strong>{modalCourses.find(c => c._id === modal.course)?.name}</strong> ·{' '}
                    <strong>{allSemesters.find(s => s._id === modal.semester)?.name}</strong> ·{' '}
                    <strong>{modal.division}</strong>
                  </span>
                </div>
              )}
            </div>

            <hr className="border-slate-200 dark:border-slate-700" />

            {/* ── Step 2: Class details ──────────────────────────────────── */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                Step 2 — Class Details
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label required>Day</Label>
                  <select value={modal.day} onChange={e => setM('day', e.target.value)} className={selectCls}>
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <Label required>Time</Label>
                  <select value={modal.time} onChange={e => setM('time', e.target.value)} className={selectCls}>
                    {timeslots.map(t => <option key={t} value={t}>{t} – {getEndTime(t)}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <Label required>Subject</Label>
                    {modal.course && modal.semester && !showAddSubject && (
                      <button
                        type="button"
                        onClick={() => { setShowAddSubject(true); setNewSubject({ name: '', code: '', credits: 3, type: 'Theory' }); }}
                        className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                      >
                        <Plus size={13} /> Add Subject
                      </button>
                    )}
                  </div>

                  {/* Subject select */}
                  {!showAddSubject && (
                    <select value={modal.subject} onChange={e => setM('subject', e.target.value)} required
                      disabled={!modal.course || !modal.semester || loadingSubjects} className={selectCls}>
                      <option value="">{loadingSubjects ? 'Loading…' : modalSubjects.length === 0 ? '— No subjects yet —' : '— Select Subject —'}</option>
                      {modalSubjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                    </select>
                  )}

                  {/* Empty state nudge */}
                  {!showAddSubject && modal.course && modal.semester && !loadingSubjects && modalSubjects.length === 0 && (
                    <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                      No subjects for this course/semester yet.{' '}
                      <button type="button" onClick={() => setShowAddSubject(true)}
                        className="underline font-semibold">Add one now →</button>
                    </p>
                  )}

                  {/* Inline add subject form */}
                  {showAddSubject && (
                    <div className="rounded-lg border border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/10 p-3 space-y-3">
                      <p className="text-xs font-semibold text-brand-700 dark:text-brand-300">New Subject</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2">
                          <input
                            type="text" required placeholder="Subject Name *"
                            value={newSubject.name} onChange={e => setNS('name', e.target.value)}
                            className={inputCls}
                          />
                        </div>
                        <input
                          type="text" required placeholder="Code * (e.g. CS401)"
                          value={newSubject.code} onChange={e => setNS('code', e.target.value.toUpperCase())}
                          className={inputCls}
                        />
                        <input
                          type="number" min="1" max="10" placeholder="Credits *"
                          value={newSubject.credits} onChange={e => setNS('credits', e.target.value)}
                          className={inputCls}
                        />
                        <select value={newSubject.type} onChange={e => setNS('type', e.target.value)} className={`${selectCls} col-span-2`}>
                          <option value="Theory">Theory</option>
                          <option value="Practical">Practical</option>
                          <option value="Elective">Elective</option>
                          <option value="Tutorial">Tutorial</option>
                        </select>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setShowAddSubject(false)}
                          className="rounded px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-dark-800">
                          Cancel
                        </button>
                        <button type="button" onClick={handleAddSubject} disabled={savingSubject}
                          className="flex items-center gap-1 rounded bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                          {savingSubject ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                          {savingSubject ? 'Saving…' : 'Save Subject'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <Label>Type</Label>
                  <select value={modal.type} onChange={e => setM('type', e.target.value)} className={selectCls}>
                    <option value="Theory">Theory</option>
                    <option value="Practical">Practical</option>
                  </select>
                </div>
                <div>
                  <Label required>Faculty</Label>
                  <select value={modal.faculty} onChange={e => setM('faculty', e.target.value)} required className={selectCls}>
                    <option value="">— Select Faculty —</option>
                    {allFaculties.map(f => <option key={f._id} value={f._id}>{f.fullName}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <Label required>Room / Hall</Label>
                  <input type="text" value={modal.room} onChange={e => setM('room', e.target.value)}
                    placeholder="e.g. L-101, Lab-3, Hall-A" required className={inputCls} />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-dark-800">
                Cancel
              </button>
              <button type="submit"
                className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                <ChevronRight size={16} /> {editId ? 'Update Class' : 'Save & Notify Students'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TimetablePage;

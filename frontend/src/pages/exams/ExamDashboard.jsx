import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Award, ChevronDown, CheckCircle, Clock } from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../../api/axios';

const ExamDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const roleName = typeof user?.role === 'object' ? user?.role?.name : user?.role;
  const isStudent = roleName === 'Student';
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await api.get('/exams/dashboard');
        setExams(response.data.data);
      } catch (error) {
        console.error("Failed to fetch exam stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Examinations</h1>
          <p className="text-sm text-slate-500">
            {isStudent ? 'View your exam schedule and results.' : 'Manage exam schedules and enter marks.'}
          </p>
        </div>
        
        {!isStudent && (
          <button className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700">
            Schedule Exam
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Exam Schedule */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-dark-900 overflow-hidden">
          <div className="border-b border-slate-200 p-4 dark:border-slate-800 bg-slate-50 dark:bg-dark-800/50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon size={18} className="text-brand-500" /> Exam Timetable
            </h3>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {exams.filter(e => e.status === 'Upcoming').map((exam) => {
              const d = new Date(exam.date);
              const month = d.toLocaleString('default', { month: 'short' }).toUpperCase();
              const day = d.getDate();
              return (
              <div key={exam.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-dark-800/50 transition">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center rounded bg-brand-50 dark:bg-brand-900/20 px-3 py-2 text-center border border-brand-100 dark:border-brand-800/50">
                    <span className="text-sm font-bold text-brand-700 dark:text-brand-400">{month}</span>
                    <span className="text-lg font-black text-brand-700 dark:text-brand-400">{day}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">{exam.subject}</h4>
                    <p className="text-sm text-slate-500 font-medium">{exam.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    <Clock size={12} /> {exam.status}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">Total Marks: {exam.marks}</p>
                </div>
              </div>
            )})}
          </div>
        </div>

        {/* Results Overview */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-dark-900 h-fit">
          <div className="border-b border-slate-200 p-4 dark:border-slate-800 bg-slate-50 dark:bg-dark-800/50">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Award size={18} className="text-brand-500" /> Recent Results
            </h3>
          </div>
          
          <div className="p-4 space-y-4">
            {exams.filter(e => e.status === 'Published' || e.status === 'Evaluating').map((exam) => (
              <div key={exam.id} className="border border-slate-100 dark:border-slate-800 rounded-lg p-3 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500"></div>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white pl-2">{exam.subject}</h4>
                <p className="text-xs text-slate-500 pl-2 mb-2">{exam.title}</p>
                
                {exam.status === 'Published' ? (
                  <div className="mt-2 flex items-center justify-between pl-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Score</span>
                    <span className="font-bold text-lg text-green-600 dark:text-green-400">{exam.score}/{exam.marks}</span>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center gap-1.5 pl-2">
                    <Clock size={14} className="text-amber-500" />
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Evaluating...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ExamDashboard;

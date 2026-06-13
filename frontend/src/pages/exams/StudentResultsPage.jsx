import React, { useState, useEffect } from 'react';
import { Award, Target, BookOpen, AlertCircle, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { getMyResultsAPI } from '../../api/exams.api';
import toast from 'react-hot-toast';

const StudentResultsPage = () => {
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await getMyResultsAPI();
      setResults(res.data?.data?.results || []);
      setSummary(res.data?.data?.summary || null);
    } catch (err) {
      toast.error('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    switch(grade) {
      case 'A+': case 'A': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'B+': case 'B': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'C': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'D': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'F': default: return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    }
  };

  if (loading) {
    return <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Award size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Exam Results</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">View your academic performance and grades</p>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-dark-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Exams</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{summary.totalExams}</span>
          </div>
          <div className="bg-white dark:bg-dark-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Average Score</span>
            <span className="text-2xl font-black text-brand-600 dark:text-brand-400">{summary.averagePercentage}%</span>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 flex flex-col gap-1">
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">Passed</span>
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{summary.passedExams}</span>
          </div>
          <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-100 dark:border-red-800/30 flex flex-col gap-1">
            <span className="text-red-600 dark:text-red-400 text-xs font-semibold uppercase tracking-wider">Failed</span>
            <span className="text-2xl font-black text-red-700 dark:text-red-300">{summary.failedExams}</span>
          </div>
        </div>
      )}

      {results.length === 0 ? (
        <div className="bg-white dark:bg-dark-800 p-10 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
          <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Results Found</h3>
          <p className="text-sm text-slate-500">Your exam results have not been published yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((result) => (
            <div key={result._id} className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col transition-all hover:shadow-md">
              <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">{result.subject?.name || 'Subject'}</h3>
                  <p className="text-xs text-slate-500 font-medium">{result.examTitle} ({result.examType})</p>
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getGradeColor(result.grade)}`}>
                  {result.grade}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Marks Obtained</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                      {result.marksObtained} <span className="text-sm text-slate-400 font-medium">/ {result.totalMarks}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Percentage</p>
                    <p className={`text-lg font-black mt-0.5 ${result.passed ? 'text-emerald-600' : 'text-red-600'}`}>
                      {result.percentage}%
                    </p>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 dark:bg-dark-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${result.passed ? 'bg-emerald-500' : 'bg-red-500'}`}
                    style={{ width: `${result.percentage}%` }}
                  />
                </div>
                
                <div className="flex items-center gap-2 mt-auto pt-2">
                  {result.passed ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                      <CheckCircle2 size={14} /> Passed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                      <XCircle size={14} /> Failed (Min: {result.passingMarks})
                    </span>
                  )}
                  <span className="text-xs text-slate-400 ml-auto">{new Date(result.date).toLocaleDateString()}</span>
                </div>
                
                {result.remarks && (
                  <div className="mt-2 text-xs italic text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-3">
                    "{result.remarks}"
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentResultsPage;

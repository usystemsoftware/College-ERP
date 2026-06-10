import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getMyParentProfileAPI } from '../../api/parents.api';
import { 
  UserCircle, 
  GraduationCap as AcademicCapIcon, 
  MapPin as MapPinIcon, 
  Briefcase as BriefcaseIcon,
  Phone as PhoneIcon,
  Mail as EnvelopeIcon
} from 'lucide-react';

const ParentDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await getMyParentProfileAPI();
        setProfile(response.data.data.parent);
      } catch (err) {
        setError('Failed to load parent profile. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <div className="rounded-xl bg-red-50 p-6 text-center text-red-600 dark:bg-red-900/20 dark:text-red-400">
          <p className="font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <div className="rounded-xl bg-slate-50 p-6 text-center text-slate-600 dark:bg-dark-800 dark:text-slate-400">
          <p className="font-semibold">Profile not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 p-8 text-white shadow-lg dark:from-brand-800 dark:to-indigo-900">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-3xl font-bold backdrop-blur-md">
              {profile.fullName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {profile.fullName}</h1>
              <p className="mt-1 text-brand-100">{profile.relation || 'Parent'} Portal</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Contact Info Card */}
        <div className="col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-dark-900">
          <h2 className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-100">Contact Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
              <EnvelopeIcon className="h-5 w-5 text-brand-500" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
              <PhoneIcon className="h-5 w-5 text-brand-500" />
              <span>{profile.phone}</span>
            </div>
            {profile.occupation && (
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <BriefcaseIcon className="h-5 w-5 text-brand-500" />
                <span>{profile.occupation}</span>
              </div>
            )}
            {profile.address && (
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <MapPinIcon className="h-5 w-5 text-brand-500" />
                <span className="line-clamp-2">{profile.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Children Section */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">My Children</h2>
          {profile.students && profile.students.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {profile.students.map((student) => (
                <div key={student._id} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-brand-500 hover:shadow-md dark:border-slate-700/50 dark:bg-dark-900 dark:hover:border-brand-500">
                  <div className="absolute inset-x-0 bottom-0 h-1 scale-x-0 bg-gradient-to-r from-brand-500 to-indigo-500 transition-transform duration-300 group-hover:scale-x-100"></div>
                  
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                      <AcademicCapIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100">
                        {student.personalDetails?.fullName}
                      </h3>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Roll No: {student.rollNumber}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                      <span className="font-medium">Course</span>
                      <span>{student.course?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                      <span className="font-medium">Department</span>
                      <span>{student.department?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="font-medium">Semester</span>
                      <span>{student.semester?.name || student.semester || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                    <button className="rounded-lg bg-brand-50 py-2 text-center text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20">
                      Attendance
                    </button>
                    <button className="rounded-lg bg-indigo-50 py-2 text-center text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20">
                      Grades
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-dark-800/50">
              <AcademicCapIcon className="mx-auto mb-3 h-10 w-10 text-slate-400" />
              <p className="text-slate-600 dark:text-slate-400">No children linked to this profile.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;

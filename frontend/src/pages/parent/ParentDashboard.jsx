import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
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
=======
import { getMyParentProfileAPI } from '../../api/parents.api';
import { Users, BookOpen, Clock, Building } from 'lucide-react';
import toast from 'react-hot-toast';

const ParentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
>>>>>>> 447f6e40b4e01ace869e696dfbb504ee5d1ceb5c

  useEffect(() => {
    const fetchProfile = async () => {
      try {
<<<<<<< HEAD
        const response = await getMyParentProfileAPI();
        setProfile(response.data.data.parent);
      } catch (err) {
        setError('Failed to load parent profile. Please try again later.');
        console.error(err);
=======
        const res = await getMyParentProfileAPI();
        setProfile(res.data.data.parent);
      } catch (error) {
        toast.error('Failed to load parent profile');
>>>>>>> 447f6e40b4e01ace869e696dfbb504ee5d1ceb5c
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
<<<<<<< HEAD
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
=======
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
>>>>>>> 447f6e40b4e01ace869e696dfbb504ee5d1ceb5c
      </div>
    );
  }

  if (!profile) {
    return (
<<<<<<< HEAD
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <div className="rounded-xl bg-slate-50 p-6 text-center text-slate-600 dark:bg-dark-800 dark:text-slate-400">
          <p className="font-semibold">Profile not found.</p>
        </div>
=======
      <div className="flex h-full flex-col items-center justify-center text-slate-500">
        <Users size={48} className="mb-4 text-slate-300" />
        <h2 className="text-xl font-semibold">Profile Not Found</h2>
        <p>We could not find your parent profile. Please contact the administration.</p>
>>>>>>> 447f6e40b4e01ace869e696dfbb504ee5d1ceb5c
      </div>
    );
  }

  return (
    <div className="space-y-6">
<<<<<<< HEAD
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
                      <span>{student.semester?.name || 'N/A'}</span>
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
=======
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Welcome, {profile.fullName}
        </h1>
        <div className="rounded-lg bg-white px-4 py-2 shadow-sm border border-slate-200 dark:bg-dark-800 dark:border-slate-800">
          <span className="text-sm text-slate-500 dark:text-slate-400">Relation: </span>
          <span className="font-medium text-slate-700 dark:text-slate-300">{profile.relation}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Linked Students Section */}
        <div className="col-span-1 xl:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Users size={20} className="text-brand-500" />
            Linked Students
          </h2>
          
          {profile.students && profile.students.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {profile.students.map((student) => (
                <div key={student._id} className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-dark-900 transition-all hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg">
                        {student.personalDetails?.fullName || 'N/A'}
                      </h3>
                      <p className="text-sm font-medium text-brand-600 dark:text-brand-400 mt-1">
                        Roll: {student.rollNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} />
                      <span>{student.course?.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building size={16} />
                      <span>{student.department?.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>Semester {student.semester || 'N/A'}</span>
                    </div>
                  </div>
>>>>>>> 447f6e40b4e01ace869e696dfbb504ee5d1ceb5c
                </div>
              ))}
            </div>
          ) : (
<<<<<<< HEAD
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-dark-800/50">
              <AcademicCapIcon className="mx-auto mb-3 h-10 w-10 text-slate-400" />
              <p className="text-slate-600 dark:text-slate-400">No children linked to this profile.</p>
            </div>
          )}
        </div>
=======
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700">
              <Users size={32} className="mx-auto mb-2 text-slate-400" />
              <p>No students linked to your profile yet.</p>
            </div>
          )}
        </div>

        {/* Profile Info Section */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-dark-800">
          <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
            Contact Information
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-slate-500 dark:text-slate-400 mb-1">Email Address</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">{profile.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 mb-1">Phone Number</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">{profile.phone || 'N/A'}</p>
            </div>
            {profile.alternatePhone && (
              <div>
                <p className="text-slate-500 dark:text-slate-400 mb-1">Alternate Phone</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">{profile.alternatePhone}</p>
              </div>
            )}
            <div>
              <p className="text-slate-500 dark:text-slate-400 mb-1">Occupation</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">{profile.occupation || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 mb-1">Address</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">{profile.address || 'N/A'}</p>
            </div>
          </div>
        </div>
>>>>>>> 447f6e40b4e01ace869e696dfbb504ee5d1ceb5c
      </div>
    </div>
  );
};

export default ParentDashboard;

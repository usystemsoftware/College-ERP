import React, { useEffect, useState } from 'react';
import { getMyParentProfileAPI } from '../../api/parents.api';
import { Users, BookOpen, Clock, Building } from 'lucide-react';
import toast from 'react-hot-toast';

const ParentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMyParentProfileAPI();
        setProfile(res.data.data.parent);
      } catch (error) {
        toast.error('Failed to load parent profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-slate-500">
        <Users size={48} className="mb-4 text-slate-300" />
        <h2 className="text-xl font-semibold">Profile Not Found</h2>
        <p>We could not find your parent profile. Please contact the administration.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                </div>
              ))}
            </div>
          ) : (
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
      </div>
    </div>
  );
};

export default ParentDashboard;

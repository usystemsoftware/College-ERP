import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { User, Mail, Shield, Building, Calendar, Phone, MapPin } from 'lucide-react';
import Modal from '../../components/common/Modal';

const Profile = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  
  // Safe extraction of role name
  const roleName = typeof user?.role === 'object' ? user?.role?.name : user?.role;
  
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-dark-900">
        <div className="h-32 bg-gradient-to-r from-brand-500 to-indigo-600 sm:h-48"></div>
        <div className="relative px-6 pb-8 sm:px-10">
          <div className="-mt-16 flex flex-col items-start sm:-mt-20 sm:flex-row sm:items-end sm:space-x-5">
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-indigo-100 text-indigo-500 dark:border-dark-900 dark:bg-indigo-900/30 sm:h-40 sm:w-40">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="h-full w-full rounded-full object-cover" />
              ) : (
                <span className="text-5xl font-bold uppercase">{user?.email?.charAt(0) || 'U'}</span>
              )}
            </div>
            <div className="mt-4 sm:mt-0 sm:flex-1 sm:pb-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                {user?.name || user?.email?.split('@')[0]}
              </h2>
              <p className="mt-1 flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
                <Shield size={16} className="mr-1.5" />
                {roleName || 'User'}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:pb-4">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
              >
                Edit Profile
              </button>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                Account Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-500 dark:bg-dark-800 dark:text-slate-400">
                    <Mail size={20} />
                  </div>
                  <div className="ml-4">
                    <p className="text-xs font-medium text-slate-500">Email Address</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-500 dark:bg-dark-800 dark:text-slate-400">
                    <Building size={20} />
                  </div>
                  <div className="ml-4">
                    <p className="text-xs font-medium text-slate-500">Department / College</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                      {user?.collegeId ? 'State Institute of Technology' : 'System Administration'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-500 dark:bg-dark-800 dark:text-slate-400">
                    <Calendar size={20} />
                  </div>
                  <div className="ml-4">
                    <p className="text-xs font-medium text-slate-500">Member Since</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                      {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                Personal Details
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-500 dark:bg-dark-800 dark:text-slate-400">
                    <User size={20} />
                  </div>
                  <div className="ml-4">
                    <p className="text-xs font-medium text-slate-500">Full Name</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{user?.name || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-500 dark:bg-dark-800 dark:text-slate-400">
                    <Phone size={20} />
                  </div>
                  <div className="ml-4">
                    <p className="text-xs font-medium text-slate-500">Phone Number</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{user?.phone || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-500 dark:bg-dark-800 dark:text-slate-400">
                    <MapPin size={20} />
                  </div>
                  <div className="ml-4">
                    <p className="text-xs font-medium text-slate-500">Address</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{user?.address || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
      >
        <form className="space-y-4 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
              <input type="text" defaultValue={user?.name || ''} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800" placeholder="Your full name" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
              <input type="text" defaultValue={user?.phone || ''} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800" placeholder="+1 234 567 890" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
              <textarea defaultValue={user?.address || ''} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800" placeholder="Your full address" rows="3"></textarea>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;

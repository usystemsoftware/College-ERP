import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Mail, Shield, Building, Calendar, Phone, MapPin, Camera, Loader2 } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { uploadProfileImageAPI, updateProfileAPI } from '../../api/auth.api';
import { loadCurrentUser } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';

const Profile = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || ''
      });
      // Reset image error state when user changes (like after a successful upload)
      setImgError(false);
    }
  }, [user]);
  
  // Safe extraction of role name
  const roleName = typeof user?.role === 'object' ? user?.role?.name : user?.role;

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    setIsUploading(true);
    try {
      const res = await uploadProfileImageAPI(formData);
      if (res.success) {
        toast.success('Profile photo updated');
        dispatch(loadCurrentUser()); // Reload user to update the UI
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update photo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfileAPI(formData);
      if (res.success) {
        toast.success('Profile updated successfully');
        dispatch(loadCurrentUser());
        setIsEditModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };
  
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-dark-900">
        <div className="h-32 bg-gradient-to-r from-brand-500 to-indigo-600 sm:h-48"></div>
        <div className="relative px-6 pb-8 sm:px-10">
          <div className="-mt-16 flex flex-col items-start sm:-mt-20 sm:flex-row sm:items-end sm:space-x-5">
            <div 
              className="relative group flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-indigo-100 text-indigo-500 dark:border-dark-900 dark:bg-indigo-900/30 sm:h-40 sm:w-40 cursor-pointer overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : user?.profileImage && !imgError ? (
                <img 
                  src={`http://localhost:5050${user.profileImage}`} 
                  alt="Profile" 
                  className="h-full w-full rounded-full object-cover" 
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="text-5xl font-bold uppercase">{user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}</span>
              )}
              <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white transition-all">
                <Camera size={24} />
              </div>
              <input 
                type="file" 
                style={{ display: 'none' }} 
                ref={fileInputRef} 
                accept="image/*"
                onChange={handlePhotoUpload} 
              />
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
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      }) : 'Unknown'}
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
        hideFooter={true} // We will use our own footer inside the form
      >
        <form className="space-y-4 mt-2" onSubmit={handleProfileSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800" 
                placeholder="Your full name" 
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
              <input 
                type="text" 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800" 
                placeholder="+1 234 567 890" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
              <textarea 
                value={formData.address} 
                onChange={(e) => setFormData({...formData, address: e.target.value})} 
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800" 
                placeholder="Your full address" 
                rows="3"
              ></textarea>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-dark-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;

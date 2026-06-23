import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { createPlacementAPI, getCompaniesAPI } from '../../api/placements.api';
import toast from 'react-hot-toast';

const PlacementModal = ({ onClose, onSuccess }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await getCompaniesAPI();
        setCompanies(response.data.data || []);
      } catch (error) {
        toast.error('Failed to load companies');
      }
    };
    fetchCompanies();
  }, []);

  const onSubmit = async (data) => {
    try {
      await createPlacementAPI(data);
      toast.success('Placement drive created successfully');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create drive');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-dark-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Placement Drive</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-dark-800 dark:hover:text-slate-300"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Company</label>
              <select
                {...register('company', { required: 'Company is required' })}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-dark-700 dark:bg-dark-950 dark:text-white"
              >
                <option value="">Select Company</option>
                {companies.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              {errors.company && <p className="mt-1 text-xs text-red-500">{errors.company.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Job Title</label>
              <input
                type="text"
                {...register('jobTitle', { required: 'Job title is required' })}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-dark-700 dark:bg-dark-950 dark:text-white"
              />
              {errors.jobTitle && <p className="mt-1 text-xs text-red-500">{errors.jobTitle.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
              <select
                {...register('type')}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-dark-700 dark:bg-dark-950 dark:text-white"
              >
                <option value="Placement">Placement</option>
                <option value="Internship">Internship</option>
                <option value="PPO">PPO</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Package (LPA)</label>
              <input
                type="number"
                step="0.01"
                {...register('packageLPA', { required: 'Package is required' })}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-dark-700 dark:bg-dark-950 dark:text-white"
              />
              {errors.packageLPA && <p className="mt-1 text-xs text-red-500">{errors.packageLPA.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Drive Date</label>
              <input
                type="date"
                {...register('driveDate', { required: 'Drive date is required' })}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-dark-700 dark:bg-dark-950 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Last Apply Date</label>
              <input
                type="date"
                {...register('lastApplyDate', { required: 'Last apply date is required' })}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-dark-700 dark:bg-dark-950 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Minimum CGPA</label>
              <input
                type="number"
                step="0.01"
                {...register('eligibilityCriteria.minCGPA')}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-dark-700 dark:bg-dark-950 dark:text-white"
                defaultValue={0}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Location</label>
              <input
                type="text"
                {...register('location')}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-dark-700 dark:bg-dark-950 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea
              rows={3}
              {...register('description', { required: 'Description is required' })}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-dark-700 dark:bg-dark-950 dark:text-white"
            ></textarea>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-dark-700 dark:bg-dark-900 dark:text-slate-300 dark:hover:bg-dark-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 dark:bg-brand-600 dark:hover:bg-brand-700"
            >
              {isSubmitting ? 'Creating...' : 'Create Drive'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlacementModal;

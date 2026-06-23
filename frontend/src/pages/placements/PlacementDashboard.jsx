import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Briefcase, Building, Plus, Search, MapPin, Calendar, DollarSign } from 'lucide-react';
import { getPlacementsAPI, applyForPlacementAPI } from '../../api/placements.api';
import toast from 'react-hot-toast';
import CompanyModal from './CompanyModal';
import PlacementModal from './PlacementModal';

const PlacementDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const isStudent = user?.role === 'Student' || user?.role?.name === 'Student';
  const canManage = ['Super Admin', 'College Admin', 'Placement Officer'].includes(user?.role?.name || user?.role);

  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showPlacementModal, setShowPlacementModal] = useState(false);

  const fetchPlacements = async () => {
    try {
      setLoading(true);
      const response = await getPlacementsAPI();
      setPlacements(response.data?.data?.placements || []);
    } catch (error) {
      toast.error('Failed to fetch placements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacements();
  }, []);

  const handleApply = async (id) => {
    try {
      await applyForPlacementAPI(id);
      toast.success('Successfully applied for this drive');
      fetchPlacements();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Placement Drives</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">View and manage campus placement opportunities</p>
        </div>
        
        {canManage && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowCompanyModal(true)}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-dark-700 dark:bg-dark-900 dark:text-slate-300 dark:hover:bg-dark-800"
            >
              <Building size={16} /> Add Company
            </button>
            <button
              onClick={() => setShowPlacementModal(true)}
              className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700"
            >
              <Plus size={16} /> Create Drive
            </button>
          </div>
        )}
      </div>

      {/* Grid of Placements */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
        </div>
      ) : placements.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-dark-800 dark:bg-dark-900">
          <Briefcase className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No active drives</h3>
          <p className="mt-2 text-slate-500">There are currently no placement drives available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {placements.map((drive) => {
            const isApplied = isStudent && drive.applications?.some(app => app.student === user?._id || app.student?._id === user?._id);
            return (
              <div key={drive._id} className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-dark-800 dark:bg-dark-900">
                <div>
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{drive.jobTitle}</h3>
                      <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                        <Building size={14} className="text-slate-400" />
                        {drive.company?.name || 'Company Name'}
                      </div>
                    </div>
                    <span className="rounded-full bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                      {drive.type}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-slate-400" />
                      <span>{drive.packageLPA} LPA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-slate-400" />
                      <span>{drive.location || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-slate-400" />
                      <span>Drive Date: {new Date(drive.driveDate).toLocaleDateString()}</span>
                    </div>
                    {drive.lastApplyDate && (
                      <div className="flex items-center gap-2 text-red-500 dark:text-red-400">
                        <Calendar size={16} />
                        <span>Deadline: {new Date(drive.lastApplyDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <p className="mt-4 line-clamp-3 text-sm text-slate-500 dark:text-slate-500">
                    {drive.description}
                  </p>
                </div>

                <div className="mt-6">
                  {isStudent ? (
                    <button
                      onClick={() => handleApply(drive._id)}
                      disabled={isApplied || drive.status !== 'Open'}
                      className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        isApplied 
                          ? 'bg-slate-100 text-slate-500 cursor-not-allowed dark:bg-dark-800'
                          : drive.status === 'Open'
                            ? 'bg-brand-500 text-white hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700'
                            : 'bg-red-50 text-red-500 cursor-not-allowed dark:bg-red-500/10'
                      }`}
                    >
                      {isApplied ? 'Applied' : drive.status === 'Open' ? 'Apply Now' : 'Closed'}
                    </button>
                  ) : (
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>Status: {drive.status}</span>
                      <span>{drive.applications?.length || 0} Applicants</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCompanyModal && (
        <CompanyModal 
          onClose={() => setShowCompanyModal(false)} 
          onSuccess={() => {
            setShowCompanyModal(false);
          }} 
        />
      )}
      
      {showPlacementModal && (
        <PlacementModal 
          onClose={() => setShowPlacementModal(false)} 
          onSuccess={() => {
            setShowPlacementModal(false);
            fetchPlacements();
          }} 
        />
      )}
    </div>
  );
};

export default PlacementDashboard;

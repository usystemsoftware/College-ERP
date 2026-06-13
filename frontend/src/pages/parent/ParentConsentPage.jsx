import React, { useState, useEffect } from 'react';
import { ShieldCheck, MapPin, Bell, Camera, Bus, Loader2, AlertTriangle, Info } from 'lucide-react';
import { getConsentStatusAPI, grantConsentAPI, revokeConsentAPI } from '../../api/consent.api';
import toast from 'react-hot-toast';

const ParentConsentPage = () => {
  const [consentData, setConsentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // stores { studentId, type }

  useEffect(() => {
    fetchConsentStatus();
  }, []);

  const fetchConsentStatus = async () => {
    try {
      const res = await getConsentStatusAPI();
      setConsentData(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load consent settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConsent = async (studentId, consentType, currentStatus) => {
    setUpdating({ studentId, type: consentType });
    try {
      if (currentStatus === 'granted') {
        await revokeConsentAPI({ studentId, consentType });
        toast.success('Consent revoked successfully');
      } else {
        await grantConsentAPI({ studentId, consentType });
        toast.success('Consent granted successfully');
      }
      await fetchConsentStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update consent');
    } finally {
      setUpdating(null);
    }
  };

  const consentOptions = [
    {
      id: 'location_tracking',
      title: 'GPS Location Tracking',
      icon: <MapPin size={20} className="text-blue-500" />,
      description: "Allow the college to track your child's real-time location during school hours and transit.",
      warning: "Required for the Campus Live Widget and 'On the Way' status features."
    },
    {
      id: 'sms_alerts',
      title: 'SMS & WhatsApp Alerts',
      icon: <Bell size={20} className="text-amber-500" />,
      description: "Receive automated text messages for low attendance, exam results, and emergencies.",
      warning: "Standard messaging rates may apply depending on your carrier."
    },
    {
      id: 'bus_tracking',
      title: 'Live Bus Tracking',
      icon: <Bus size={20} className="text-emerald-500" />,
      description: "Allow your app to track the college bus your child is assigned to.",
      warning: null
    },
    {
      id: 'photo_sharing',
      title: 'Photo & Media Consent',
      icon: <Camera size={20} className="text-purple-500" />,
      description: "Allow the college to use photos of your child in newsletters and event galleries.",
      warning: null
    }
  ];

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-600" size={32} /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <ShieldCheck size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Privacy & Consent</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage what information the college can access or send.</p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 p-4 rounded-xl flex items-start gap-3">
        <Info size={20} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Your child's privacy is our priority.</strong> You can grant or revoke consent at any time. Revoking location tracking will immediately stop the college from accessing live GPS data for that student.
        </div>
      </div>

      {consentData.length === 0 ? (
        <div className="bg-white dark:bg-dark-800 p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500">No students linked to your account.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {consentData.map((data) => (
            <div key={data.student._id} className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="bg-slate-50 dark:bg-dark-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-lg text-slate-900 dark:text-white">{data.student.name}</h2>
                  <p className="text-xs font-semibold text-slate-500">Roll No: {data.student.rollNumber}</p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {consentOptions.map((opt) => {
                  const currentStatus = data.consents[opt.id];
                  const isGranted = currentStatus === 'granted';
                  const isUpdating = updating?.studentId === data.student._id && updating?.type === opt.id;

                  return (
                    <div key={opt.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-dark-700 flex items-center justify-center shrink-0">
                          {opt.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-base">{opt.title}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{opt.description}</p>
                          {opt.warning && (
                            <p className="text-xs text-amber-600 dark:text-amber-500 mt-2 flex items-center gap-1 font-medium">
                              <AlertTriangle size={12} /> {opt.warning}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center justify-end">
                        <button
                          onClick={() => handleToggleConsent(data.student._id, opt.id, currentStatus)}
                          disabled={isUpdating}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                            isGranted ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span
                            className={`inline-flex items-center justify-center h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                              isGranted ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          >
                            {isUpdating && <Loader2 size={12} className="animate-spin text-slate-400" />}
                          </span>
                        </button>
                        <span className={`ml-3 text-sm font-bold w-16 ${isGranted ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {isGranted ? 'Granted' : 'Revoked'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParentConsentPage;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  CheckCircle, Clock, LogIn, LogOut,
  RefreshCw, Shield, AlertTriangle, Loader2, User, Calendar, QrCode
} from 'lucide-react';
import { studentCheckInAPI, studentCheckOutAPI, getStudentTodayAPI, markQRAttendanceAPI, verifyQRTokenAPI } from '../../api/attendance.api';
import { toast } from 'react-hot-toast';
import { Scanner } from '@yudiel/react-qr-scanner';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';

// ─── Utilities ────────────────────────────────────
const CountdownTimer = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const update = () => {
      const diff = new Date(expiresAt) - new Date();
      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}:${s < 10 ? '0' : ''}${s}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);
  return <>{timeLeft}</>;
};
const formatTime = (date) => {
  if (!date) return '— : —';
  return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const formatDate = (date = new Date()) =>
  date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const getStatusColor = (status) => {
  if (!status) return 'text-slate-400';
  if (status === 'Present') return 'text-emerald-400';
  if (status === 'Late') return 'text-amber-400';
  return 'text-red-400';
};

// ─── Main Component ──────────────────────────────
const StudentAttendancePage = () => {
  const { user } = useSelector((s) => s.auth);
  const { notifications } = useNotification();

  // Removed location and camera states

  // Attendance state
  const [todayRecord, setTodayRecord] = useState(null);
  const [loadingToday, setLoadingToday] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);

  // QR Scanner state
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [qrVerification, setQrVerification] = useState(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  // ── Fetch today's status ─────────────────────────
  const fetchTodayStatus = useCallback(async () => {
    try {
      setLoadingToday(true);
      const res = await getStudentTodayAPI();
      setTodayRecord(res.data?.data || null);
    } catch (err) {
      console.error('Failed to fetch today status:', err);
    } finally {
      setLoadingToday(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayStatus();
  }, [fetchTodayStatus]);

  // Removed location and camera handlers

  // ── Submit Check-In ──────────────────────────────
  const handleCheckIn = async () => {
    setSubmitting(true);
    try {
      await studentCheckInAPI({});
      toast.success('✅ Check-in successful!');
      await fetchTodayStatus();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Check-in failed.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Submit Check-Out ─────────────────────────────
  const handleCheckOut = async () => {
    setCheckoutSubmitting(true);
    try {
      await studentCheckOutAPI({});
      toast.success('✅ Check-out successful!');
      await fetchTodayStatus();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Check-out failed.';
      toast.error(msg);
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  // ── QR Scanner Handler ───────────────────────────
  const handleQRScan = async (result) => {
    if (!result || !result[0] || !result[0].rawValue || qrVerification) return;
    const token = result[0].rawValue;
    
    setQrVerification({ status: 'verifying', details: null, token });
    try {
      const res = await verifyQRTokenAPI({ token });
      const details = res.data.data;
      setQrVerification({ status: 'success', details, token });
    } catch (err) {
      setQrVerification({ status: 'error', details: err.response?.data?.message || 'Invalid or expired QR', token: null });
    }
  };

  const confirmQRAttendance = async () => {
    if (!qrVerification || qrVerification.status !== 'success') return;
    setSubmitting(true);
    try {
      await markQRAttendanceAPI({ token: qrVerification.token });
      setShowSuccessScreen(true);
      await fetchTodayStatus();
      setTimeout(() => {
        closeQRModal();
      }, 4000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  const closeQRModal = () => {
    setQrScannerOpen(false);
    setQrVerification(null);
    setShowSuccessScreen(false);
  };

  const canCheckIn = !todayRecord?.checkInTime;
  const hasCheckedIn = !!todayRecord?.checkInTime;
  const hasCheckedOut = !!todayRecord?.checkOutTime;

  // Active pushed QRs
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(interval);
  }, []);
  const activeQRs = notifications.filter(n => n.metadata?.type === 'STUDENT_QR_ATTENDANCE' && new Date(n.metadata.expiresAt) > now);

  return (
    <div className="space-y-6 min-h-full pb-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle className="text-brand-500" size={26} />
            Attendance Tracker
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Daily log for attendance check-in.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQrScannerOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-violet-500/30 hover:bg-violet-700 transition"
          >
            <QrCode size={16} /> Scan Lecture QR
          </button>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm dark:border-slate-700 dark:bg-dark-800">
            <Calendar size={16} className="text-brand-500" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formatDate()}</span>
          </div>
        </div>
      </div>

      {/* ── Today Status Bar ── */}
      {loadingToday ? (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-dark-800">
          <Loader2 className="animate-spin text-brand-500" size={20} />
          <span className="text-sm text-slate-500">Fetching your today's attendance…</span>
        </div>
      ) : (
        <div className={`flex flex-wrap items-center gap-6 rounded-xl border px-5 py-4 shadow-sm ${
          hasCheckedIn
            ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/20'
            : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-dark-800'
        }`}>
          <div className="flex items-center gap-2">
            <User size={16} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {user?.email?.split('@')[0] || 'Student'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LogIn size={16} className={hasCheckedIn ? 'text-emerald-500' : 'text-slate-300'} />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Check-In: <strong className="text-slate-900 dark:text-white">{formatTime(todayRecord?.checkInTime)}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LogOut size={16} className={hasCheckedOut ? 'text-blue-500' : 'text-slate-300'} />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Check-Out: <strong className="text-slate-900 dark:text-white">{formatTime(todayRecord?.checkOutTime)}</strong>
            </span>
          </div>
          {hasCheckedIn && (
            <span className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(todayRecord?.status)} bg-white dark:bg-dark-800 border border-current`}>
              <CheckCircle size={12} />
              {todayRecord?.status}
            </span>
          )}
          <button
            onClick={fetchTodayStatus}
            className="ml-auto p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-700 text-slate-400 transition"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      )}

      {/* ── Pushed QR Requests ── */}
      {activeQRs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeQRs.map(qr => (
            <div key={qr._id} className="rounded-xl border border-brand-200 bg-brand-50 p-4 shadow-sm dark:border-brand-900/50 dark:bg-brand-900/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-brand-500/10 rounded-bl-full dark:bg-brand-400/10"></div>
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse"></span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Lecture Attendance</h3>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-brand-700 dark:text-brand-400">
                    {qr.metadata.subjectName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Expires In</p>
                  <p className="text-sm font-bold text-red-500 dark:text-red-400 mt-0.5">
                    <CountdownTimer expiresAt={qr.metadata.expiresAt} />
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleQRScan([{ rawValue: qr.metadata.qrSessionId }])}
                className="mt-4 w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-brand-700 transition flex items-center justify-center gap-2"
              >
                <QrCode size={16} /> Mark My Attendance
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Check-In / Check-Out Panel ── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-dark-800 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-700">
          {/* Check-In */}
          <div className="flex flex-col items-center gap-1 px-6 py-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <LogIn size={14} /> Check In
            </div>
            <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {hasCheckedIn ? formatTime(todayRecord.checkInTime) : '— : —'}
            </p>
            {hasCheckedIn && (
              <span className="text-xs text-emerald-500 font-medium">Recorded ✓</span>
            )}
          </div>
          {/* Check-Out */}
          <div className="flex flex-col items-center gap-1 px-6 py-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <LogOut size={14} /> Check Out
            </div>
            <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {hasCheckedOut ? formatTime(todayRecord.checkOutTime) : '— : —'}
            </p>
            {hasCheckedOut && (
              <span className="text-xs text-blue-500 font-medium">Recorded ✓</span>
            )}
          </div>
        </div>

        {/* Action row */}
        <div className="border-t border-slate-100 dark:border-slate-700 px-6 py-4 bg-slate-50 dark:bg-dark-850 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs">
          </div>

          <div className="flex gap-3">
            {/* Check-Out button */}
            {hasCheckedIn && !hasCheckedOut && (
              <button
                onClick={handleCheckOut}
                disabled={checkoutSubmitting}
                className="flex items-center gap-2 rounded-xl border border-blue-300 bg-blue-50 px-5 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 transition disabled:opacity-50"
              >
                {checkoutSubmitting ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
                Check Out
              </button>
            )}

            {/* Submit / Check-In button */}
            {!hasCheckedIn ? (
              <button
                onClick={handleCheckIn}
                disabled={!canCheckIn || submitting}
                className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition shadow-lg ${
                  canCheckIn && !submitting
                    ? 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/30'
                    : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none'
                }`}
              >
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                {submitting ? 'Submitting…' : 'Submit Attendance'}
              </button>
            ) : hasCheckedOut ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-300 dark:border-emerald-700 px-6 py-2.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle size={15} />
                Attendance Complete
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Attendance Policy Notice ── */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-950/20 px-5 py-4 flex items-start gap-3">
        <Shield size={18} className="mt-0.5 text-amber-500 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Attendance Policy</p>
          <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
            Attendance can only be marked once per day. Contact your coordinator if you face any issues.
          </p>
        </div>
      </div>

      {/* ── QR Scanner Modal ── */}
      <Modal isOpen={qrScannerOpen} onClose={closeQRModal} title="Scan Lecture QR Code">
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          {showSuccessScreen ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="rounded-full bg-emerald-100 p-4 dark:bg-emerald-900/30">
                <CheckCircle size={64} className="text-emerald-500 animate-bounce" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">🎉 Success!</h3>
              <p className="text-slate-500 dark:text-slate-400">Your attendance has been marked.</p>
            </div>
          ) : qrVerification?.status ? (
            <div className="w-full max-w-sm space-y-6">
              {qrVerification.status === 'verifying' ? (
                 <div className="flex flex-col items-center py-8 space-y-4">
                   <Loader2 size={40} className="animate-spin text-brand-500" />
                   <p className="font-medium text-slate-700 dark:text-slate-300">Verifying session...</p>
                 </div>
              ) : qrVerification.status === 'error' ? (
                 <div className="flex flex-col items-center py-8 space-y-4 text-center">
                   <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                     <AlertTriangle size={32} className="text-red-500" />
                   </div>
                   <p className="font-semibold text-red-600 dark:text-red-400">{qrVerification.details}</p>
                   <button onClick={() => setQrVerification(null)} className="mt-4 text-sm text-brand-600 hover:underline">Scan Again</button>
                 </div>
              ) : (
                <div className="bg-slate-50 dark:bg-dark-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-100 border-b dark:border-slate-700 pb-2">Verification Steps</h4>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-3">
                      <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Valid Session ({qrVerification.details?.subjectName})</span>
                    </li>
 
                    <li className="flex items-center gap-3">
                      <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">No Duplicate Entry</span>
                    </li>
                  </ul>
                  <button
                    onClick={confirmQRAttendance}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                    {submitting ? 'Confirming...' : 'Confirm Attendance'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-center text-slate-500 dark:text-slate-400">
                Point your camera at the QR code displayed by your faculty.
              </p>
              <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-black border-2 border-brand-500 shadow-lg shadow-brand-500/20">
                <Scanner
                  onScan={handleQRScan}
                  onError={(err) => console.log('QR Scanner Error:', err)}
                  components={{ audio: false, finder: false }}
                />
                <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                  <div className="animate-sweep" />
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default StudentAttendancePage;

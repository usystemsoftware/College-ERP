import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  MapPin, Camera, CheckCircle, Clock, LogIn, LogOut,
  RefreshCw, Shield, AlertTriangle, Loader2, User, Calendar, Wifi, QrCode
} from 'lucide-react';
import { studentCheckInAPI, studentCheckOutAPI, getStudentTodayAPI, markQRAttendanceAPI } from '../../api/attendance.api';
import { toast } from 'react-hot-toast';
import { Scanner } from '@yudiel/react-qr-scanner';
import Modal from '../../components/common/Modal';

// ─── Utilities ────────────────────────────────────
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

  // Location state
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle | loading | success | error
  const [locationError, setLocationError] = useState('');

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Attendance state
  const [todayRecord, setTodayRecord] = useState(null);
  const [loadingToday, setLoadingToday] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);

  // QR Scanner state
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [scanning, setScanning] = useState(false);

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

  // ── Geolocation ──────────────────────────────────
  const requestLocation = () => {
    setLocationStatus('loading');
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setLocationStatus('error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setLocation({ latitude, longitude, accuracy });
        setLocationStatus('success');
        toast.success('📍 Location captured successfully!');
      },
      (err) => {
        setLocationError(err.message || 'Failed to get location.');
        setLocationStatus('error');
        toast.error('Location access denied. Please allow location.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    requestLocation();
    return () => stopCamera();
  }, []);

  // ── Camera ───────────────────────────────────────
  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      setCapturedPhoto(null);
    } catch (err) {
      setCameraError('Camera access denied. Please allow camera access in your browser settings.');
      toast.error('Camera access denied.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg', 0.6);
    setCapturedPhoto(base64);
    stopCamera();
    toast.success('📸 Photo captured!');
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  // ── Submit Check-In ──────────────────────────────
  const handleCheckIn = async () => {
    if (!location) return toast.error('Please allow location first.');
    if (!capturedPhoto) return toast.error('Please capture your photo first.');
    setSubmitting(true);
    try {
      await studentCheckInAPI({ location, selfieBase64: capturedPhoto });
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
    if (!result || !result[0] || !result[0].rawValue) return;
    const token = result[0].rawValue;
    setScanning(true);
    try {
      await markQRAttendanceAPI({ token });
      toast.success('✅ Lecture attendance marked via QR!');
      setQrScannerOpen(false);
      await fetchTodayStatus(); // Optionally refresh today's status or another specific lecture list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify QR Code.');
    } finally {
      setScanning(false);
    }
  };

  const canCheckIn = location && capturedPhoto && !todayRecord?.checkInTime;
  const hasCheckedIn = !!todayRecord?.checkInTime;
  const hasCheckedOut = !!todayRecord?.checkOutTime;

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
            Daily log with Location &amp; Photo verification.
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

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* ─ Location Panel ─ */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-dark-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <MapPin size={16} className="text-rose-500" />
              LOCATION MAP
            </div>
            {locationStatus === 'success' && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                <Shield size={11} /> Verified
              </span>
            )}
          </div>

          {/* Map visual */}
          <div className="relative h-52 w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-dark-700 dark:to-dark-900 flex items-center justify-center overflow-hidden">
            {locationStatus === 'success' && location ? (
              <>
                {/* Grid lines (decorative map look) */}
                <div className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                  }}
                />
                {/* Pulsing pin */}
                <div className="relative flex flex-col items-center">
                  <div className="absolute -inset-6 rounded-full bg-rose-500/20 animate-ping" />
                  <div className="absolute -inset-3 rounded-full bg-rose-500/30" />
                  <MapPin size={40} className="relative text-rose-500 drop-shadow-lg" />
                </div>
                {/* Coords overlay */}
                <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 dark:bg-dark-800/90 backdrop-blur px-3 py-2 text-xs font-mono text-slate-700 dark:text-slate-200 shadow">
                  <div>Lat: {location.latitude?.toFixed(5)}</div>
                  <div>Lng: {location.longitude?.toFixed(5)}</div>
                  {location.accuracy && (
                    <div className="text-slate-400">±{Math.round(location.accuracy)}m</div>
                  )}
                </div>
              </>
            ) : locationStatus === 'loading' ? (
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <Loader2 className="animate-spin text-brand-500" size={32} />
                <span className="text-sm">Acquiring GPS location…</span>
              </div>
            ) : locationStatus === 'error' ? (
              <div className="flex flex-col items-center gap-3 text-red-500 px-8 text-center">
                <AlertTriangle size={32} />
                <p className="text-sm">{locationError}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <MapPin size={32} />
                <span className="text-sm">Location not acquired</span>
              </div>
            )}
          </div>

          {/* Status row */}
          <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-dark-850">
            <div className="flex items-center gap-2 text-sm">
              <Wifi size={14} className={locationStatus === 'success' ? 'text-emerald-500' : 'text-slate-300'} />
              <span className={`font-medium ${
                locationStatus === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
                locationStatus === 'error' ? 'text-red-500' :
                locationStatus === 'loading' ? 'text-amber-500 animate-pulse' :
                'text-slate-400'
              }`}>
                {locationStatus === 'success' ? 'GPS Locked ✓' :
                 locationStatus === 'loading' ? 'Locating…' :
                 locationStatus === 'error' ? 'Location failed' :
                 'Not started'}
              </span>
            </div>
            <button
              onClick={requestLocation}
              disabled={locationStatus === 'loading'}
              className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50 transition shadow-sm shadow-brand-500/30"
            >
              <RefreshCw size={12} />
              Refresh
            </button>
          </div>
        </div>

        {/* ─ Camera Panel ─ */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-dark-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <Camera size={16} className="text-violet-500" />
              CAMERA CAPTURE
            </div>
            {capturedPhoto && (
              <span className="flex items-center gap-1 text-xs font-bold text-violet-600 bg-violet-50 dark:bg-violet-900/30 dark:text-violet-400 px-2.5 py-1 rounded-full">
                <CheckCircle size={11} /> Photo Ready
              </span>
            )}
          </div>

          {/* Video / Photo area */}
          <div className="relative h-52 w-full bg-black flex items-center justify-center overflow-hidden">
            {capturedPhoto ? (
              <img src={capturedPhoto} alt="Captured" className="h-full w-full object-cover" />
            ) : cameraActive ? (
              <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <Camera size={40} className="text-slate-600" />
                <span className="text-sm text-slate-500">Camera not started</span>
                {cameraError && (
                  <p className="text-xs text-red-400 text-center px-4">{cameraError}</p>
                )}
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Camera controls */}
          <div className="px-5 py-3 bg-slate-50 dark:bg-dark-850">
            {capturedPhoto ? (
              <div className="flex gap-3">
                <button
                  onClick={retakePhoto}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-dark-800 dark:text-slate-300 transition"
                >
                  Retake
                </button>
                <div className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-200 dark:border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle size={14} /> Photo Saved
                </div>
              </div>
            ) : cameraActive ? (
              <button
                onClick={capturePhoto}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition shadow-md shadow-violet-500/30"
              >
                <Camera size={16} />
                Capture Photo
              </button>
            ) : (
              <button
                onClick={startCamera}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition shadow-md shadow-violet-500/30"
              >
                <Camera size={16} />
                Start Camera
              </button>
            )}
          </div>
        </div>
      </div>

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
          {/* Readiness indicators */}
          <div className="flex items-center gap-4 text-xs">
            <span className={`flex items-center gap-1 font-medium ${location ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
              <MapPin size={12} /> {location ? 'Location ✓' : 'No Location'}
            </span>
            <span className={`flex items-center gap-1 font-medium ${capturedPhoto ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'}`}>
              <Camera size={12} /> {capturedPhoto ? 'Photo ✓' : 'No Photo'}
            </span>
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
            Your GPS location and photo are required for verification. Both must be captured before submitting attendance.
            Attendance can only be marked once per day. Contact your coordinator if you face any issues.
          </p>
        </div>
      </div>

      {/* ── QR Scanner Modal ── */}
      <Modal isOpen={qrScannerOpen} onClose={() => setQrScannerOpen(false)} title="Scan Lecture QR Code">
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <p className="text-sm text-center text-slate-500 dark:text-slate-400">
            Point your camera at the QR code displayed by your faculty to instantly mark your attendance for this lecture.
          </p>
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-black border border-slate-200 dark:border-slate-700">
            {qrScannerOpen && !scanning && (
              <Scanner
                onScan={handleQRScan}
                onError={(err) => console.log('QR Scanner Error:', err)}
              />
            )}
            {scanning && (
              <div className="h-64 flex flex-col items-center justify-center text-white space-y-3">
                <Loader2 className="animate-spin" size={32} />
                <p>Verifying Attendance...</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentAttendancePage;

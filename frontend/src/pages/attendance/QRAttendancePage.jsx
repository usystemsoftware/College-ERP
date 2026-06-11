import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  QrCode, Clock, Users, CheckCircle, Loader2, Send, RefreshCw,
  Smartphone, Wifi, Shield, Zap, ScanLine, AlertTriangle, X
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  generateQRAPI, verifyQRTokenAPI, markQRAttendanceAPI, sendQRToStudentsAPI
} from '../../api/attendance.api';
import { getSubjects } from '../../api/academic.api';
import { getFacultyAPI } from '../../api/faculty.api';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';

// ─── Countdown Hook ────────────────────────────────
function useCountdown(seconds, active) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  useEffect(() => {
    if (!active || seconds <= 0) { setTimeLeft(seconds); return; }
    setTimeLeft(seconds);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds, active]);
  return timeLeft;
}

// ─── CountdownTimer component for pushed QRs ──────
const CountdownTimer = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const update = () => {
      const diff = new Date(expiresAt) - new Date();
      if (diff <= 0) { setTimeLeft('Expired'); return; }
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

const formatMM_SS = (s) =>
  `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

// ═══════════════════════════════════════════════════
// FACULTY QR GENERATOR
// ═══════════════════════════════════════════════════
const FacultyQRGenerator = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [lectureType, setLectureType] = useState('Theory');
  const [generating, setGenerating] = useState(false);

  // Active QR session
  const [qrToken, setQrToken] = useState('');
  const [sessionActive, setSessionActive] = useState(false);
  const [expiresIn, setExpiresIn] = useState(0);
  const [isLate, setIsLate] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  // Push to class modal
  const [pushModalOpen, setPushModalOpen] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFacultyIds, setSelectedFacultyIds] = useState([]);
  const [sendingPush, setSendingPush] = useState(false);

  // Fullscreen display
  const [fullscreen, setFullscreen] = useState(false);

  const timeLeft = useCountdown(expiresIn, sessionActive);

  useEffect(() => {
    async function load() {
      try {
        const res = await getSubjects();
        const list = res.data?.data || [];
        setSubjects(list);
        if (list.length > 0) setSelectedSubject(list[0]._id);
      } catch (err) { console.error('Error loading subjects:', err); }
    }
    load();
  }, []);

  useEffect(() => {
    if (sessionActive && timeLeft <= 0 && !isLate) {
      // Auto-generate late QR
      handleGenerate(true);
    } else if (sessionActive && timeLeft <= 0 && isLate) {
      setSessionActive(false);
      toast.error('Late check-in window expired');
    }
  }, [timeLeft, sessionActive, isLate]);

  async function handleGenerate(lateMode = false) {
    if (!selectedSubject) { toast.error('Please select a subject'); return; }
    setGenerating(true);
    try {
      const res = await generateQRAPI({
        subject: selectedSubject,
        date: selectedDate,
        lectureType,
        isLate: lateMode === true,
      });
      const token = res.data.data.token;
      setQrToken(token);
      setExpiresIn(res.data.data.expiresIn || 600);
      setIsLate(lateMode === true);
      setSessionActive(true);
      setScanCount(0);
      toast.success(lateMode ? '⏰ Late check-in window active' : '✅ QR session started!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate QR');
    } finally {
      setGenerating(false);
    }
  }

  async function handlePushToStudents() {
    if (selectedFacultyIds.length === 0) { toast.error('Select at least one faculty'); return; }
    setSendingPush(true);
    try {
      const res = await sendQRToStudentsAPI({
        qrSessionId: qrToken,
        subjectId: selectedSubject,
        facultyIds: selectedFacultyIds,
      });
      toast.success(`✅ Pushed to ${res.data.data.sentTo} students`);
      setPushModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to push QR');
    } finally {
      setSendingPush(false);
    }
  }

  useEffect(() => {
    async function loadFaculty() {
      try {
        const res = await getFacultyAPI({ limit: 500 });
        setFacultyList(res.data?.data?.faculty || []);
      } catch (err) { console.error('Error loading faculty:', err); }
    }
    loadFaculty();
  }, []);

  const subjectName = subjects.find(s => s._id === selectedSubject)?.name || 'Lecture';
  const subjectCode = subjects.find(s => s._id === selectedSubject)?.code || '';

  // Fullscreen overlay
  if (fullscreen && sessionActive) {
    return (
      <div className="fixed inset-0 z-[99999] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-6">
        <button onClick={() => setFullscreen(false)} className="absolute top-6 right-6 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition">
          <X size={24} />
        </button>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white mb-2">{subjectName}</h2>
          <p className="text-slate-400">{selectedDate} · {lectureType} · {isLate ? 'Late Window' : 'Active Session'}</p>
        </div>
        <div className={`p-6 rounded-3xl shadow-2xl ${isLate ? 'bg-amber-50 ring-4 ring-amber-400/30' : 'bg-white ring-4 ring-brand-500/20'}`}>
          <QRCodeSVG
            value={qrToken}
            size={320}
            level="H"
            includeMargin
            fgColor={isLate ? '#d97706' : '#1e293b'}
          />
        </div>
        <div className="mt-8 flex items-center gap-6">
          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Expires In</p>
            <p className={`text-4xl font-black tabular-nums ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {formatMM_SS(timeLeft)}
            </p>
          </div>
        </div>
        <p className="mt-8 text-slate-500 text-sm">Ask students to scan this QR code with their phone camera</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Setup Panel */}
      {!sessionActive && (
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
                <QrCode size={22} className="text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Generate QR Session</h3>
                <p className="text-xs text-slate-500">Create a QR code for students to scan and mark their attendance</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none dark:border-slate-700 dark:bg-dark-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                >
                  {subjects.length > 0 ? subjects.map(s => (
                    <option key={s._id} value={s._id}>{s.name} {s.code ? `(${s.code})` : ''}</option>
                  )) : <option value="">No Subjects</option>}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none dark:border-slate-700 dark:bg-dark-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Lecture Type</label>
                <select
                  value={lectureType}
                  onChange={(e) => setLectureType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none dark:border-slate-700 dark:bg-dark-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Theory">Theory</option>
                  <option value="Practical">Practical</option>
                  <option value="Tutorial">Tutorial</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => handleGenerate(false)}
              disabled={generating || !selectedSubject}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} />}
              {generating ? 'Generating...' : 'Start QR Session'}
            </button>
          </div>

          {/* How it works */}
          <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-dark-850 px-6 py-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">HOW IT WORKS</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: QrCode, title: 'Generate', desc: 'Create a unique QR for your lecture' },
                { icon: Smartphone, title: 'Display', desc: 'Students scan with their phone camera' },
                { icon: CheckCircle, title: 'Mark', desc: 'Attendance is recorded lecture-wise' },
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
                    <step.icon size={16} className="text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{step.title}</p>
                    <p className="text-xs text-slate-400">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Session */}
      {sessionActive && (
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* Session Header */}
          <div className={`px-6 py-4 flex items-center justify-between ${isLate ? 'bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800/30' : 'bg-brand-50 dark:bg-brand-900/20 border-b border-brand-100 dark:border-brand-800/30'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full animate-pulse ${isLate ? 'bg-amber-500' : 'bg-brand-500'}`} />
              <div>
                <h3 className={`font-bold text-sm ${isLate ? 'text-amber-800 dark:text-amber-300' : 'text-brand-800 dark:text-brand-300'}`}>
                  {isLate ? '⏰ Late Check-in Window' : '🟢 QR Session Active'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {subjectName} {subjectCode ? `(${subjectCode})` : ''} · {lectureType} · {selectedDate}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Expires</p>
                <p className={`text-xl font-black tabular-nums ${timeLeft < 60 ? 'text-red-500 animate-pulse' : isLate ? 'text-amber-600' : 'text-brand-600'}`}>
                  {formatMM_SS(timeLeft)}
                </p>
              </div>
            </div>
          </div>

          {/* QR Display & Actions */}
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* QR Code */}
              <div className="flex flex-col items-center gap-4">
                <div
                  className={`p-5 rounded-2xl cursor-pointer transition-all hover:shadow-xl ${isLate ? 'bg-amber-50 ring-2 ring-amber-200 dark:bg-amber-900/10 dark:ring-amber-700/30' : 'bg-white ring-2 ring-brand-100 dark:bg-dark-900 dark:ring-brand-800/30'}`}
                  onClick={() => setFullscreen(true)}
                  title="Click for fullscreen"
                >
                  <QRCodeSVG
                    value={qrToken}
                    size={220}
                    level="H"
                    includeMargin
                    fgColor={isLate ? '#d97706' : '#1e293b'}
                  />
                </div>
                <button
                  onClick={() => setFullscreen(true)}
                  className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                >
                  🔍 Click QR for fullscreen
                </button>
              </div>

              {/* Actions */}
              <div className="flex-1 space-y-4 w-full">
                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setPushModalOpen(true)}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-brand-200 dark:border-brand-700 text-brand-700 dark:text-brand-400 font-semibold hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                  >
                    <Send size={16} /> Push to Students
                  </button>
                  <button
                    onClick={() => { setSessionActive(false); setQrToken(''); toast.success('Session ended'); }}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <X size={16} /> End Session
                  </button>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 dark:bg-dark-900 p-4 border border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-400 mb-1">Session Type</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{isLate ? 'Late Window' : 'Standard'}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-dark-900 p-4 border border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-400 mb-1">Lecture Type</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{lectureType}</p>
                  </div>
                </div>

                {/* Security notice */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30">
                  <Shield size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    QR tokens are cryptographically signed and expire automatically. Each student can only mark once per session.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Push to Students Modal */}
      <Modal isOpen={pushModalOpen} onClose={() => setPushModalOpen(false)} title="Push QR to Students">
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select faculty members whose students should receive this QR via push notification.
          </p>
          <div className="max-h-[300px] overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
            {facultyList.length === 0 ? (
              <p className="p-4 text-sm text-slate-400 text-center">No faculty found</p>
            ) : facultyList.map(f => (
              <label key={f._id} className="flex items-center p-3 hover:bg-slate-50 dark:hover:bg-dark-750/50 cursor-pointer transition-colors gap-3">
                <input
                  type="checkbox"
                  checked={selectedFacultyIds.includes(f._id)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedFacultyIds(prev => [...prev, f._id]);
                    else setSelectedFacultyIds(prev => prev.filter(id => id !== f._id));
                  }}
                  className="rounded text-brand-500 focus:ring-brand-500"
                />
                <div className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs shrink-0">
                  {(f.fullName || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{f.fullName || 'Unknown'}</p>
                  <p className="text-xs text-slate-400">{f.department?.name || 'General'}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-brand-600 font-medium">{selectedFacultyIds.length} selected</span>
            <button
              onClick={handlePushToStudents}
              disabled={sendingPush || selectedFacultyIds.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {sendingPush ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Push Now
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════════
// STUDENT QR SCANNER
// ═══════════════════════════════════════════════════
const StudentQRScanner = () => {
  const { notifications } = useNotification();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [verification, setVerification] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successScreen, setSuccessScreen] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);

  // Active pushed QRs
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 5000);
    return () => clearInterval(interval);
  }, []);
  const activeQRs = notifications.filter(
    n => n.metadata?.type === 'STUDENT_QR_ATTENDANCE' && new Date(n.metadata.expiresAt) > now
  );

  const handleScan = async (result) => {
    if (!result || !result[0] || !result[0].rawValue || verification) return;
    const token = result[0].rawValue;
    setVerification({ status: 'verifying', token });
    try {
      const res = await verifyQRTokenAPI({ token });
      setVerification({ status: 'verified', details: res.data.data, token });
    } catch (err) {
      setVerification({ status: 'error', message: err.response?.data?.message || 'Invalid or expired QR', token: null });
    }
  };

  const handlePushedQR = (qrSessionId) => {
    handleScan([{ rawValue: qrSessionId }]);
    setScannerOpen(true);
  };

  async function confirmAttendance() {
    if (!verification || verification.status !== 'verified') return;
    setSubmitting(true);
    try {
      await markQRAttendanceAPI({ token: verification.token });
      setSuccessScreen(true);
      setScanHistory(prev => [{
        subject: verification.details?.subjectName,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      }, ...prev]);
      setTimeout(() => closeModal(), 4000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  }

  const closeModal = () => {
    setScannerOpen(false);
    setVerification(null);
    setSuccessScreen(false);
  };

  return (
    <div className="space-y-6">
      {/* Scan Button */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <ScanLine size={36} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Scan Lecture QR</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Point your camera at the QR code displayed by your teacher to mark your attendance
            </p>
          </div>
          <button
            onClick={() => setScannerOpen(true)}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
          >
            <QrCode size={20} /> Open Scanner
          </button>
        </div>
      </div>

      {/* Pushed QR Requests */}
      {activeQRs.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <Wifi size={14} className="text-brand-500 animate-pulse" />
            Active Lecture QRs Pushed to You
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {activeQRs.map(qr => (
              <div key={qr._id} className="rounded-xl border border-brand-200 bg-brand-50 dark:border-brand-900/50 dark:bg-brand-900/20 p-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-brand-500/10 rounded-bl-full" />
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Lecture Attendance</h4>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-brand-700 dark:text-brand-400">{qr.metadata.subjectName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Expires</p>
                    <p className="text-sm font-bold text-red-500 mt-0.5">
                      <CountdownTimer expiresAt={qr.metadata.expiresAt} />
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePushedQR(qr.metadata.qrSessionId)}
                  className="mt-3 w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-brand-700 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} /> Mark My Attendance
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Scan History */}
      {scanHistory.length > 0 && (
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
          <h3 className="font-bold text-slate-800 dark:text-white mb-3 text-sm">Today's Scans</h3>
          <div className="space-y-2">
            {scanHistory.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-500" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{entry.subject}</span>
                </div>
                <span className="text-xs text-slate-400">{entry.time} · {entry.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scanner Modal */}
      <Modal isOpen={scannerOpen} onClose={closeModal} title="QR Attendance Scanner">
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          {successScreen ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-5">
                <CheckCircle size={64} className="text-emerald-500" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">🎉 Attendance Marked!</h3>
              <p className="text-slate-500 dark:text-slate-400">
                {verification?.details?.subjectName} — {verification?.details?.lectureType}
              </p>
            </div>
          ) : verification?.status ? (
            <div className="w-full max-w-sm space-y-6">
              {verification.status === 'verifying' ? (
                <div className="flex flex-col items-center py-8 space-y-4">
                  <Loader2 size={40} className="animate-spin text-brand-500" />
                  <p className="font-medium text-slate-700 dark:text-slate-300">Verifying QR session...</p>
                </div>
              ) : verification.status === 'error' ? (
                <div className="flex flex-col items-center py-8 space-y-4 text-center">
                  <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-4">
                    <AlertTriangle size={32} className="text-red-500" />
                  </div>
                  <p className="font-semibold text-red-600 dark:text-red-400">{verification.message}</p>
                  <button onClick={() => setVerification(null)} className="text-sm text-brand-600 hover:underline font-semibold">
                    Try Scanning Again
                  </button>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-dark-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
                  <h4 className="font-bold text-lg text-slate-800 dark:text-white">✅ QR Verified</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-dark-800 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Subject</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{verification.details?.subjectName}</p>
                    </div>
                    <div className="bg-white dark:bg-dark-800 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Type</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{verification.details?.lectureType}</p>
                    </div>
                  </div>
                  <button
                    onClick={confirmAttendance}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-3.5 font-bold text-white transition hover:shadow-lg disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                    {submitting ? 'Confirming...' : 'Confirm & Mark Attendance'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-center text-slate-500 dark:text-slate-400">
                Point your camera at the QR code displayed by your teacher
              </p>
              <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-black border-2 border-violet-500 shadow-lg shadow-violet-500/20">
                <Scanner
                  onScan={handleScan}
                  onError={(err) => console.log('Scanner error:', err)}
                  components={{ audio: false, finder: false }}
                />
                <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                  <div className="animate-sweep" />
                </div>
              </div>
              <p className="text-xs text-slate-400">Make sure the QR code is well-lit and fully visible</p>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════════
// MAIN PAGE — Renders based on user role
// ═══════════════════════════════════════════════════
const QRAttendancePage = () => {
  const { user } = useSelector(state => state.auth);
  const roleName = typeof user?.role === 'object' ? user?.role?.name : user?.role;
  const isStudent = roleName === 'Student';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="text-center space-y-2 mb-2">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <QrCode size={28} className="text-white" />
        </div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-indigo-400">
          QR Attendance
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {isStudent ? 'Scan QR codes to mark your lecture attendance instantly' : 'Generate QR codes for lecture-wise student attendance'}
        </p>
      </div>

      {isStudent ? <StudentQRScanner /> : <FacultyQRGenerator />}
    </div>
  );
};

export default QRAttendancePage;

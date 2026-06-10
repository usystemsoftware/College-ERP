import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getSocket } from '../../services/socket';
import api from '../../api/axios';

const CAMPUS_LAT = parseFloat(import.meta.env.VITE_CAMPUS_LAT || '18.5975');
const CAMPUS_LNG = parseFloat(import.meta.env.VITE_CAMPUS_LNG || '73.7898');
const CAMPUS_RADIUS = parseInt(import.meta.env.VITE_CAMPUS_RADIUS_METERS || '300', 10);
const CAMPUS_NAME = import.meta.env.VITE_CAMPUS_NAME || 'Campus';

const getCollegeId = (user) => {
  if (!user?.collegeId) return null;
  return typeof user.collegeId === 'object' ? user.collegeId._id : user.collegeId;
};

const normalizeStudentId = (id) => (id == null ? '' : String(id));

// Helper to calculate distance in meters between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  const R = 6371e3; // Earth radius in meters
  const toRad = (val) => (val * Math.PI) / 180;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const CampusLiveWidget = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  const { user } = useSelector(state => state.auth);

  const mapRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (!document.querySelector('link[href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setMapReady(true);
      document.body.appendChild(script);
    } else {
      setMapReady(true);
    }

    async function fetchLiveStudents() {
      try {
        const res = await api.get('/attendance/campus-live');
        if (res.data.success) {
          // The backend returns an array of Attendance records in res.data.data
          const rawRecords = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.students || []);
          const formatted = rawRecords.map(r => {
            const studentId = normalizeStudentId(r.student?._id);
            const lat = r.location?.lat || r.lat;
            const lng = r.location?.lng || r.lng;
            const dist = calculateDistance(lat, lng, CAMPUS_LAT, CAMPUS_LNG);
            return {
              studentId,
              studentName: r.student?.personalDetails?.fullName || r.studentName,
              rollNumber: r.student?.rollNumber || r.rollNumber,
              location: { lat, lng },
              checkInTime: r.checkInTime,
              onCampus: dist <= CAMPUS_RADIUS
            };
          });
          setStudents(formatted);
        } else {
          setError(res.data.message || 'Failed to fetch live data');
        }
      } catch (err) {
        setError('Error fetching live data');
      } finally {
        setLoading(false);
      }
    };

    fetchLiveStudents();

    const collegeId = getCollegeId(user);
    if (!collegeId) return;

    const handleCheckin = (payload) => {
      // payload might come as { student: { id, name, rollNumber }, location: { lat, lng } } 
      // or { studentId, studentName, lat, lng }
      const studentId = normalizeStudentId(payload.studentId || payload.student?.id);
      const studentName = payload.studentName || payload.student?.name;
      const rollNumber = payload.rollNumber || payload.student?.rollNumber;
      const lat = payload.location?.lat || payload.lat;
      const lng = payload.location?.lng || payload.lng;
      const dist = calculateDistance(lat, lng, CAMPUS_LAT, CAMPUS_LNG);

      setStudents((prev) => {
        const exists = prev.find((s) => normalizeStudentId(s.studentId) === studentId);
        const entry = {
          ...payload,
          studentId,
          studentName,
          rollNumber,
          location: { lat, lng },
          onCampus: dist <= CAMPUS_RADIUS
        };
        if (exists) {
          return prev.map((s) =>
            normalizeStudentId(s.studentId) === studentId ? { ...s, ...entry } : s
          );
        }
        return [entry, ...prev];
      });
    };

    const handleCheckout = (payload) => {
      const studentId = normalizeStudentId(payload.studentId || payload.student?.id);
      setStudents((prev) => prev.filter((s) => normalizeStudentId(s.studentId) !== studentId));
      if (markersRef.current[studentId]) {
        markersRef.current[studentId].remove();
        delete markersRef.current[studentId];
      }
    };

    let cleanupSocket = () => { };
    let retryTimer;

    const bindSocket = () => {
      const socket = getSocket();
      if (!socket) return false;

      const joinCampusRoom = () => socket.emit('join_room', `campus:${collegeId}`);
      joinCampusRoom();
      socket.on('connect', joinCampusRoom);

      // Listen to both event name formats to ensure compatibility
      socket.on('student:checkin', handleCheckin);
      socket.on('student_checkin', handleCheckin);
      socket.on('student:checkout', handleCheckout);
      socket.on('student_checkout', handleCheckout);

      cleanupSocket = () => {
        socket.off('connect', joinCampusRoom);
        socket.off('student:checkin', handleCheckin);
        socket.off('student_checkin', handleCheckin);
        socket.off('student:checkout', handleCheckout);
        socket.off('student_checkout', handleCheckout);
      };
      return true;
    };

    if (!bindSocket()) {
      retryTimer = setInterval(() => {
        if (bindSocket()) clearInterval(retryTimer);
      }, 500);
    }

    return () => {
      if (retryTimer) clearInterval(retryTimer);
      cleanupSocket();
    };
  }, [user?._id, getCollegeId(user)]);

  useEffect(() => {
    if (mapReady && !mapRef.current && document.getElementById('campus-map')) {
      const L = window.L;
      mapRef.current = L.map('campus-map').setView([CAMPUS_LAT, CAMPUS_LNG], 17);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);

      L.circle([CAMPUS_LAT, CAMPUS_LNG], {
        color: '#185FA5',
        fillColor: '#E6F1FB',
        fillOpacity: 0.2,
        weight: 1.5,
        radius: CAMPUS_RADIUS
      }).addTo(mapRef.current);
    }
  }, [mapReady]);

  useEffect(() => {
    if (mapReady && mapRef.current) {
      const L = window.L;
      console.log('Students array:', students);

      students.forEach(student => {
        if (student.location && student.location.lat && student.location.lng) {
          const studentId = normalizeStudentId(student.studentId);
          const lat = student.location.lat;
          const lng = student.location.lng;

          let checkInTimeStr = student.checkInTime;
          try {
            if (checkInTimeStr) {
              const d = new Date(checkInTimeStr);
              checkInTimeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
          } catch (e) { }

          const popupContent = `<b>${student.studentName || 'Unknown'}</b><br/>${student.rollNumber || 'N/A'}<br/>${student.onCampus ? 'On Campus' : 'Outside'}<br/>Checked in: ${checkInTimeStr || 'Unknown'}`;

          const isOutside = !student.onCampus;
          const iconHtml = `<div style="background-color: ${isOutside ? '#ef4444' : '#10b981'}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`;
          const customIcon = L.divIcon({ html: iconHtml, className: '', iconSize: [18, 18], iconAnchor: [9, 9] });

          if (markersRef.current[studentId]) {
            markersRef.current[studentId].setLatLng([lat, lng]);
            markersRef.current[studentId].setPopupContent(popupContent);
            markersRef.current[studentId].setIcon(customIcon);
          } else {
            const marker = L.marker([lat, lng], { icon: customIcon }).addTo(mapRef.current);
            marker.bindPopup(popupContent);
            markersRef.current[studentId] = marker;
          }
        }
      });

      const currentIds = students.map((s) => normalizeStudentId(s.studentId));
      Object.keys(markersRef.current).forEach(id => {
        if (!currentIds.includes(id)) {
          markersRef.current[id].remove();
          delete markersRef.current[id];
        }
      });

      // Adjust map bounds to show all markers plus campus
      const validStudents = students.filter(s => s.location && s.location.lat && s.location.lng);
      if (validStudents.length > 0) {
        const bounds = L.latLngBounds(validStudents.map(s => [s.location.lat, s.location.lng]));
        bounds.extend([CAMPUS_LAT, CAMPUS_LNG]); // Ensure campus is always in view
        mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
      } else {
        mapRef.current.setView([CAMPUS_LAT, CAMPUS_LNG], 17);
      }
    }
  }, [students, mapReady]);

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const d = new Date(timeStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeStr;
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
        <div>
          <h2 className="text-base font-medium text-gray-900">Live campus presence</h2>
          <p className="text-xs text-gray-500 mt-1">{CAMPUS_NAME}</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
            {students.filter(s => s.onCampus).length} on campus
          </div>
          <div className="bg-red-50 text-red-700 text-xs font-medium px-3 py-1 rounded-full">
            {students.filter(s => !s.onCampus).length} outside
          </div>
        </div>
      </div>

      <div id="campus-map" style={{ height: '400px', width: '100%' }} className="bg-gray-100 z-0 relative">
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm text-gray-400">Loading map...</span>
          </div>
        )}
      </div>

      <div className="max-h-[200px] overflow-y-auto">
        {loading && (
          <div className="py-8 text-center">
            <span className="text-sm text-gray-400">Loading...</span>
          </div>
        )}

        {error && (
          <div className="py-8 text-center">
            <span className="text-sm text-red-500">{error}</span>
          </div>
        )}

        {!loading && !error && students.length === 0 && (
          <div className="py-8 text-center">
            <span className="text-sm text-gray-400">No students on campus right now</span>
          </div>
        )}

        {!loading && !error && students.map((student) => (
          <div key={student.studentId} className="flex gap-3 px-5 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors items-center">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${student.onCampus ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div className="text-sm font-medium text-gray-800">
              {student.studentName || 'Unknown'}
              {!student.onCampus && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Outside</span>}
            </div>
            <div className="text-xs text-gray-500 ml-auto">{student.rollNumber || 'N/A'}</div>
            <div className="text-xs text-gray-400">{formatTime(student.checkInTime)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampusLiveWidget;

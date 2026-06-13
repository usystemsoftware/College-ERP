import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { MapPin, Navigation, Map as MapIcon, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getSocket } from '../../services/socket';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CAMPUS_LAT = parseFloat(import.meta.env.VITE_CAMPUS_LAT || '18.5975');
const CAMPUS_LNG = parseFloat(import.meta.env.VITE_CAMPUS_LNG || '73.7898');
const CAMPUS_RADIUS = parseInt(import.meta.env.VITE_CAMPUS_RADIUS_METERS || '300', 10);

const ParentTrackingPage = () => {
  const { user } = useSelector(state => state.auth);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [consentError, setConsentError] = useState(false);

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const campusCircleRef = useRef(null);

  // Initialize Map
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
  }, []);

  // Fetch Parent's Students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/parents/profile');
        const studentList = res.data?.data?.students || [];
        setStudents(studentList);
        if (studentList.length > 0) {
          setSelectedStudent(studentList[0]);
        }
      } catch (err) {
        toast.error('Failed to load children profiles');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Setup Socket & Map for Selected Student
  useEffect(() => {
    if (!selectedStudent || !mapReady) return;

    setConsentError(false);
    setLocationData(null);

    // Init map if needed
    if (!mapRef.current && document.getElementById('parent-tracking-map')) {
      const L = window.L;
      mapRef.current = L.map('parent-tracking-map').setView([CAMPUS_LAT, CAMPUS_LNG], 15);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);

      campusCircleRef.current = L.circle([CAMPUS_LAT, CAMPUS_LNG], {
        color: '#10b981',
        fillColor: '#d1fae5',
        fillOpacity: 0.3,
        weight: 2,
        radius: CAMPUS_RADIUS
      }).addTo(mapRef.current);
      campusCircleRef.current.bindTooltip('Campus Zone');
    }

    const socket = getSocket();
    if (!socket) return;

    const L = window.L;

    socket.emit('join_tracking', selectedStudent._id);

    const handleLocationUpdated = (payload) => {
      if (payload.studentId === selectedStudent._id) {
        setLocationData(payload);
        
        if (mapRef.current) {
          const latLng = [payload.lat, payload.lng];
          
          if (!markerRef.current) {
            const iconHtml = `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4); animation: pulse 1.5s infinite;"></div>`;
            const customIcon = L.divIcon({ html: iconHtml, className: '', iconSize: [22, 22], iconAnchor: [11, 11] });
            markerRef.current = L.marker(latLng, { icon: customIcon }).addTo(mapRef.current);
          } else {
            markerRef.current.setLatLng(latLng);
          }

          markerRef.current.bindPopup(`<b>${selectedStudent.personalDetails?.fullName}</b><br/>${payload.statusLabel}`).openPopup();

          // Fit bounds to show both campus and student
          const bounds = L.latLngBounds([latLng, [CAMPUS_LAT, CAMPUS_LNG]]);
          mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
        }
      }
    };

    const handleTrackingError = (error) => {
      if (error.message && error.message.toLowerCase().includes('consent')) {
        setConsentError(true);
      } else {
        toast.error(error.message || 'Failed to start tracking');
      }
    };

    socket.on('location_updated', handleLocationUpdated);
    socket.on('tracking_error', handleTrackingError);

    return () => {
      socket.off('location_updated', handleLocationUpdated);
      socket.off('tracking_error', handleTrackingError);
      socket.emit('leave_tracking', selectedStudent._id);
      
      if (markerRef.current && mapRef.current) {
        mapRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    };
  }, [selectedStudent, mapReady]);

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-600" size={32} /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Navigation size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Live Student Tracking</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Monitor your child's real-time location and status</p>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="bg-white dark:bg-dark-800 p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500">No students linked to your account.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-xs">Select Child</h3>
            <div className="space-y-3">
              {students.map((student) => (
                <button
                  key={student._id}
                  onClick={() => setSelectedStudent(student)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedStudent?._id === student._id
                      ? 'bg-blue-50 border-blue-200 shadow-sm dark:bg-blue-900/20 dark:border-blue-800/50'
                      : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50 dark:bg-dark-800 dark:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-slate-900 dark:text-white">{student.personalDetails?.fullName}</div>
                  <div className="text-xs text-slate-500 mt-1">Roll No: {student.rollNumber}</div>
                </button>
              ))}
            </div>

            {locationData && !consentError && (
              <div className="bg-white dark:bg-dark-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mt-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Current Status</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Status</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-bold text-sm">
                      <MapPin size={16} />
                      {locationData.statusLabel}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Campus Distance</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {locationData.distanceFromCampus > 1000 
                        ? `${(locationData.distanceFromCampus / 1000).toFixed(1)} km` 
                        : `${locationData.distanceFromCampus} m`}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Last Updated</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {new Date(locationData.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Map Area */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm h-[600px] flex flex-col relative">
              
              {consentError ? (
                <div className="absolute inset-0 z-10 bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                    <ShieldCheck size={32} className="text-amber-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Consent Required</h2>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
                    You have not granted permission to track <b>{selectedStudent?.personalDetails?.fullName}</b>'s location. 
                    Please enable location tracking in the Consent settings to view the live map.
                  </p>
                  <a href="/parent/consent" className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    Manage Consent
                  </a>
                </div>
              ) : !locationData ? (
                <div className="absolute inset-0 z-10 bg-slate-50/80 dark:bg-dark-900/80 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none">
                  <Loader2 size={32} className="animate-spin text-brand-600 mb-3" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Waiting for GPS signal from student's device...</p>
                  <p className="text-xs text-slate-400 mt-2">Ensure the student app is open and location services are enabled.</p>
                </div>
              ) : null}

              <div id="parent-tracking-map" className="flex-1 w-full bg-slate-100 z-0"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentTrackingPage;

import React, { useState, useEffect, useRef } from 'react';
import { Bus, MapPin, Loader2, Navigation, Clock } from 'lucide-react';
import { getSocket } from '../../services/socket';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CAMPUS_LAT = parseFloat(import.meta.env.VITE_CAMPUS_LAT || '18.5975');
const CAMPUS_LNG = parseFloat(import.meta.env.VITE_CAMPUS_LNG || '73.7898');

const BusTrackingPage = () => {
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [etaInfo, setEtaInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  const mapRef = useRef(null);
  const markersRef = useRef({});

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
      setTimeout(() => setMapReady(true), 0);
    }
  }, []);

  // Fetch initial live positions
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await api.get('/transport/live');
        setBuses(res.data?.data || []);
      } catch (err) {
        toast.error('Failed to load live bus locations');
      } finally {
        setLoading(false);
      }
    };
    fetchBuses();
  }, []);

  // Fetch ETA if a bus is selected
  useEffect(() => {
    if (!selectedBus) return;
    
    const fetchETA = async () => {
      try {
        const res = await api.get(`/transport/eta/${selectedBus.vehicleId}`);
        setEtaInfo(res.data?.data);
      } catch (err) {
        console.error('Failed to fetch ETA:', err);
      }
    };
    
    fetchETA();
    const interval = setInterval(fetchETA, 30000); // refresh ETA every 30s
    return () => clearInterval(interval);
  }, [selectedBus]);

  // Setup Map and Socket
  useEffect(() => {
    if (!mapReady || loading) return;

    if (!mapRef.current && document.getElementById('bus-tracking-map')) {
      const L = window.L;
      mapRef.current = L.map('bus-tracking-map').setView([CAMPUS_LAT, CAMPUS_LNG], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);

      // Campus marker
      const campusIcon = L.divIcon({ 
        html: `<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`, 
        className: '', iconSize: [20, 20], iconAnchor: [10, 10] 
      });
      L.marker([CAMPUS_LAT, CAMPUS_LNG], { icon: campusIcon }).addTo(mapRef.current).bindPopup('<b>College Campus</b>');
    }

    const socket = getSocket();
    if (!socket) return;

    socket.emit('join_bus_overview');

    const handleLocationUpdated = (payload) => {
      setBuses(prev => {
        const index = prev.findIndex(b => b.vehicleId === payload.vehicleId);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { ...updated[index], lat: payload.lat, lng: payload.lng, lastUpdated: payload.timestamp };
          return updated;
        }
        return prev; // Or add new bus if we want
      });
    };

    socket.on('bus_location_updated', handleLocationUpdated);

    return () => {
      socket.off('bus_location_updated', handleLocationUpdated);
    };
  }, [mapReady, loading]);

  // Update markers
  useEffect(() => {
    if (!mapRef.current || !window.L) return;
    const L = window.L;

    buses.forEach(bus => {
      if (bus.lat && bus.lng) {
        const isSelected = selectedBus?.vehicleId === bus.vehicleId;
        
        const iconHtml = `
          <div style="
            background-color: ${isSelected ? '#f59e0b' : '#3b82f6'}; 
            width: ${isSelected ? '24px' : '18px'}; 
            height: ${isSelected ? '24px' : '18px'}; 
            border-radius: 50%; 
            border: 3px solid white; 
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center;
            ${isSelected ? 'animation: pulse 2s infinite;' : ''}
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? '12' : '10'}" height="${isSelected ? '12' : '10'}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
          </div>
        `;
        
        const customIcon = L.divIcon({ 
          html: iconHtml, 
          className: '', 
          iconSize: isSelected ? [24, 24] : [18, 18], 
          iconAnchor: isSelected ? [12, 12] : [9, 9] 
        });

        if (markersRef.current[bus.vehicleId]) {
          markersRef.current[bus.vehicleId].setLatLng([bus.lat, bus.lng]);
          markersRef.current[bus.vehicleId].setIcon(customIcon);
        } else {
          const marker = L.marker([bus.lat, bus.lng], { icon: customIcon }).addTo(mapRef.current);
          marker.on('click', () => setSelectedBus(bus));
          markersRef.current[bus.vehicleId] = marker;
        }
      }
    });

  }, [buses, selectedBus]);

  // Center map on selected bus
  useEffect(() => {
    if (selectedBus && selectedBus.lat && selectedBus.lng && mapRef.current) {
      mapRef.current.setView([selectedBus.lat, selectedBus.lng], 16);
    }
  }, [selectedBus]);

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-600" size={32} /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Bus size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Live Fleet Tracking</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Real-time GPS tracking for college transport</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active Buses: {buses.length}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Map Area */}
        <div className="flex-1 bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm relative min-h-[400px]">
          <div id="bus-tracking-map" className="absolute inset-0 z-0"></div>
          
          {selectedBus && etaInfo && (
            <div className="absolute top-4 left-4 right-4 md:right-auto md:w-80 bg-white/95 dark:bg-dark-800/95 backdrop-blur-md p-4 rounded-xl shadow-xl z-[400] border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Bus size={18} className="text-brand-600" /> {selectedBus.vehicleNumber}
                </h3>
                <button onClick={() => setSelectedBus(null)} className="text-slate-400 hover:text-slate-600">×</button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-dark-700 flex items-center justify-center shrink-0">
                    <Navigation size={14} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Route</p>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{selectedBus.routeName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                    <Clock size={14} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Est. Arrival ({etaInfo.stopName})</p>
                    <p className="font-bold text-sm text-amber-700 dark:text-amber-500">
                      ~{etaInfo.etaMinutes} mins <span className="text-xs font-normal text-slate-500">({etaInfo.distanceKm} km)</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bus List */}
        <div className="w-full lg:w-80 bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col min-h-[300px] max-h-[400px] lg:max-h-none">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white">Active Vehicles</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {buses.length === 0 ? (
              <div className="text-center p-6 text-slate-500 text-sm">No live buses tracked right now.</div>
            ) : (
              buses.map(bus => (
                <button
                  key={bus.vehicleId}
                  onClick={() => setSelectedBus(bus)}
                  className={`w-full text-left p-3 rounded-xl transition-colors flex items-center gap-3 ${
                    selectedBus?.vehicleId === bus.vehicleId
                      ? 'bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800/50 shadow-sm'
                      : 'hover:bg-slate-50 dark:hover:bg-dark-700/50 border border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    selectedBus?.vehicleId === bus.vehicleId ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-dark-700 text-slate-500'
                  }`}>
                    <Bus size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{bus.vehicleNumber}</p>
                    <p className="text-xs text-slate-500 truncate">{bus.routeName}</p>
                  </div>
                  {bus.lastUpdated && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusTrackingPage;

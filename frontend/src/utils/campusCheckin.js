import api from '../api/axios';
import { updateCampusStatus } from '../features/auth/authSlice';

const GEO_OPTIONS = { timeout: 15000, maximumAge: 0, enableHighAccuracy: true };
const SESSION_KEY = 'campusCheckinSent';

export const requestGeolocation = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        }),
      () => resolve(null),
      GEO_OPTIONS
    );
  });

export const submitCampusCheckin = async (dispatch, coords) => {
  if (!coords) return false;
  try {
    const res = await api.post('/attendance/campus-checkin', {
      lat: coords.lat,
      lng: coords.lng,
      accuracy: coords.accuracy
    });
    const data = res.data;
    if (dispatch) {
      dispatch(
        updateCampusStatus({
          onCampus: data.data?.onCampus || false,
          location: { lat: coords.lat, lng: coords.lng }
        })
      );
    }
    return true;
  } catch (err) {
    console.warn('Campus check-in failed:', err?.response?.data?.message || err.message);
    return false;
  }
};

export const performStudentCampusCheckin = async (dispatch, { force = false } = {}) => {
  if (!force && sessionStorage.getItem(SESSION_KEY)) return false;
  const coords = await requestGeolocation();
  if (!coords) return false;
  const ok = await submitCampusCheckin(dispatch, coords);
  if (ok) sessionStorage.setItem(SESSION_KEY, '1');
  return ok;
};

export const clearCampusCheckinSession = () => {
  sessionStorage.removeItem(SESSION_KEY);
};

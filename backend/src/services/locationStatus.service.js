/**
 * Location Status Classification Service
 * Determines student status based on GPS coordinates and time of day.
 * 
 * Status values: at_home, on_way_to_school, at_school, on_way_home, unknown
 */

const CAMPUS_LAT = parseFloat(process.env.CAMPUS_LAT || '18.5975');
const CAMPUS_LNG = parseFloat(process.env.CAMPUS_LNG || '73.7898');
const CAMPUS_RADIUS_METERS = parseInt(process.env.CAMPUS_RADIUS_METERS || '300', 10);
const HOME_RADIUS_METERS = parseInt(process.env.HOME_RADIUS_METERS || '200', 10);

// School hours configuration
const SCHOOL_START_HOUR = parseInt(process.env.SCHOOL_START_HOUR || '8', 10);
const SCHOOL_END_HOUR = parseInt(process.env.SCHOOL_END_HOUR || '16', 10);

/**
 * Calculate distance between two coordinates in meters (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  const R = 6371e3;
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
}

/**
 * Classify student location status
 * @param {number} lat - Current latitude
 * @param {number} lng - Current longitude
 * @param {object} homeLocation - { lat, lng } of student's home (optional)
 * @returns {{ status: string, distanceFromCampus: number, isOnCampus: boolean }}
 */
function classifyLocation(lat, lng, homeLocation = null) {
  const now = new Date();
  const currentHour = now.getHours();
  const distanceFromCampus = calculateDistance(lat, lng, CAMPUS_LAT, CAMPUS_LNG);
  const isOnCampus = distanceFromCampus <= CAMPUS_RADIUS_METERS;

  let isAtHome = false;
  let distanceFromHome = Infinity;
  if (homeLocation && homeLocation.lat && homeLocation.lng) {
    distanceFromHome = calculateDistance(lat, lng, homeLocation.lat, homeLocation.lng);
    isAtHome = distanceFromHome <= HOME_RADIUS_METERS;
  }

  let status = 'unknown';

  if (isOnCampus) {
    status = 'at_school';
  } else if (isAtHome) {
    status = 'at_home';
  } else if (currentHour >= SCHOOL_START_HOUR - 2 && currentHour < SCHOOL_START_HOUR + 1) {
    // Morning (6 AM to 9 AM) and not at school/home → likely traveling to school
    status = 'on_way_to_school';
  } else if (currentHour >= SCHOOL_END_HOUR && currentHour <= SCHOOL_END_HOUR + 2) {
    // Afternoon (4 PM to 6 PM) and not at school/home → likely going home
    status = 'on_way_home';
  } else if (isAtHome === false && !isOnCampus) {
    // Outside both zones at other times
    if (currentHour < SCHOOL_START_HOUR) {
      status = 'at_home'; // assume at home before school if we don't have home coords
    } else if (currentHour > SCHOOL_END_HOUR + 2) {
      status = 'at_home'; // assume at home after school hours
    } else {
      status = 'unknown';
    }
  }

  return {
    status,
    distanceFromCampus: Math.round(distanceFromCampus),
    distanceFromHome: Math.round(distanceFromHome),
    isOnCampus
  };
}

/**
 * Get human-readable label for a status
 */
function getStatusLabel(status) {
  const labels = {
    at_home: 'At Home',
    on_way_to_school: 'On the Way to School',
    at_school: 'At School',
    on_way_home: 'On the Way Home',
    unknown: 'Unknown'
  };
  return labels[status] || 'Unknown';
}

/**
 * Get status emoji
 */
function getStatusEmoji(status) {
  const emojis = {
    at_home: '🏠',
    on_way_to_school: '🚌',
    at_school: '🏫',
    on_way_home: '🏡',
    unknown: '❓'
  };
  return emojis[status] || '❓';
}

module.exports = { classifyLocation, getStatusLabel, getStatusEmoji, calculateDistance };

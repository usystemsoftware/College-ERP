function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Radius of the Earth in meters
  const rlat1 = lat1 * (Math.PI / 180);
  const rlat2 = lat2 * (Math.PI / 180);
  const difflat = rlat2 - rlat1;
  const difflon = (lng2 - lng1) * (Math.PI / 180);

  const d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat / 2) * Math.sin(difflat / 2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon / 2) * Math.sin(difflon / 2)));
  return d;
}

function isInsideCampus(lat, lng) {
  const campusLat = parseFloat(process.env.CAMPUS_LAT || '18.5975');
  const campusLng = parseFloat(process.env.CAMPUS_LNG || '73.7898');
  const campusRadius = parseInt(process.env.CAMPUS_RADIUS_METERS || '300', 10);
  
  const distance = haversineDistance(campusLat, campusLng, lat, lng);
  return distance <= campusRadius;
}

module.exports = {
  haversineDistance,
  isInsideCampus
};

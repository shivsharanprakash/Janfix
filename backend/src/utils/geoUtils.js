// Simple helper: build GeoJSON point
const makePoint = (lng, lat) => ({ type: 'Point', coordinates: [lng, lat] });

// TODO: if you have ward polygons, implement point-in-polygon check here.
// For now, provide a stub that returns "ward-1".
const detectWard = (lng, lat) => {
  // implement polygon check against seed wards or call a reverse geocode here
  return 'ward-1';
};

module.exports = { makePoint, detectWard };

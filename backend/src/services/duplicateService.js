const Report = require('../models/Report');

// radiusMeters e.g. 100, timeWindowDays e.g. 7
async function findNearbyDuplicates(report, radiusMeters = 100, timeWindowDays = 7) {
  const sinceDate = new Date(Date.now() - timeWindowDays * 24 * 3600 * 1000);
  const docs = await Report.find({
    _id: { $ne: report._id },
    category: report.category,
    createdAt: { $gte: sinceDate },
    location: {
      $near: {
        $geometry: report.location,
        $maxDistance: radiusMeters
      }
    }
  }).limit(5);
  return docs;
}

module.exports = { findNearbyDuplicates };

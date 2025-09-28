const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  url: String,
  filename: String,
  type: String // 'image'|'video'
}, { _id: false });

const ReportSchema = new mongoose.Schema({
  reporterName: { type: String },
  phone: { type: String },
  category: { type: String, required: true },
  description: { type: String },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' } // [lng, lat]
  },
  address: { type: String },
  media: [MediaSchema],
  status: { type: String, enum: ['received', 'assigned', 'in_progress', 'verification_pending', 'resolved', 'unresolved'], default: 'received' },
  stage: { type: String, enum: ['citizen', 'admin', 'worker', 'completed'], default: 'citizen' },
  fixedMedia: [MediaSchema],
  duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', default: null },
  severityScore: { type: Number, default: null },
  predictedCategory: { type: String, default: null },
  requiresVerification: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema);

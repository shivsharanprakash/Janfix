const mongoose = require('mongoose');

const StatusHistorySchema = new mongoose.Schema({
  status: String,
  by: String,
  at: { type: Date, default: Date.now },
  note: String
}, { _id: false });

const AssignmentSchema = new mongoose.Schema({
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  assignedTo: { type: String }, // staff name or id
  assignedBy: { type: String },
  assignedAt: { type: Date, default: Date.now },
  slaDeadline: { type: Date },
  effectiveAt: { type: Date },
  status: { type: String, default: 'assigned' },
  statusHistory: [StatusHistorySchema]
});

module.exports = mongoose.model('Assignment', AssignmentSchema);

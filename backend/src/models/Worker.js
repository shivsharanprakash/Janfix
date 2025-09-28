const mongoose = require('mongoose');

// Allowed department codes and names mapping
const ALLOWED_DEPARTMENT_CODES = {
  P101: 'Potholes/Road',
  SV202: 'Sewage',
  S303: 'Street',
  G404: 'Garbage/Sanitation',
  W505: 'Water'
};

/**
 * WorkerId format: MNC<digits>
 * Accepted numeric range (after MNC): 100001 to 104000 (inclusive)
 */
function isValidWorkerId(workerId) {
  if (typeof workerId !== 'string') return false;
  const match = workerId.match(/^MNC(\d{5,6})$/);
  if (!match) return false;
  const num = parseInt(match[1], 10);
  return num >= 100001 && num <= 104000;
}

const WorkerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  workerId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    validate: {
      validator: isValidWorkerId,
      message: 'workerId must be between MNC100001 and MNC104000'
    }
  },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  departmentCode: {
    type: String,
    required: true,
    uppercase: true,
    enum: Object.keys(ALLOWED_DEPARTMENT_CODES)
  },
  phone: { type: String, required: true, trim: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  status: { type: String, enum: ['idle', 'busy'], default: 'idle' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Worker', WorkerSchema);






const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  contact: { type: String },
  slaHours: { type: Number, default: 48 }, // default SLA in hours
  wards: [{ type: String }] // optional ward ids or names
});

module.exports = mongoose.model('Department', DepartmentSchema);

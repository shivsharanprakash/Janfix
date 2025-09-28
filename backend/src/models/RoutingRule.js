const mongoose = require('mongoose');

const RoutingRuleSchema = new mongoose.Schema({
  category: { type: String, required: true },
  wardId: { type: String, required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  priority: { type: Number, default: 1 }
});

module.exports = mongoose.model('RoutingRule', RoutingRuleSchema);

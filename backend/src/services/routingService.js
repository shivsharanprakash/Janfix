const RoutingRule = require('../models/RoutingRule');
const Department = require('../models/Department');
const Assignment = require('../models/Assignment');

function normalizeCategory(raw) {
  const s = String(raw || '').trim().toLowerCase();
  if (!s) return s;
  if (/(poth|pathole|road)/.test(s)) return 'pothole';
  if (/(garbage|waste|sanitation|dustbin)/.test(s)) return 'garbage';
  if (/(street.?light|lighting|lamp|light)/.test(s)) return 'streetlight';
  return s;
}

async function routeReport(report, wardId) {
  // find highest priority rule
  const normCat = normalizeCategory(report.category);
  const rule = await RoutingRule.findOne({ category: normCat, wardId }).sort({ priority: 1 }).exec();
  let assignment = null;
  if (rule) {
    const dept = await Department.findById(rule.departmentId);
    if (dept) {
      // SLA base by category
      const catBase = { pothole: 48, garbage: 24, streetlight: 24, sewage: 24, water: 12 };
      const baseHours = catBase[normCat] || dept.slaHours || 48;
      const now = new Date();
      const isSaturday = now.getDay() === 6;
      let slaDeadline = new Date(now.getTime() + baseHours * 3600 * 1000);
      let effectiveAt = now;
      let status = 'assigned';
      if (isSaturday) {
        // schedule for Monday morning
        const monday = new Date(now);
        monday.setDate(now.getDate() + 2);
        monday.setHours(9, 0, 0, 0);
        effectiveAt = monday;
        status = 'scheduled';
        if (slaDeadline.getDay() === 0) {
          slaDeadline = monday;
        }
      }
      assignment = await Assignment.findOne({ reportId: report._id });
      if (assignment) {
        assignment.departmentId = dept._id;
        assignment.assignedBy = 'system';
        assignment.slaDeadline = slaDeadline;
        assignment.effectiveAt = effectiveAt;
        assignment.status = status;
        assignment.statusHistory.push({ status, by: 'system' });
        await assignment.save();
      } else {
        assignment = new Assignment({
          reportId: report._id,
          departmentId: dept._id,
          assignedBy: 'system',
          slaDeadline,
          effectiveAt,
          status
        });
        await assignment.save();
      }
    }
  }
  if (!assignment) {
    // Fallback mapping: category -> Department.code or Department.name regex
    const cat = normCat;
    const codeByCategory = { pothole: 'P101', garbage: 'G101', streetlight: 'S101' };
    const nameRegexByCategory = {
      pothole: /(pothole|road)/i,
      garbage: /(garbage|waste|solid)/i,
      streetlight: /(street.?light|lighting)/i
    };
    let dept = null;
    const code = codeByCategory[cat];
    if (code) {
      dept = await Department.findOne({ code });
    }
    if (!dept) {
      const rx = nameRegexByCategory[cat] || new RegExp(cat.replace(/[^a-z0-9]/g, '.'), 'i');
      dept = await Department.findOne({ name: rx });
    }
    if (dept) {
      const slaHours = dept.slaHours || 48;
      const slaDeadline = new Date(Date.now() + slaHours * 3600 * 1000);
      assignment = await Assignment.findOne({ reportId: report._id });
      if (assignment) {
        assignment.departmentId = dept._id;
        assignment.assignedBy = 'system';
        assignment.slaDeadline = slaDeadline;
        assignment.status = 'assigned';
        assignment.statusHistory.push({ status: 'assigned', by: 'system' });
        await assignment.save();
      } else {
        assignment = new Assignment({
          reportId: report._id,
          departmentId: dept._id,
          assignedBy: 'system',
          slaDeadline,
          status: 'assigned'
        });
        await assignment.save();
      }
    }
  }
  return assignment;
}

module.exports = { routeReport };

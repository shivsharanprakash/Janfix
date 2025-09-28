const Report = require('../models/Report');
const Assignment = require('../models/Assignment');
const Department = require('../models/Department');
const Worker = require('../models/Worker');
const RoutingRule = require('../models/RoutingRule');
const AuditLog = require('../models/AuditLog');
const mlService = require('../services/mlService');

async function dashboard(req, res, next) {
  try {
    const total = await Report.countDocuments();
    const open = await Report.countDocuments({ status: { $ne: 'resolved' } });
    const resolved = await Report.countDocuments({ status: 'resolved' });
    // avg resolution time (simple stub)
    // You can compute from assignments or statusHistory
    res.json({ total, open, resolved });
  } catch (err) { next(err); }
}

async function adminListReports(req, res, next) {
  try {
    const reports = await Report.find().sort({ createdAt: -1 }).limit(200).select('-__v');
    // attach assignment summary
    const ids = reports.map(r => r._id);
    const assignments = await Assignment.find({ reportId: { $in: ids } }).lean();
    const byReport = new Map(assignments.map(a => [String(a.reportId), a]));
    const data = reports.map(r => {
      const a = byReport.get(String(r._id));
      return Object.assign(r.toObject(), {
        assignment: a ? {
          status: a.status,
          effectiveAt: a.effectiveAt,
          slaDeadline: a.slaDeadline,
          assignedTo: a.assignedTo
        } : null
      });
    });
    res.json(data);
  } catch (err) { next(err); }
}

async function assignReport(req, res, next) {
  try {
    const { reportId, departmentId } = req.body;
    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    if (report.status === 'resolved') {
      return res.status(409).json({ error: 'Report already resolved; cannot assign' });
    }

    // Resolve department if not explicitly provided: use routing rule by category
    let dept = null;
    let resolvedDepartmentId = departmentId;
    function normalizeCategory(raw) {
      const s = String(raw || '').trim().toLowerCase();
      if (!s) return s;
      if (/(poth|pathole|road)/.test(s)) return 'pothole';
      if (/(garbage|waste|sanitation|dustbin)/.test(s)) return 'garbage';
      if (/(street.?light|lighting|lamp|light)/.test(s)) return 'streetlight';
      return s;
    }
    const normCat = normalizeCategory(report.category);
    if (!resolvedDepartmentId) {
      const rule = await RoutingRule.findOne({ category: normCat }).sort({ priority: 1 });
      if (rule) {
        resolvedDepartmentId = rule.departmentId;
      } else {
        // Fallback mapping: category -> Department.code or Department.name regex
        const cat = normCat;
        const codeByCategory = { pothole: 'P101', garbage: 'G101', streetlight: 'S101' };
        const nameRegexByCategory = {
          pothole: /(pothole|road)/i,
          garbage: /(garbage|waste|solid)/i,
          streetlight: /(street.?light|lighting)/i
        };
        let deptDoc = null;
        const code = codeByCategory[cat];
        if (code) {
          deptDoc = await Department.findOne({ code });
        }
        if (!deptDoc) {
          const rx = nameRegexByCategory[cat] || new RegExp(cat.replace(/[^a-z0-9]/g, '.'), 'i');
          deptDoc = await Department.findOne({ name: rx });
        }
        if (deptDoc) resolvedDepartmentId = deptDoc._id;
      }
    }

    if (!resolvedDepartmentId) {
      return res.status(400).json({ error: 'No routing configured for this category' });
    }

    dept = await Department.findById(resolvedDepartmentId);
    if (!dept) return res.status(404).json({ error: 'Department not found' });

    // Auto-pick least loaded worker in this department (favor idle)
    const workers = await Worker.find({ departmentId: dept._id }).lean();
    if (!workers || workers.length === 0) {
      return res.status(409).json({ error: 'No workers available in this department' });
    }

    // Build assignment counts per worker
    const usernames = workers.map(w => w.username);
    const activeStatuses = ['assigned', 'in_progress', 'escalated'];
    const counts = await Assignment.aggregate([
      { $match: { assignedTo: { $in: usernames }, status: { $in: activeStatuses } } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
    ]);
    const countByUser = new Map(counts.map(c => [c._id, c.count]));

    // Sort by count asc, then prefer idle status, then oldest created
    const sorted = workers.slice().sort((a, b) => {
      const ca = countByUser.get(a.username) || 0;
      const cb = countByUser.get(b.username) || 0;
      if (ca !== cb) return ca - cb;
      if (a.status !== b.status) return (a.status === 'idle' ? -1 : 1);
      const at = new Date(a.createdAt).getTime();
      const bt = new Date(b.createdAt).getTime();
      return at - bt;
    });
    const chosen = sorted[0];
    if (!chosen) return res.status(409).json({ error: 'No worker available' });

    const worker = await Worker.findOne({ username: chosen.username });

    // Mark worker as busy (atomic, skip full validation of untouched fields)
    await Worker.updateOne({ _id: worker._id }, { $set: { status: 'busy' } }, { runValidators: false });

    // Estimate severity to compute SLA by difficulty
    let severityScore = report.severityScore;
    if (severityScore == null) {
      try {
        severityScore = await mlService.estimateSeverity(report);
        report.severityScore = severityScore;
      } catch (e) {
        // fallback silently
      }
    }
    // SLA base by category
    const catBase = { pothole: 48, garbage: 24, streetlight: 24, sewage: 24, water: 12 };
    const baseHours = catBase[normCat] || dept.slaHours || 48;
    // Map severity (0..1) to multiplier: low=>0.5x, medium=>1x, high=>2x
    const multiplier = severityScore == null ? 1 : (severityScore < 0.34 ? 0.5 : severityScore < 0.67 ? 1 : 2);
    const slaHours = Math.max(4, Math.round(baseHours * multiplier));
    // Calculate deadline, enforce Saturday rule: assign within 24h except Saturday => next Monday
    function addHoursSkippingSunday(start, hours) {
      const d = new Date(start.getTime() + hours * 3600 * 1000);
      return d;
    }
    const now = new Date();
    const isSaturday = now.getDay() === 6; // 6 = Saturday
    let slaDeadline = addHoursSkippingSunday(now, slaHours);
    let effectiveAt = now;
    if (isSaturday) {
      const monday = new Date(now);
      monday.setDate(now.getDate() + 2);
      monday.setHours(9, 0, 0, 0);
      if (slaDeadline.getDay() === 0 /* Sunday */) {
        slaDeadline = monday;
      }
      effectiveAt = monday;
    }
    // Upsert/rehydrate assignment to avoid duplicate key on reportId
    let assignment = await Assignment.findOne({ reportId });
    if (assignment) {
      // release previous worker if different
      if (assignment.assignedTo && assignment.assignedTo !== worker.username) {
        const prevWorker = await Worker.findOne({ username: assignment.assignedTo });
        if (prevWorker) {
          await Worker.updateOne({ _id: prevWorker._id }, { $set: { status: 'idle' } }, { runValidators: false });
        }
      }
      assignment.departmentId = dept._id;
      assignment.assignedTo = worker.username;
      assignment.assignedBy = req.session.username;
      assignment.slaDeadline = slaDeadline;
      assignment.effectiveAt = effectiveAt;
      assignment.status = isSaturday ? 'scheduled' : 'assigned';
      assignment.statusHistory.push({ status: assignment.status, by: req.session.username });
      await assignment.save();
    } else {
      assignment = new Assignment({
        reportId,
        departmentId: dept._id,
        assignedTo: worker.username,
        assignedBy: req.session.username,
        slaDeadline,
        effectiveAt,
        status: isSaturday ? 'scheduled' : 'assigned'
      });
      await assignment.save();
    }

    // update report status
    report.status = isSaturday ? 'assigned' : 'assigned';
    report.stage = 'worker';
    await report.save();

    // audit
    await new AuditLog({
      reportId,
      action: 'assigned',
      actor: req.session.username,
      actorRole: 'admin',
      payload: {
        departmentId,
        worker: { id: worker._id, username: worker.username, workerId: worker.workerId, name: worker.name }
      }
    }).save();

    res.json({
      message: 'assigned',
      assignmentId: assignment._id,
      worker: { id: worker._id, username: worker.username, workerId: worker.workerId, name: worker.name }
    });
  } catch (err) { next(err); }
}

// Department and routing rule basic CRUD
async function createDepartment(req, res, next) {
  try {
    const dept = new Department(req.body);
    await dept.save();
    res.json(dept);
  } catch (err) { next(err); }
}

async function listDepartments(req, res, next) {
  try {
    const depts = await Department.find();
    res.json(depts);
  } catch (err) { next(err); }
}

async function createRoutingRule(req, res, next) {
  try {
    const rule = new RoutingRule(req.body);
    await rule.save();
    res.json(rule);
  } catch (err) { next(err); }
}

async function listRoutingRules(req, res, next) {
  try {
    const rules = await RoutingRule.find();
    res.json(rules);
  } catch (err) { next(err); }
}

module.exports = {
  dashboard,
  adminListReports,
  assignReport,
  createDepartment,
  listDepartments,
  createRoutingRule,
  listRoutingRules
};

const bcrypt = require('bcryptjs');
const Worker = require('../models/Worker');
const Assignment = require('../models/Assignment');
const Report = require('../models/Report');
const Department = require('../models/Department');
const AuditLog = require('../models/AuditLog');
const mlService = require('../services/mlService');
const { Types } = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const name = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

/**
 * Register Worker
 */
async function register(req, res, next) {
  try {
    const { name, departmentCode, departmentId, workerId, phone, username, password } = req.body;
    if (!name || !departmentCode || !workerId || !phone || !username || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Normalize codes
    let normalizedDeptCode = String(departmentCode || '').toUpperCase();
    const normalizedWorkerId = String(workerId).toUpperCase();

    // Resolve departmentId if a code like "SV202" was passed instead of an ObjectId
    let resolvedDepartmentId = undefined;
    if (departmentId) {
      if (Types.ObjectId.isValid(departmentId)) {
        resolvedDepartmentId = departmentId;
      } else {
        const byCode = String(departmentId).toUpperCase();
        const deptDoc = await Department.findOne({ code: byCode });
        if (!deptDoc) return res.status(400).json({ error: 'Invalid departmentId/code' });
        resolvedDepartmentId = deptDoc._id;
        if (!normalizedDeptCode) normalizedDeptCode = deptDoc.code;
      }
    } else if (normalizedDeptCode) {
      const deptDoc = await Department.findOne({ code: normalizedDeptCode });
      if (!deptDoc) return res.status(400).json({ error: 'Invalid departmentCode' });
      resolvedDepartmentId = deptDoc._id;
      normalizedDeptCode = deptDoc.code; // ensure proper casing
    }

    // Validate fields using Worker schema
    const temp = new Worker({
      username: `__temp__${Date.now()}`,
      workerId: normalizedWorkerId,
      passwordHash: 'x',
      name,
      departmentCode: normalizedDeptCode,
      phone
    });

    const valErr = temp.validateSync();
    if (valErr) {
      return res.status(400).json({ error: valErr.message });
    }

    // Check duplicates
    const exists = await Worker.findOne({
      $or: [{ username }, { workerId: normalizedWorkerId }]
    });
    if (exists) {
      return res.status(409).json({ error: 'Username or workerId already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create worker
    const worker = await Worker.create({
      username,
      workerId: normalizedWorkerId,
      passwordHash,
      name,
      departmentCode: normalizedDeptCode,
      phone,
      departmentId: resolvedDepartmentId
    });

    res.status(201).json({
      message: 'registered',
      worker: { id: worker._id, username: worker.username, workerId: worker.workerId }
    });
  } catch (err) {
    console.error('Register error:', err); // log error in backend terminal
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Username or workerId already exists' });
    }
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Login Worker
 */
async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    // Allow login with username or workerId
    const worker = await Worker.findOne({
      $or: [{ username }, { workerId: String(username).toUpperCase() }]
    });
    if (!worker) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, worker.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    req.session.workerId = worker._id;
    req.session.username = worker.username;
    req.session.role = 'worker';
    res.json({ message: 'ok' });
  } catch (err) {
    next(err);
  }
}

/**
 * Logout Worker
 */
function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'logged out' });
  });
}

/**
 * List assignments for worker
 */
async function listMyAssignments(req, res, next) {
  try {
    const username = req.session.username;
    const items = await Assignment.find({ assignedTo: username }).sort({ assignedAt: -1 });
    // populate report details
    const reportIds = items.map(a => a.reportId);
    const reports = await Report.find({ _id: { $in: reportIds } }).lean();
    const byReportId = new Map(reports.map(r => [String(r._id), r]));
    const enriched = items.map(a => {
      const r = byReportId.get(String(a.reportId));
      return {
        ...a.toObject(),
        report: r ? {
          _id: r._id,
          category: r.category,
          description: r.description,
          reporterName: r.reporterName,
          phone: r.phone,
          status: r.status,
          stage: r.stage,
          location: r.location,
          media: r.media || [],
          fixedMedia: r.fixedMedia || [],
          createdAt: r.createdAt,
          updatedAt: r.updatedAt
        } : null
      };
    });
    res.json(enriched);
  } catch (err) {
    next(err);
  }
}

/**
 * Utility: distance check
 */
function isNear(lat1, lng1, lat2, lng2) {
  function toRad(x) {
    return x * Math.PI / 180;
  }
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c < 120; // 120 meters threshold
}

/**
 * Resolve assignment
 */
async function resolveAssignment(req, res, next) {
  try {
    const { assignmentId, lat, lng } = req.body;
    const file = req.file;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    const report = await Report.findById(assignment.reportId);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    // attach fixed image to report
    if (!report.fixedMedia) report.fixedMedia = [];
    if (file) {
      report.fixedMedia.push({
        url: `/uploads/${file.filename}`,
        filename: file.filename,
        type: 'image'
      });
    }

    // simple geo check
    const [origLng, origLat] = report.location?.coordinates || [null, null];
    let completed = origLat != null && isNear(parseFloat(lat), parseFloat(lng), origLat, origLng);

    // ML compare before/after if geo says near
    if (completed) {
      try {
        const { improved, confidence } = await mlService.compareBeforeAfter(report.media, report.fixedMedia);
        completed = improved && confidence >= 0.6;
      } catch (e) {
        // fallback to geo-only
      }
    }

    report.status = completed ? 'resolved' : 'unresolved';
    report.stage = completed ? 'completed' : 'worker';
    await report.save();

    assignment.status = completed ? 'resolved' : 'unresolved';
    assignment.statusHistory.push({
      status: assignment.status,
      by: req.session.username
    });
    await assignment.save();

  // If completed, release worker to idle
  if (completed && assignment.assignedTo) {
    const assignedWorker = await Worker.findOne({ username: assignment.assignedTo });
    if (assignedWorker) {
      await Worker.updateOne({ _id: assignedWorker._id }, { $set: { status: 'idle' } }, { runValidators: false });
    }
  }

    // If unresolved, log audit for higher authority with admin and worker details
    if (!completed) {
      let adminUsername = assignment.assignedBy || 'unknown_admin';
      let workerInfo = null;
      if (assignment.assignedTo) {
        const wrk = await Worker.findOne({ username: assignment.assignedTo });
        if (wrk) {
          workerInfo = { id: wrk._id, username: wrk.username, workerId: wrk.workerId, name: wrk.name };
        }
      }
      await new AuditLog({
        reportId: assignment.reportId,
        action: 'unresolved_escalate',
        actor: req.session.username,
        payload: { admin: { username: adminUsername }, worker: workerInfo }
      }).save();
    }

    res.json({ message: completed ? 'completed' : 'unresolved' });
  } catch (err) {
    next(err);
  }
}

module.exports = { upload, register, login, logout, listMyAssignments, resolveAssignment };

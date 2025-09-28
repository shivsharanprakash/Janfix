const Report = require('../models/Report');
const { findNearbyDuplicates } = require('../services/duplicateService');
const { routeReport } = require('../services/routingService');
const { makePoint, detectWard } = require('../utils/geoUtils');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ensure upload dir exists
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const name = `${Date.now()}-${file.originalname.replace(/\s+/g,'_')}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

async function checkDuplicate(req, res, next) {
  try {
    const { lat, lng, category, radiusMeters, days } = req.query;
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!category || Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      return res.status(400).json({ error: 'category, lat, lng required' });
    }
    const temp = {
      _id: 'temp',
      category,
      location: makePoint(lngNum, latNum)
    };
    const nearby = await findNearbyDuplicates(temp, parseInt(radiusMeters || '100'), parseInt(days || '7'));
    // Return minimal fields for UI
    const data = nearby.map(r => ({
      _id: r._id,
      category: r.category,
      description: r.description,
      createdAt: r.createdAt,
      status: r.status
    }));
    res.json({ count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function createReport(req, res, next) {
  try {
    // fields: category, description, lat, lng, reporterName, phone
    const { category, description, lat, lng, reporterName, phone } = req.body;
    if (!category || !lat || !lng) {
      return res.status(400).json({ error: 'category, lat, lng required' });
    }

    const report = new Report({
      reporterName,
      phone,
      category,
      description,
      location: makePoint(parseFloat(lng), parseFloat(lat))
    });

    // attach files if any
    if (req.files && req.files.length) {
      report.media = req.files.map(f => ({
        url: `/uploads/${f.filename}`,
        filename: f.filename,
        type: f.mimetype.startsWith('video') ? 'video' : 'image'
      }));
    }

    await report.save();

    // Duplicate detection
    const duplicates = await findNearbyDuplicates(report, 100, 7);
    if (duplicates && duplicates.length) {
      report.duplicateOf = duplicates[0]._id;
      await report.save();
    }

    // Ward detection (stub)
    const wardId = detectWard(report.location.coordinates[0], report.location.coordinates[1]);

    // Routing (create assignment)
    const assignment = await routeReport(report, wardId);

    // Create audit log entry (simple)
    const AuditLog = require('../models/AuditLog');
    await new AuditLog({
      reportId: report._id,
      action: 'report_created',
      actor: reporterName || phone || 'anonymous',
      payload: { assignmentCreated: !!assignment }
    }).save();

    res.status(201).json({ id: report._id, duplicate: !!report.duplicateOf, assignmentId: assignment ? assignment._id : null });
  } catch (err) {
    next(err);
  }
}

async function listReports(req, res, next) {
  try {
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '20');
    const skip = (page - 1) * limit;
    const q = {};
    const rawCategory = req.query.category;
    if (rawCategory) {
      const s = String(rawCategory || '').trim().toLowerCase();
      let cat = s;
      if (/(poth|pathole|road)/.test(s)) cat = 'pothole';
      else if (/(garbage|waste|sanitation|dustbin)/.test(s)) cat = 'garbage';
      else if (/(street.?light|lighting|lamp|light|street)/.test(s)) cat = 'streetlight';
      else if (/(sewage|sewer|drain)/.test(s)) cat = 'sewage';
      else if (/(water|waterlog|flood)/.test(s)) cat = 'water';
      q.category = cat;
    }
    const reports = await Report.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.json({ page, limit, data: reports });
  } catch (err) {
    next(err);
  }
}

async function getReport(req, res, next) {
  try {
    const id = req.params.id;
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ error: 'Not found' });
    // enrich with assignment due date and stage
    const Assignment = require('../models/Assignment');
    const a = await Assignment.findOne({ reportId: id }).lean();
    const obj = report.toObject();
    obj.stage = report.stage;
    obj.dueDate = a?.slaDeadline || null;
    obj.assignmentStatus = a?.status || null;
    res.json(obj);
  } catch (err) {
    next(err);
  }
}

// ML hooks can be added here in future within request handlers, not at top-level.



module.exports = { upload, createReport, listReports, getReport, checkDuplicate };

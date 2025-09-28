const cron = require('node-cron');
const Assignment = require('../models/Assignment');
const AuditLog = require('../models/AuditLog');
const Report = require('../models/Report');
const fs = require('fs');
const path = require('path');

function start() {
  const cronExpr = process.env.SLA_CHECK_CRON || '*/5 * * * *'; // every 5 minutes
  cron.schedule(cronExpr, async () => {
    try {
      console.log('SLA Cron running...');
      const now = new Date();
      const overdue = await Assignment.find({ slaDeadline: { $lt: now }, status: { $nin: ['resolved', 'escalated'] } });
      for (const a of overdue) {
        // attach escalation audit log
        await new AuditLog({
          reportId: a.reportId,
          action: 'sla_overdue',
          actor: 'system',
          payload: { assignmentId: a._id, slaDeadline: a.slaDeadline, assignedTo: a.assignedTo, departmentId: a.departmentId }
        }).save();
        // mark assignment with escalation (you could update assignment)
        a.status = 'escalated';
        await a.save();
        console.log('Escalated assignment', a._id);
      }

      // Cleanup: delete resolved reports older than 24 hours
      const cutoff = new Date(Date.now() - 48 * 3600 * 1000);
      const oldResolved = await Report.find({ status: 'resolved', updatedAt: { $lt: cutoff } });
      for (const r of oldResolved) {
        try {
          // Delete related assignments
          await Assignment.deleteMany({ reportId: r._id });
          // Delete related audit logs
          await AuditLog.deleteMany({ reportId: r._id });
          // Delete media files
          const media = [...(r.media || []), ...(r.fixedMedia || [])];
          for (const m of media) {
            if (m && m.filename) {
              const p = path.join(process.env.UPLOAD_DIR || './uploads', m.filename);
              fs.unlink(p, () => {});
            }
          }
          // Finally delete the report
          await Report.deleteOne({ _id: r._id });
          console.log('Deleted resolved report', r._id);
        } catch (err) {
          console.error('Cleanup error for report', r._id, err);
        }
      }
    } catch (err) {
      console.error('SLA Cron error:', err);
    }
  });
}

module.exports = { start };

function ensureAdmin(req, res, next) {
    if (req.session && req.session.adminId) {
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
function ensureWorker(req, res, next) {
  if (req.session && req.session.workerId) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

module.exports = { ensureAdmin, ensureWorker };
  
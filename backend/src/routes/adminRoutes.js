const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const adminApi = require('../controllers/adminApiController');
const { ensureAdmin } = require('../middleware/sessionAuth');

// auth
router.post('/login', adminController.login);
router.post('/logout', adminController.logout);

// protected admin APIs (prefixed with /admin)
router.get('/dashboard', ensureAdmin, adminApi.dashboard);
router.get('/reports', ensureAdmin, adminApi.adminListReports);
router.post('/assign', ensureAdmin, adminApi.assignReport);

router.post('/departments', ensureAdmin, adminApi.createDepartment);
router.get('/departments', ensureAdmin, adminApi.listDepartments);

router.post('/routing-rules', ensureAdmin, adminApi.createRoutingRule);
router.get('/routing-rules', ensureAdmin, adminApi.listRoutingRules);

module.exports = router;

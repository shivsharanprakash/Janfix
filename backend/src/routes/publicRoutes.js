const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// file upload middleware
const uploadMiddleware = reportController.upload.array('files', 5);

router.post('/reports', uploadMiddleware, reportController.createReport);
router.get('/reports', reportController.listReports);
router.get('/reports/:id', reportController.getReport);
router.get('/reports/duplicate-check', reportController.checkDuplicate);

module.exports = router;

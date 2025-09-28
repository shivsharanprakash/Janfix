const express = require('express');
const router = express.Router();
const worker = require('../controllers/workerController');
const { ensureWorker } = require('../middleware/sessionAuth');

router.post('/register', worker.register);
router.post('/login', worker.login);
router.post('/logout', worker.logout);

router.get('/assignments', ensureWorker, worker.listMyAssignments);
router.post('/resolve', ensureWorker, worker.upload.single('fixedImage'), worker.resolveAssignment);

module.exports = router;






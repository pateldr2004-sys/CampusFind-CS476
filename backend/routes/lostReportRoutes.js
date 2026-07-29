const express = require('express');
const {
  createLostReport,
  getMyLostReports,
  lookupStatus,
  listLostReports,
  updateLostReportStatus
} = require('../controllers/lostReportController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const { uploadLostItemPhoto } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/status', lookupStatus);
router.post('/', protect, requireRole('user', 'admin'), uploadLostItemPhoto.single('file'), createLostReport);
router.get('/mine', protect, requireRole('user', 'admin'), getMyLostReports);
router.get('/', protect, requireRole('admin'), listLostReports);
router.patch('/:id/status', protect, requireRole('admin'), updateLostReportStatus);

module.exports = router;

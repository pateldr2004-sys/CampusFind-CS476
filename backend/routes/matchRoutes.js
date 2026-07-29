const express = require('express');
const { listMatches, confirmMatch, rejectMatch } = require('../controllers/matchController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, requireRole('admin'), listMatches);
router.patch('/:id/confirm', protect, requireRole('admin'), confirmMatch);
router.patch('/:id/reject', protect, requireRole('admin'), rejectMatch);

module.exports = router;

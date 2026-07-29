const express = require('express');
const { releaseMatchedItem } = require('../controllers/releaseController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/:matchId', protect, requireRole('admin'), releaseMatchedItem);

module.exports = router;

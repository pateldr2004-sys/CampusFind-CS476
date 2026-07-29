const express = require('express');
const { createFoundItem, listFoundItems, updateFoundItemStatus } = require('../controllers/foundItemController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, requireRole('admin'), createFoundItem);
router.get('/', protect, requireRole('admin'), listFoundItems);
router.patch('/:id/status', protect, requireRole('admin'), updateFoundItemStatus);

module.exports = router;

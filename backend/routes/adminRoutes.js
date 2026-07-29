const express = require('express');
const { getDashboard } = require('../controllers/adminController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', protect, requireRole('admin'), getDashboard);

module.exports = router;

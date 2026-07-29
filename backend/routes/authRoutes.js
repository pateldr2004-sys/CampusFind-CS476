const express = require('express');
const { signup, login, adminLogin, me } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { uploadPhotoId } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/signup', uploadPhotoId.single('file'), signup);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.get('/me', protect, me);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  getAllUsers,
  updateUserStatus
} = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

// Admin-only user management
router.get('/users', authenticate, authorize('administrator'), getAllUsers);
router.patch('/users/:id', authenticate, authorize('administrator'), updateUserStatus);

module.exports = router;

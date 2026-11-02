const express = require('express');
const router = express.Router();
const {
  getNotifications,
  createNotification,
  markAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getNotifications);
router.post('/', authenticate, authorize('administrator'), createNotification);
router.patch('/:id/read', authenticate, markAsRead);
router.delete('/:id', authenticate, authorize('administrator'), deleteNotification);

module.exports = router;

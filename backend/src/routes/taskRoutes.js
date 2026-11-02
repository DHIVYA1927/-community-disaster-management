const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  acceptTask,
  updateTaskProgress
} = require('../controllers/taskController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getTasks);
router.get('/:id', authenticate, getTaskById);
router.post('/', authenticate, authorize('administrator'), createTask);
router.patch('/:id/accept', authenticate, authorize('volunteer', 'administrator'), acceptTask);
router.patch('/:id/progress', authenticate, authorize('volunteer', 'administrator'), updateTaskProgress);

module.exports = router;

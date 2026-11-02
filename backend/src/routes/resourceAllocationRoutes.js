const express = require('express');
const router = express.Router();
const {
  getAllocations,
  createAllocation,
  updateAllocationStatus
} = require('../controllers/resourceAllocationController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getAllocations);
router.post('/', authenticate, authorize('administrator'), createAllocation);
router.patch('/:id/status', authenticate, authorize('administrator', 'volunteer'), updateAllocationStatus);

module.exports = router;

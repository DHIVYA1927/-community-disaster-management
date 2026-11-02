const express = require('express');
const router = express.Router();
const {
  getEmergencyRequests,
  getEmergencyRequestById,
  createEmergencyRequest,
  assignVolunteer,
  updateRequestStatus
} = require('../controllers/emergencyRequestController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getEmergencyRequests);
router.get('/:id', authenticate, getEmergencyRequestById);
router.post('/', authenticate, createEmergencyRequest);
router.patch('/:id/assign', authenticate, authorize('administrator', 'volunteer'), assignVolunteer);
router.patch('/:id/status', authenticate, authorize('administrator', 'volunteer'), updateRequestStatus);

module.exports = router;

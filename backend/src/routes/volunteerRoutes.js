const express = require('express');
const router = express.Router();
const {
  getVolunteers,
  getMyVolunteerProfile,
  updateVolunteer
} = require('../controllers/volunteerController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getVolunteers);
router.get('/me', authenticate, authorize('volunteer', 'administrator'), getMyVolunteerProfile);
router.patch('/:id', authenticate, authorize('volunteer', 'administrator'), updateVolunteer);

module.exports = router;

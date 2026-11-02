const express = require('express');
const router = express.Router();
const {
  getShelters,
  getShelterById,
  createShelter,
  updateShelter,
  deleteShelter
} = require('../controllers/shelterController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getShelters);
router.get('/:id', authenticate, getShelterById);
router.post('/', authenticate, authorize('administrator'), createShelter);
router.put('/:id', authenticate, authorize('administrator'), updateShelter);
router.delete('/:id', authenticate, authorize('administrator'), deleteShelter);

module.exports = router;

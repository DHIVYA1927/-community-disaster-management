const express = require('express');
const router = express.Router();
const {
  getDisasters,
  getDisasterById,
  createDisaster,
  updateDisasterStatus,
  deleteDisaster
} = require('../controllers/disasterController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getDisasters);
router.get('/:id', getDisasterById);
router.post('/', authenticate, upload.single('image'), createDisaster);
router.patch('/:id/status', authenticate, authorize('administrator'), updateDisasterStatus);
router.delete('/:id', authenticate, authorize('administrator'), deleteDisaster);

module.exports = router;

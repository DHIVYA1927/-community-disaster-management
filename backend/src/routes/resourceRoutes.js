const express = require('express');
const router = express.Router();
const {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource
} = require('../controllers/resourceController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getResources);
router.get('/:id', authenticate, getResourceById);
router.post('/', authenticate, authorize('administrator'), createResource);
router.put('/:id', authenticate, authorize('administrator'), updateResource);
router.delete('/:id', authenticate, authorize('administrator'), deleteResource);

module.exports = router;

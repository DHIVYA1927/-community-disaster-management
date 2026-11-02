const Resource = require('../models/Resource');

// @desc Get all resources with category and status filter
// @route GET /api/resources
exports.getResources = async (req, res, next) => {
  try {
    const { category, status, search } = req.query;
    let query = {};

    if (category && category !== 'All') query.category = category;
    if (status && status !== 'All') query.distributionStatus = status;

    if (search) {
      query.$or = [
        { resourceName: { $regex: search, $options: 'i' } },
        { storageLocation: { $regex: search, $options: 'i' } }
      ];
    }

    const resources = await Resource.find(query).sort({ category: 1, resourceName: 1 });

    // Calculate totals
    const totals = {
      totalAvailable: 0,
      totalAllocated: 0,
      totalRequired: 0,
      lowStockCount: 0
    };

    resources.forEach((r) => {
      totals.totalAvailable += r.availableQuantity || 0;
      totals.totalAllocated += r.allocatedQuantity || 0;
      totals.totalRequired += r.requiredQuantity || 0;
      if (r.distributionStatus === 'Low-Stock' || r.distributionStatus === 'Out-of-Stock') {
        totals.lowStockCount++;
      }
    });

    res.status(200).json({
      success: true,
      count: resources.length,
      totals,
      resources
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single resource
// @route GET /api/resources/:id
exports.getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource item not found' });
    }

    res.status(200).json({
      success: true,
      resource
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create a new resource inventory entry (Admin only)
// @route POST /api/resources
exports.createResource = async (req, res, next) => {
  try {
    const {
      resourceName,
      category,
      unit,
      availableQuantity,
      requiredQuantity,
      storageLocation,
      minimumThreshold
    } = req.body;

    const resource = await Resource.create({
      resourceName,
      category,
      unit: unit || 'Units',
      availableQuantity: Number(availableQuantity) || 0,
      requiredQuantity: Number(requiredQuantity) || 0,
      allocatedQuantity: 0,
      storageLocation: storageLocation || 'Central Warehouse',
      minimumThreshold: Number(minimumThreshold) || 20
    });

    res.status(201).json({
      success: true,
      message: 'Resource item added to inventory.',
      resource
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update resource inventory details (Admin only)
// @route PUT /api/resources/:id
exports.updateResource = async (req, res, next) => {
  try {
    const {
      resourceName,
      category,
      unit,
      availableQuantity,
      requiredQuantity,
      storageLocation,
      minimumThreshold
    } = req.body;

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    if (resourceName) resource.resourceName = resourceName;
    if (category) resource.category = category;
    if (unit) resource.unit = unit;
    if (availableQuantity !== undefined) resource.availableQuantity = Number(availableQuantity);
    if (requiredQuantity !== undefined) resource.requiredQuantity = Number(requiredQuantity);
    if (storageLocation) resource.storageLocation = storageLocation;
    if (minimumThreshold !== undefined) resource.minimumThreshold = Number(minimumThreshold);

    await resource.save();

    res.status(200).json({
      success: true,
      message: 'Resource updated successfully.',
      resource
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete resource (Admin only)
// @route DELETE /api/resources/:id
exports.deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    await resource.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Resource removed from inventory.'
    });
  } catch (error) {
    next(error);
  }
};

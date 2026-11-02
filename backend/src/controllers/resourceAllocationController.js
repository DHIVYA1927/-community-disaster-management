const ResourceAllocation = require('../models/ResourceAllocation');
const Resource = require('../models/Resource');
const Notification = require('../models/Notification');

// @desc Get all resource allocations
// @route GET /api/allocations
exports.getAllocations = async (req, res, next) => {
  try {
    const { status, disasterId, shelterId, search } = req.query;
    let query = {};

    if (status && status !== 'All') query.status = status;
    if (disasterId) query.disaster = disasterId;
    if (shelterId) query.shelter = shelterId;

    const allocations = await ResourceAllocation.find(query)
      .populate('resource', 'resourceName category unit availableQuantity storageLocation')
      .populate('disaster', 'title disasterType severityLevel location')
      .populate('emergencyRequest', 'requestType description urgencyLevel location')
      .populate('shelter', 'name address capacity currentOccupancy')
      .populate('allocatedBy', 'name email role')
      .sort({ createdAt: -1 });

    let filtered = allocations;
    if (search) {
      filtered = allocations.filter(
        (a) =>
          (a.resource && a.resource.resourceName.toLowerCase().includes(search.toLowerCase())) ||
          (a.purpose && a.purpose.toLowerCase().includes(search.toLowerCase()))
      );
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      allocations: filtered
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create resource allocation (Admin only)
// @route POST /api/allocations
exports.createAllocation = async (req, res, next) => {
  try {
    const {
      resourceId,
      disasterId,
      emergencyRequestId,
      shelterId,
      allocatedQuantity,
      purpose,
      priority,
      notes
    } = req.body;

    const qty = Number(allocatedQuantity);
    if (!qty || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Allocation quantity must be greater than 0.' });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource item not found.' });
    }

    if (resource.availableQuantity < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock! Only ${resource.availableQuantity} ${resource.unit} available in inventory.`
      });
    }

    // Deduct available, increment allocated
    resource.availableQuantity -= qty;
    resource.allocatedQuantity += qty;
    await resource.save();

    const allocation = await ResourceAllocation.create({
      resource: resourceId,
      disaster: disasterId || null,
      emergencyRequest: emergencyRequestId || null,
      shelter: shelterId || null,
      allocatedQuantity: qty,
      allocatedBy: req.user._id,
      purpose: purpose || 'Disaster relief distribution',
      priority: priority || 'High',
      status: 'Allocated',
      notes: notes || ''
    });

    // Notify volunteers/citizens of relief dispatch
    await Notification.create({
      title: `📦 Resources Allocated: ${qty} ${resource.unit} of ${resource.resourceName}`,
      message: `Allocated for: ${purpose}. Status: Allocated for dispatch.`,
      type: 'Resource Allocation',
      severity: priority === 'Critical' ? 'High' : 'Info',
      isBroadcast: true
    });

    const populated = await ResourceAllocation.findById(allocation._id)
      .populate('resource')
      .populate('disaster', 'title disasterType')
      .populate('shelter', 'name address')
      .populate('allocatedBy', 'name email');

    res.status(201).json({
      success: true,
      message: `${qty} ${resource.unit} allocated successfully. Inventory updated.`,
      allocation: populated,
      updatedResource: resource
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update allocation status (Admin or Volunteer updating distribution)
// @route PATCH /api/allocations/:id/status
exports.updateAllocationStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const allocation = await ResourceAllocation.findById(req.params.id).populate('resource');

    if (!allocation) {
      return res.status(404).json({ success: false, message: 'Allocation record not found.' });
    }

    const oldStatus = allocation.status;

    // If cancelled, restore quantity to available inventory
    if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
      const resource = await Resource.findById(allocation.resource._id);
      if (resource) {
        resource.availableQuantity += allocation.allocatedQuantity;
        resource.allocatedQuantity = Math.max(0, resource.allocatedQuantity - allocation.allocatedQuantity);
        await resource.save();
      }
    }

    allocation.status = status || allocation.status;
    if (notes) allocation.notes = notes;
    if (status === 'Delivered') {
      allocation.deliveryDate = new Date();
    }

    await allocation.save();

    const updated = await ResourceAllocation.findById(allocation._id)
      .populate('resource')
      .populate('disaster', 'title')
      .populate('shelter', 'name');

    res.status(200).json({
      success: true,
      message: `Resource allocation status updated to ${allocation.status}`,
      allocation: updated
    });
  } catch (error) {
    next(error);
  }
};

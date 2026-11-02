const EmergencyRequest = require('../models/EmergencyRequest');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

// @desc Get all emergency requests
// @route GET /api/emergency-requests
exports.getEmergencyRequests = async (req, res, next) => {
  try {
    const { status, urgency, requestType, citizenId, search } = req.query;
    let query = {};

    if (status && status !== 'All') query.status = status;
    if (urgency && urgency !== 'All') query.urgencyLevel = urgency;
    if (requestType && requestType !== 'All') query.requestType = requestType;

    // If citizen requests their own, or filtered
    if (citizenId) {
      query.citizenId = citizenId;
    } else if (req.user && req.user.role === 'citizen') {
      // Citizens view their own requests by default
      query.citizenId = req.user._id;
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
        { contactPhone: { $regex: search, $options: 'i' } }
      ];
    }

    const requests = await EmergencyRequest.find(query)
      .populate('citizenId', 'name email phone avatar')
      .populate('disasterId', 'title disasterType severityLevel location')
      .populate('assignedVolunteer', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single emergency request
// @route GET /api/emergency-requests/:id
exports.getEmergencyRequestById = async (req, res, next) => {
  try {
    const request = await EmergencyRequest.findById(req.params.id)
      .populate('citizenId', 'name email phone avatar')
      .populate('disasterId', 'title disasterType severityLevel location')
      .populate('assignedVolunteer', 'name email phone');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Emergency request not found' });
    }

    res.status(200).json({
      success: true,
      request
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create emergency request (Citizen or any user)
// @route POST /api/emergency-requests
exports.createEmergencyRequest = async (req, res, next) => {
  try {
    const {
      disasterId,
      requestType,
      urgencyLevel,
      description,
      peopleCount,
      address,
      coordinates,
      contactPhone
    } = req.body;

    let parsedCoords = [77.2090, 28.6139];
    if (coordinates) {
      if (typeof coordinates === 'string') {
        try {
          parsedCoords = JSON.parse(coordinates);
        } catch (e) {
          parsedCoords = [77.2090, 28.6139];
        }
      } else if (Array.isArray(coordinates)) {
        parsedCoords = coordinates;
      }
    }

    const request = await EmergencyRequest.create({
      disasterId: disasterId || null,
      citizenId: req.user._id,
      requestType: requestType || 'Rescue',
      urgencyLevel: urgencyLevel || 'High',
      description,
      peopleCount: Number(peopleCount) || 1,
      location: {
        address: address || 'Current Location',
        coordinates: parsedCoords
      },
      contactPhone: contactPhone || req.user.phone || '9999999999',
      status: 'Pending'
    });

    // Send broadcast notification for urgent requests
    if (['High', 'Critical'].includes(request.urgencyLevel)) {
      await Notification.create({
        title: `🆘 Emergency Request: ${request.requestType} Needed (${request.peopleCount} people)`,
        message: `${request.description.substring(0, 100)} at ${request.location.address}. Contact: ${request.contactPhone}`,
        type: 'Emergency Alert',
        severity: request.urgencyLevel === 'Critical' ? 'Critical' : 'High',
        isBroadcast: true,
        targetRole: 'all'
      });
    }

    const populated = await EmergencyRequest.findById(request._id)
      .populate('citizenId', 'name email phone')
      .populate('disasterId', 'title disasterType');

    res.status(201).json({
      success: true,
      message: 'Emergency help request submitted. Rescue teams have been alerted.',
      request: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc Assign volunteer or update emergency request status (Admin or Volunteer)
// @route PATCH /api/emergency-requests/:id/assign
exports.assignVolunteer = async (req, res, next) => {
  try {
    const { volunteerId, status, notes } = req.body;
    const request = await EmergencyRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (volunteerId) {
      request.assignedVolunteer = volunteerId;
      request.status = status || 'Assigned';

      // Automatically create a corresponding Task for this volunteer
      await Task.create({
        title: `Assist: ${request.requestType} for ${request.peopleCount} people`,
        description: request.description,
        emergencyRequest: request._id,
        disaster: request.disasterId,
        assignedVolunteer: volunteerId,
        priority: request.urgencyLevel,
        status: 'Assigned',
        location: {
          address: request.location.address,
          coordinates: request.location.coordinates
        },
        notes: notes || 'Assigned via Emergency Dispatch'
      });
    }

    if (status) request.status = status;
    if (notes) request.fulfillmentNotes = notes;

    await request.save();

    const updated = await EmergencyRequest.findById(request._id)
      .populate('citizenId', 'name email phone')
      .populate('assignedVolunteer', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Emergency request updated successfully',
      request: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update status (Admin or Volunteer self-accepting or completing)
// @route PATCH /api/emergency-requests/:id/status
exports.updateRequestStatus = async (req, res, next) => {
  try {
    const { status, fulfillmentNotes } = req.body;
    const request = await EmergencyRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (status) request.status = status;
    if (fulfillmentNotes) request.fulfillmentNotes = fulfillmentNotes;

    // If volunteer is accepting it directly
    if (req.user.role === 'volunteer' && !request.assignedVolunteer) {
      request.assignedVolunteer = req.user._id;
      request.status = 'In-Progress';
    }

    await request.save();

    const updated = await EmergencyRequest.findById(request._id)
      .populate('citizenId', 'name email phone')
      .populate('assignedVolunteer', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Emergency request status updated successfully',
      request: updated
    });
  } catch (error) {
    next(error);
  }
};

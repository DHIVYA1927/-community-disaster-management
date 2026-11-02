const Disaster = require('../models/Disaster');
const Notification = require('../models/Notification');

// @desc Get all disaster reports with filtering and search
// @route GET /api/disasters
exports.getDisasters = async (req, res, next) => {
  try {
    const { type, severity, status, search, limit } = req.query;
    let query = {};

    if (type && type !== 'All') query.disasterType = type;
    if (severity && severity !== 'All') query.severityLevel = severity;
    if (status && status !== 'All') query.status = status;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { incidentDescription: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } }
      ];
    }

    let mongoQuery = Disaster.find(query)
      .populate('reportedBy', 'name email phone avatar')
      .populate('verifiedBy', 'name email role')
      .sort({ reportDateTime: -1 });

    if (limit) {
      mongoQuery = mongoQuery.limit(parseInt(limit));
    }

    const disasters = await mongoQuery;

    res.status(200).json({
      success: true,
      count: disasters.length,
      disasters
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single disaster report
// @route GET /api/disasters/:id
exports.getDisasterById = async (req, res, next) => {
  try {
    const disaster = await Disaster.findById(req.params.id)
      .populate('reportedBy', 'name email phone avatar')
      .populate('verifiedBy', 'name email role');

    if (!disaster) {
      return res.status(404).json({ success: false, message: 'Disaster report not found' });
    }

    res.status(200).json({
      success: true,
      disaster
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create a disaster report (Citizen or any authenticated user)
// @route POST /api/disasters
exports.createDisaster = async (req, res, next) => {
  try {
    const {
      title,
      disasterType,
      incidentDescription,
      address,
      city,
      state,
      coordinates,
      affectedPeople,
      severityLevel,
      imageUrl
    } = req.body;

    let finalImageUrl = imageUrl || '';
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }

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

    const disaster = await Disaster.create({
      title: title || `${disasterType || 'Disaster'} Alert at ${address || 'Local Region'}`,
      disasterType: disasterType || 'Flood',
      incidentDescription,
      location: {
        address: address || 'Community Area',
        city: city || '',
        state: state || '',
        coordinates: parsedCoords
      },
      affectedPeople: Number(affectedPeople) || 0,
      severityLevel: severityLevel || 'Medium',
      status: req.user.role === 'administrator' ? 'Verified' : 'Pending',
      imageUrl: finalImageUrl,
      reportedBy: req.user._id,
      verifiedBy: req.user.role === 'administrator' ? req.user._id : null,
      verifiedAt: req.user.role === 'administrator' ? new Date() : null,
      reportDateTime: new Date()
    });

    // If critical or high, generate auto notification
    if (['Critical', 'High'].includes(disaster.severityLevel)) {
      await Notification.create({
        title: `🚨 ${disaster.severityLevel.toUpperCase()} ALERT: ${disaster.disasterType} Reported`,
        message: `${disaster.incidentDescription.substring(0, 150)}... Location: ${disaster.location.address}`,
        type: 'Emergency Alert',
        severity: disaster.severityLevel === 'Critical' ? 'Critical' : 'High',
        isBroadcast: true,
        link: `/disasters/${disaster._id}`
      });
    }

    const populated = await Disaster.findById(disaster._id).populate('reportedBy', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Disaster report submitted successfully.',
      disaster: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update disaster report status and verification (Admin only)
// @route PATCH /api/disasters/:id/status
exports.updateDisasterStatus = async (req, res, next) => {
  try {
    const { status, severityLevel } = req.body;
    const disaster = await Disaster.findById(req.params.id);

    if (!disaster) {
      return res.status(404).json({ success: false, message: 'Disaster report not found' });
    }

    if (status) {
      disaster.status = status;
      if (status === 'Verified') {
        disaster.verifiedBy = req.user._id;
        disaster.verifiedAt = new Date();
      }
    }

    if (severityLevel) {
      disaster.severityLevel = severityLevel;
    }

    await disaster.save();

    const updated = await Disaster.findById(disaster._id)
      .populate('reportedBy', 'name email phone avatar')
      .populate('verifiedBy', 'name email');

    res.status(200).json({
      success: true,
      message: `Disaster report status updated to ${disaster.status}`,
      disaster: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete disaster report (Admin only)
// @route DELETE /api/disasters/:id
exports.deleteDisaster = async (req, res, next) => {
  try {
    const disaster = await Disaster.findById(req.params.id);
    if (!disaster) {
      return res.status(404).json({ success: false, message: 'Disaster report not found' });
    }

    await disaster.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Disaster report deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

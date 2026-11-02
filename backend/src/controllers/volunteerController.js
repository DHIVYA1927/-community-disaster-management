const Volunteer = require('../models/Volunteer');
const User = require('../models/User');
const Task = require('../models/Task');
const EmergencyRequest = require('../models/EmergencyRequest');

// @desc Get all volunteers (Admin/Coordination)
// @route GET /api/volunteers
exports.getVolunteers = async (req, res, next) => {
  try {
    const { status, skill, search } = req.query;
    let query = {};

    if (status && status !== 'All') query.availabilityStatus = status;
    if (skill && skill !== 'All') query.skills = { $in: [skill] };

    const volunteers = await Volunteer.find(query)
      .populate('user', 'name email phone avatar status')
      .sort({ totalTasksCompleted: -1 });

    let filtered = volunteers;
    if (search) {
      filtered = volunteers.filter(
        (v) =>
          (v.user && v.user.name.toLowerCase().includes(search.toLowerCase())) ||
          (v.user && v.user.email.toLowerCase().includes(search.toLowerCase())) ||
          (v.address && v.address.toLowerCase().includes(search.toLowerCase()))
      );
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      volunteers: filtered
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get current volunteer profile & stats
// @route GET /api/volunteers/me
exports.getMyVolunteerProfile = async (req, res, next) => {
  try {
    let volunteer = await Volunteer.findOne({ user: req.user._id }).populate('user', 'name email phone avatar');

    if (!volunteer && req.user.role === 'volunteer') {
      volunteer = await Volunteer.create({
        user: req.user._id,
        contactNumber: req.user.phone || '',
        address: req.user.address || ''
      });
      volunteer = await Volunteer.findById(volunteer._id).populate('user', 'name email phone avatar');
    }

    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer record not found' });
    }

    // Get assigned active tasks
    const activeTasks = await Task.find({
      assignedVolunteer: req.user._id,
      status: { $in: ['Assigned', 'In-Progress'] }
    }).populate('emergencyRequest disaster');

    // Get completed tasks
    const completedTasks = await Task.find({
      assignedVolunteer: req.user._id,
      status: 'Completed'
    });

    res.status(200).json({
      success: true,
      volunteer,
      activeTasks,
      completedCount: completedTasks.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update volunteer status or skills
// @route PATCH /api/volunteers/:id
exports.updateVolunteer = async (req, res, next) => {
  try {
    const { availabilityStatus, skills, bloodGroup, badge, contactNumber, address, coordinates } = req.body;
    const volunteer = await Volunteer.findById(req.params.id);

    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer record not found' });
    }

    if (availabilityStatus) volunteer.availabilityStatus = availabilityStatus;
    if (skills) volunteer.skills = skills;
    if (bloodGroup) volunteer.bloodGroup = bloodGroup;
    if (badge) volunteer.badge = badge;
    if (contactNumber) volunteer.contactNumber = contactNumber;
    if (address) volunteer.address = address;
    if (coordinates) volunteer.location.coordinates = coordinates;

    await volunteer.save();

    res.status(200).json({
      success: true,
      message: 'Volunteer profile updated',
      volunteer
    });
  } catch (error) {
    next(error);
  }
};

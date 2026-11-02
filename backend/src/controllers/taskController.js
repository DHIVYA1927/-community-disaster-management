const Task = require('../models/Task');
const Volunteer = require('../models/Volunteer');
const EmergencyRequest = require('../models/EmergencyRequest');

// @desc Get all tasks (Filtered by volunteer or status)
// @route GET /api/tasks
exports.getTasks = async (req, res, next) => {
  try {
    const { status, priority, volunteerId, search } = req.query;
    let query = {};

    if (status && status !== 'All') query.status = status;
    if (priority && priority !== 'All') query.priority = priority;

    if (volunteerId) {
      query.assignedVolunteer = volunteerId;
    } else if (req.user.role === 'volunteer') {
      // Allow volunteer to see either unassigned tasks or tasks assigned to them
      const viewScope = req.query.scope; // 'available' or 'mine'
      if (viewScope === 'available') {
        query.assignedVolunteer = null;
        query.status = 'Assigned';
      } else {
        query.assignedVolunteer = req.user._id;
      }
    }

    let tasks = await Task.find(query)
      .populate('assignedVolunteer', 'name email phone avatar')
      .populate('disaster', 'title disasterType severityLevel location')
      .populate('emergencyRequest', 'requestType peopleCount description contactPhone location')
      .sort({ createdAt: -1 });

    if (search) {
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase()) ||
          (t.location && t.location.address && t.location.address.toLowerCase().includes(search.toLowerCase()))
      );
    }

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single task
// @route GET /api/tasks/:id
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedVolunteer', 'name email phone avatar')
      .populate('disaster')
      .populate('emergencyRequest')
      .populate('progressUpdates.updatedBy', 'name role');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create a new task (Admin only)
// @route POST /api/tasks
exports.createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      emergencyRequestId,
      disasterId,
      assignedVolunteerId,
      priority,
      address,
      coordinates,
      notes
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

    const task = await Task.create({
      title,
      description,
      emergencyRequest: emergencyRequestId || null,
      disaster: disasterId || null,
      assignedVolunteer: assignedVolunteerId || null,
      priority: priority || 'High',
      status: 'Assigned',
      location: {
        address: address || '',
        coordinates: parsedCoords
      },
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      message: 'Rescue task created and dispatched.',
      task
    });
  } catch (error) {
    next(error);
  }
};

// @desc Volunteer accepts a task
// @route PATCH /api/tasks/:id/accept
exports.acceptTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.assignedVolunteer = req.user._id;
    task.status = 'In-Progress';
    task.progressUpdates.push({
      updateText: `Task accepted by volunteer ${req.user.name}. Deployment underway.`,
      timestamp: new Date(),
      updatedBy: req.user._id
    });

    await task.save();

    // If associated with emergency request, update that too
    if (task.emergencyRequest) {
      await EmergencyRequest.findByIdAndUpdate(task.emergencyRequest, {
        assignedVolunteer: req.user._id,
        status: 'In-Progress'
      });
    }

    // Update volunteer availability to On-Mission
    await Volunteer.findOneAndUpdate(
      { user: req.user._id },
      { availabilityStatus: 'On-Mission' }
    );

    res.status(200).json({
      success: true,
      message: 'Task accepted successfully! You are now deployed.',
      task
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update task progress and status (Volunteer or Admin)
// @route PATCH /api/tasks/:id/progress
exports.updateTaskProgress = async (req, res, next) => {
  try {
    const { status, updateText, notes } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const wasCompleted = task.status === 'Completed';

    if (status) task.status = status;
    if (notes) task.notes = notes;

    if (updateText) {
      task.progressUpdates.push({
        updateText,
        timestamp: new Date(),
        updatedBy: req.user._id
      });
    }

    if (status === 'Completed' && !wasCompleted) {
      task.completedAt = new Date();

      // Update volunteer total completed tasks and availability
      if (task.assignedVolunteer) {
        await Volunteer.findOneAndUpdate(
          { user: task.assignedVolunteer },
          {
            $inc: { totalTasksCompleted: 1 },
            availabilityStatus: 'Available'
          }
        );
      }

      // If tied to emergency request, mark fulfilled
      if (task.emergencyRequest) {
        await EmergencyRequest.findByIdAndUpdate(task.emergencyRequest, {
          status: 'Fulfilled',
          fulfillmentNotes: `Completed via task: ${task.title}`
        });
      }
    }

    await task.save();

    res.status(200).json({
      success: true,
      message: `Task progress updated (${task.status})`,
      task
    });
  } catch (error) {
    next(error);
  }
};

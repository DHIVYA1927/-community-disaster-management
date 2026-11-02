const Disaster = require('../models/Disaster');
const EmergencyRequest = require('../models/EmergencyRequest');
const Volunteer = require('../models/Volunteer');
const Resource = require('../models/Resource');
const ResourceAllocation = require('../models/ResourceAllocation');
const Shelter = require('../models/Shelter');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc Get comprehensive dashboard statistics & analytics
// @route GET /api/dashboard/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalDisasters,
      activeEmergencies,
      totalVolunteers,
      pendingRequests,
      resources,
      allocations,
      activeShelters,
      recentDisasters,
      recentRequests,
      recentTasks
    ] = await Promise.all([
      Disaster.countDocuments(),
      Disaster.countDocuments({ status: { $in: ['Pending', 'Verified', 'In-Progress'] } }),
      Volunteer.countDocuments(),
      EmergencyRequest.countDocuments({ status: 'Pending' }),
      Resource.find(),
      ResourceAllocation.find(),
      Shelter.countDocuments({ status: { $in: ['Active', 'Near Full'] } }),
      Disaster.find().sort({ createdAt: -1 }).limit(5).populate('reportedBy', 'name email'),
      EmergencyRequest.find().sort({ createdAt: -1 }).limit(5).populate('citizenId', 'name phone'),
      Task.find().sort({ createdAt: -1 }).limit(5).populate('assignedVolunteer', 'name').populate('disaster', 'title')
    ]);

    // Resource totals
    let availableResourcesCount = 0;
    let distributedResourcesCount = 0;
    const categoryBreakdown = {};

    resources.forEach((r) => {
      availableResourcesCount += r.availableQuantity || 0;
      distributedResourcesCount += r.allocatedQuantity || 0;

      if (!categoryBreakdown[r.category]) {
        categoryBreakdown[r.category] = { category: r.category, available: 0, allocated: 0 };
      }
      categoryBreakdown[r.category].available += r.availableQuantity || 0;
      categoryBreakdown[r.category].allocated += r.allocatedQuantity || 0;
    });

    // Disaster Severity Breakdown
    const severityCounts = await Disaster.aggregate([
      { $group: { _id: '$severityLevel', count: { $sum: 1 } } }
    ]);

    // Disaster Type Breakdown
    const typeCounts = await Disaster.aggregate([
      { $group: { _id: '$disasterType', count: { $sum: 1 } } }
    ]);

    // Emergency Request Status Breakdown
    const requestStatusCounts = await EmergencyRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Task Status Breakdown
    const taskStatusCounts = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalDisasters,
        activeEmergencies,
        totalVolunteers,
        pendingRequests,
        availableResources: availableResourcesCount,
        resourcesDistributed: distributedResourcesCount,
        activeReliefCamps: activeShelters
      },
      charts: {
        resourceDistribution: Object.values(categoryBreakdown),
        disasterSeverity: severityCounts.map((s) => ({ severity: s._id, count: s.count })),
        disasterTypes: typeCounts.map((t) => ({ type: t._id, count: t.count })),
        requestStatus: requestStatusCounts.map((r) => ({ status: r._id, count: r.count })),
        taskStatus: taskStatusCounts.map((t) => ({ status: t._id, count: t.count }))
      },
      recentData: {
        recentDisasters,
        recentRequests,
        recentTasks
      }
    });
  } catch (error) {
    next(error);
  }
};

const Notification = require('../models/Notification');

// @desc Get notifications & alerts
// @route GET /api/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const { type, severity, limit } = req.query;
    let query = {
      $or: [
        { isBroadcast: true },
        { recipient: req.user ? req.user._id : null }
      ]
    };

    if (type && type !== 'All') query.type = type;
    if (severity && severity !== 'All') query.severity = severity;

    let mongoQuery = Notification.find(query).sort({ createdAt: -1 });
    if (limit) mongoQuery = mongoQuery.limit(parseInt(limit));

    const notifications = await mongoQuery;

    // Determine unread count for current user
    const unreadCount = notifications.filter(
      (n) => req.user && !n.readBy.some((id) => id.toString() === req.user._id.toString())
    ).length;

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create emergency alert / broadcast (Admin only)
// @route POST /api/notifications
exports.createNotification = async (req, res, next) => {
  try {
    const { title, message, type, severity, targetRole, link } = req.body;

    const notification = await Notification.create({
      title,
      message,
      type: type || 'Emergency Alert',
      severity: severity || 'Warning',
      targetRole: targetRole || 'all',
      isBroadcast: true,
      link: link || ''
    });

    res.status(201).json({
      success: true,
      message: 'Emergency announcement broadcasted successfully.',
      notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc Mark notification as read
// @route PATCH /api/notifications/:id/read
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (req.user && !notification.readBy.includes(req.user._id)) {
      notification.readBy.push(req.user._id);
      await notification.save();
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete notification (Admin only)
// @route DELETE /api/notifications/:id
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Notification deleted.'
    });
  } catch (error) {
    next(error);
  }
};

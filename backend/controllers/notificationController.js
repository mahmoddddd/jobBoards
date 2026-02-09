const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    // Using req.user._id assumes the auth middleware attaches the user object as req.user
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, userId: req.user._id });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

const Notification = require('../models/Notification');
const { sendToUser } = require('../config/socket');

/**
 * Create a persistent notification and send real-time update
 * @param {string} userId - Recipient ID
 * @param {string} type - Notification Type
 * @param {string} title - Title
 * @param {string} message - Body
 * @param {string} link - Action Link (optional)
 * @param {Object} metadata - Extra data (optional)
 */
const createNotification = async (userId, type, title, message, link = null, metadata = {}) => {
  try {
    // 1. Save to Database
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      link,
      metadata,
      isRead: false
    });

    // 2. Send Real-time Socket Event
    sendToUser(userId.toString(), 'notification', notification);

    return notification;
  } catch (error) {
    console.error(`Error creating notification for user ${userId}:`, error);
    // Don't crash the request if notification fails
    return null;
  }
};

module.exports = { createNotification };

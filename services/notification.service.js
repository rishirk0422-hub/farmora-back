const Notification = require("../models/Notification.model");

// Create notification
const createNotification = async (data) => {
  return await Notification.create(data);
};

// Get user notifications
const getUserNotifications = async (userId) => {
  return await Notification.find({ userId }).sort({ createdAt: -1 });
};

// Mark single notification as read
const markAsRead = async (notificationId) => {
  return await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
};

// Mark all notifications as read
const markAllAsRead = async (userId) => {
  return await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );
};

// Delete notification
const deleteNotification = async (id) => {
  return await Notification.findByIdAndDelete(id);
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
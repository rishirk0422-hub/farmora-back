import asyncHandler from "express-async-handler";
import Notification from "../models/Notification.model.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id });
  res.json(notifications);
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  notification.isRead = true;
  await notification.save();

  res.json(notification);
});
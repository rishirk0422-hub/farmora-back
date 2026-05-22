import asyncHandler from "express-async-handler";
import User from "../models/User.model.js";

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  Object.assign(user, req.body);
  await user.save();

  res.json(user);
});
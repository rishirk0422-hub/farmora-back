import asyncHandler from "express-async-handler";
import Order from "../models/Order.model.js";

export const sellerDashboard = asyncHandler(async (req, res) => {
  const orders = await Order.find({ seller: req.user._id });

  const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);

  res.json({
    totalOrders: orders.length,
    totalRevenue,
    orders
  });
});

export const buyerDashboard = asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id });

  res.json({
    totalOrders: orders.length,
    orders
  });
});
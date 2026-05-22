const User = require("../models/User.model");
const Order = require("../models/Order.model"); // if you have orders/transactions
const Product = require("../models/Product.model");

const getDashboardStats = async () => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();

  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("name email createdAt");

  return {
    totalUsers,
    totalProducts,
    recentUsers,
  };
};

const getAdminSummary = async () => {
  const users = await User.countDocuments();
  const products = await Product.countDocuments();

  let orders = 0;
  let revenue = 0;

  if (Order) {
    orders = await Order.countDocuments();

    const result = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    revenue = result[0]?.totalRevenue || 0;
  }

  return {
    users,
    products,
    orders,
    revenue,
  };
};

module.exports = {
  getDashboardStats,
  getAdminSummary,
};
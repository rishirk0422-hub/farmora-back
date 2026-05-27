import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js";

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const isSeller = req.user.role === "seller";

    if (isSeller) {
      // ── SELLER STATS ──────────────────────────────────────────────────────

      // Basic counts
      const [totalProducts, activeProducts] = await Promise.all([
        Product.countDocuments({ seller: userId }),
        Product.countDocuments({ seller: userId, isActive: true }),
      ]);

      // All orders for seller's products
      const sellerProducts = await Product.find({ seller: userId }).select("_id");
      const productIds = sellerProducts.map((p) => p._id);

      const [totalOrders, pendingOrders, acceptedOrders, completedOrders] =
        await Promise.all([
          Order.countDocuments({ product: { $in: productIds } }),
          Order.countDocuments({ product: { $in: productIds }, status: "pending" }),
          Order.countDocuments({ product: { $in: productIds }, status: "accepted" }),
          Order.countDocuments({ product: { $in: productIds }, status: "completed" }),
        ]);

      // Total revenue from completed orders
      const revenueResult = await Order.aggregate([
        { $match: { product: { $in: productIds }, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]);
      const totalRevenue = revenueResult[0]?.total || 0;

      // Revenue trend — last 7 months
      const sevenMonthsAgo = new Date();
      sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 6);
      sevenMonthsAgo.setDate(1);

      const revenueTrend = await Order.aggregate([
        {
          $match: {
            product: { $in: productIds },
            status: "completed",
            createdAt: { $gte: sevenMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$totalPrice" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      // Fill missing months with 0
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const trendMap = {};
      revenueTrend.forEach((r) => {
        trendMap[`${r._id.year}-${r._id.month}`] = { revenue: r.revenue, orders: r.orders };
      });
      const filledTrend = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        filledTrend.push({
          month: months[d.getMonth()],
          revenue: trendMap[key]?.revenue || 0,
          orders: trendMap[key]?.orders || 0,
        });
      }

      // Category breakdown
      const categoryBreakdown = await Product.aggregate([
        { $match: { seller: userId } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]);

      // Order status distribution
      const orderStatus = [
        { name: "Pending",   value: pendingOrders,   color: "#f59e0b" },
        { name: "Accepted",  value: acceptedOrders,  color: "#3b82f6" },
        { name: "Completed", value: completedOrders, color: "#22c55e" },
      ];

      // Recent orders
      const recentOrders = await Order.find({ product: { $in: productIds } })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("buyer", "fullName")
        .populate("product", "title");

      return res.json({
        role: "seller",
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        acceptedOrders,
        completedOrders,
        totalRevenue,
        revenueTrend: filledTrend,
        categoryBreakdown,
        orderStatus,
        recentOrders,
      });

    } else {
      // ── BUYER STATS ───────────────────────────────────────────────────────

      const [totalOrders, pendingOrders, completedOrders] = await Promise.all([
        Order.countDocuments({ buyer: userId }),
        Order.countDocuments({ buyer: userId, status: "pending" }),
        Order.countDocuments({ buyer: userId, status: "completed" }),
      ]);

      const spendResult = await Order.aggregate([
        { $match: { buyer: userId, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]);
      const totalSpent = spendResult[0]?.total || 0;

      // Spend trend — last 7 months
      const sevenMonthsAgo = new Date();
      sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 6);

      const spendTrend = await Order.aggregate([
        { $match: { buyer: userId, createdAt: { $gte: sevenMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            spent: { $sum: "$totalPrice" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const trendMap = {};
      spendTrend.forEach((r) => {
        trendMap[`${r._id.year}-${r._id.month}`] = { spent: r.spent, orders: r.orders };
      });
      const filledTrend = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        filledTrend.push({
          month: months[d.getMonth()],
          spent: trendMap[key]?.spent || 0,
          orders: trendMap[key]?.orders || 0,
        });
      }

      const orderStatus = [
        { name: "Pending",   value: pendingOrders,                               color: "#f59e0b" },
        { name: "Accepted",  value: totalOrders - pendingOrders - completedOrders, color: "#3b82f6" },
        { name: "Completed", value: completedOrders,                              color: "#22c55e" },
      ];

      const recentOrders = await Order.find({ buyer: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("product", "title price");

      return res.json({
        role: "buyer",
        totalOrders,
        pendingOrders,
        completedOrders,
        totalSpent,
        revenueTrend: filledTrend,
        orderStatus,
        recentOrders,
      });
    }
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
};

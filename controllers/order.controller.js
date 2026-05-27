import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js";

export const createOrder = async (req, res) => {
  try {
    const { productId, quantity, deliveryAddress } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const totalPrice = product.price * quantity;
    const order = await Order.create({
      buyer: req.user._id,
      product: productId,
      quantity,
      totalPrice,
      deliveryAddress,
    });
    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create order" });
  }
};

export const getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate("product", "title price images category seller")
      .populate("buyer", "fullName email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({ path: "product", match: { seller: req.user._id }, select: "title price images category" })
      .populate("buyer", "fullName email")
      .sort({ createdAt: -1 });
    const filtered = orders.filter((o) => o.product !== null);
    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id)
      .populate({ path: "product", select: "seller" });

    if (!order) return res.status(404).json({ message: "Order not found" });

    const userId = req.user._id.toString();
    const isSeller = order.product?.seller?.toString() === userId;
    const isBuyer  = order.buyer?.toString() === userId;

    // ── Transition rules ──────────────────────────────────────────────────
    // Seller: pending → accepted   OR   pending → rejected (cancel)
    // Buyer:  accepted → completed
    if (isSeller && status === "accepted" && order.status === "pending") {
      order.status = "accepted";
    } else if (isSeller && status === "pending" && order.status === "accepted") {
      // seller can revert accepted back to pending (undo)
      order.status = "pending";
    } else if (isBuyer && status === "completed" && order.status === "accepted") {
      order.status = "completed";
    } else {
      return res.status(403).json({ message: "Invalid status transition or unauthorized" });
    }

    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

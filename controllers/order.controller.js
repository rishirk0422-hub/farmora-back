import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js";

export const createOrder = async (req, res) => {
  const { productId, quantity, deliveryAddress } = req.body;

  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const totalPrice = product.price * quantity;

  const order = await Order.create({
    buyer: req.user._id,
    product: productId,
    quantity,
    totalPrice,
    deliveryAddress
  });

  res.status(201).json(order);
};

export const getBuyerOrders = async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id })
    .populate("product")
    .populate("buyer", "fullName");

  res.json(orders);
};

export const getSellerOrders = async (req, res) => {
  const orders = await Order.find()
    .populate({
      path: "product",
      match: { seller: req.user._id }
    })
    .populate("buyer", "fullName");

  const filtered = orders.filter(o => o.product !== null);

  res.json(filtered);
};
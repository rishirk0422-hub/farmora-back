import Order from "../models/Order.model.js";

export const createOrderService = async (data) => {
  return await Order.create(data);
};

export const getBuyerOrdersService = async (buyerId) => {
  return await Order.find({ buyer: buyerId }).populate("product seller");
};

export const getSellerOrdersService = async (sellerId) => {
  return await Order.find({ seller: sellerId }).populate("product buyer");
};

export const updateOrderStatusService = async (orderId, status) => {
  return await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  );
};
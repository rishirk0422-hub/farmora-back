import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    quantity: Number,
    totalPrice: Number,
    deliveryAddress: String,
    status: {
      type: String,
      enum: ["pending", "accepted", "completed"],
      default: "pending"
    }
  },
  { timestamps: true }
);
const Order =
  mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
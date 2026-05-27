import express from "express";
import {
  createOrder,
  getBuyerOrders,
  getSellerOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/buyer", protect, getBuyerOrders);
router.get("/seller", protect, getSellerOrders);

// Seller accepts: pending → accepted
// Buyer completes: accepted → completed
router.patch("/:id/status", protect, updateOrderStatus);

export default router;

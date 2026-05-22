import express from "express";
import {
  createOrder,
  getBuyerOrders,
  getSellerOrders
} from "../controllers/order.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Create order
router.post("/", protect, createOrder);

// Buyer orders
router.get("/buyer", protect, getBuyerOrders);

// Seller orders
router.get("/seller", protect, getSellerOrders);

export default router;
import express from "express";
import {
  sellerDashboard,
  buyerDashboard
} from "../controllers/dashboard.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/seller", protect, authorizeRoles("seller"), sellerDashboard);
router.get("/buyer", protect, authorizeRoles("buyer"), buyerDashboard);

export default router;
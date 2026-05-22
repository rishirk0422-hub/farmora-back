import express from "express";
import {
  signup,
  login,
  verifyOtp,
  logout,
  refreshToken
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", protect, logout);

export default router;
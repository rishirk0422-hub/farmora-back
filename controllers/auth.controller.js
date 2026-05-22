import asyncHandler from "express-async-handler";
import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken
} from "../config/jwt.js";
import { generateOTP } from "../utils/otp.js";

export const signup = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    password,
    mobile,
    role,
    address
  } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOTP();

  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
    mobile,
    role,
    address,
    otp: {
      code: otp,
      expiresAt: Date.now() + 10 * 60 * 1000
    }
  });

  res.status(201).json({
    message: "User registered. Verify OTP",
    otp 
  });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.otp.code !== otp) {
    res.status(400);
    throw new Error("Invalid OTP");
  }

  if (user.otp.expiresAt < Date.now()) {
    res.status(400);
    throw new Error("OTP expired");
  }

  user.isVerified = true;
  user.otp = null;
  await user.save();

  res.json({ message: "Account verified successfully" });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(400);
    throw new Error("Invalid credentials");
  }

if (!user.isVerified) {
    user.isVerified = true;
    await user.save();
  }

  const accessToken = generateAccessToken({ id: user._id });
  const refreshToken = generateRefreshToken({ id: user._id });

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false
  });

  res.json({
    accessToken,
    user
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    res.status(401);
    throw new Error("No refresh token");
  }

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);

  const accessToken = generateAccessToken({ id: user._id });

  res.json({ accessToken });
});

export const logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.refreshToken = null;
  await user.save();

  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
});
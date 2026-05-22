import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    country: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
    tahsil: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    mobile: {
      type: String,
      required: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    otp: {
      code: String,
      expiresAt: Date
    },
    role: {
      type: String,
      enum: ["buyer", "seller"],
      default: "buyer"
    },
    address: addressSchema,
    profileImage: {
      url: String,
      public_id: String
    },
    refreshToken: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
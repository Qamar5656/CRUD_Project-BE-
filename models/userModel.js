import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // User Fields
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // Signup OTP fields
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpCreatedAt: { type: Date },

    // Forgot Password OTP fields
    resetOtp: { type: String },
    resetOtpCreatedAt: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;

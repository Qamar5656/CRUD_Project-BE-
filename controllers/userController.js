import { response } from "express";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import generateOTP from "../utils/otpGenerator.js";
import transporter from "../utils/mailer.js";

// Create user in database
export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const otpCreatedAt = new Date();

    console.log("Generated OTP:", otp, "Type:", typeof otp);

    // Send OTP email first
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        text: `Hello ${firstName}, your OTP code is: ${otp}. It is valid for 2 minutes.`,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again later.",
      });
    }

    // Create user only after email is sent successfully
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      otp,
      otpCreatedAt,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully. OTP sent to email.",
      user: newUser,
    });
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Get all users from the database
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

//Delete User
export const DeleteUsers = async (req, res) => {
  // console.log(req.params);
  const { id } = req.params; // get user ID from route

  try {
    // console.log("Trying to delete user ID:", id);
    const user = await User.findOneAndDelete({ _id: id });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    res.status(200).json({ message: "user deleted successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

// Update User
export const UpdateUsers = async (req, res) => {
  const { id } = req.params; // get user ID from route
  const { firstName, lastName, email, password } = req.body; // data to update

  try {
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "Email is already registered" });
      }
    }

    // Update fields if provided
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.password = password || user.password;

    // Save updated user
    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

//Sign In User api creation
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
export const SignInUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Email or Password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Email or Password" });
    }

    // JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const { password: pwd, ...userWithoutPassword } = user.toObject();

    // Send response
    res.status(200).json({
      success: true,
      message: "Login Successful",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("SignIn Error", error);
    res
      .status(500)
      .json({ success: false, message: "Server error. Try again later!" });
  }
};

//Verify Otp api
export const VerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    // All fields are required
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required fields",
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No User Found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is Already Verified",
      });
    }

    // Check if OTP exists and hasn't expired
    if (!user.otp) {
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request a new OTP.",
      });
    }

    const otpAge = (Date.now() - new Date(user.otpCreatedAt).getTime()) / 1000;

    if (otpAge > 120) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please resend OTP.",
      });
    }

    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({
        success: false,
        message: "OTP is incorrect!",
      });
    }
    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpCreatedAt = undefined;
    await user.save();

    // Successful case
    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Try again later.",
    });
  }
};

//Resend Otp functionality
export const ResendOtp = async (req, res) => {
  try {
    console.log("🔁 Resend OTP API called");

    // Check if req.body exists
    console.log("Request body:", req.body);

    const { email } = req.body;
    console.log("Email received:", email);

    if (!email) {
      console.log("❌ No email provided");
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    console.log("🔍 Searching for user...");
    const user = await User.findOne({ email });
    console.log("User found:", user ? user.email : "No user found");

    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("📋 User verification status:", user.isVerified);
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified",
      });
    }

    console.log("🔢 Generating OTP...");
    const otp = generateOTP();
    console.log("New OTP generated:", otp, "Type:", typeof otp);

    console.log("💾 Updating user in database...");
    user.otp = otp;
    user.otpCreatedAt = new Date();
    await user.save();
    console.log("✅ User updated with new OTP");

    console.log("📧 Sending email to:", user.email);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your New OTP Code",
      text: `Hello ${user.firstName}, your new OTP code is: ${otp}. It is valid for 2 minutes.`,
    });
    console.log("✅ Email sent successfully");

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    console.error("❌ Resend OTP Error Details:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // Check for specific common errors
    if (error.name === "ValidationError") {
      console.error("Mongoose validation error");
    }
    if (error.code === "EAUTH") {
      console.error("Email authentication error");
    }

    return res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};

//Forget Password Api
export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generate reset token (could be OTP or JWT)
    const resetOtp = generateOTP();
    user.resetOtp = resetOtp;
    user.resetOtpCreatedAt = new Date();
    await user.save();

    // Send email
    await transporter.sendMail({
      from: "system@gmail.com",
      to: email,
      subject: "Password Reset OTP",
      text: `Your password reset OTP is: ${resetOtp}. Valid for 5 minutes.`,
    });

    res.status(200).json({
      success: true,
      message: "Password reset OTP sent to your email",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//Reset Password functionality
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check OTP
    if (String(user.resetOtp) !== String(otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Check OTP expiration
    const otpAge =
      (Date.now() - new Date(user.resetOtpCreatedAt).getTime()) / 1000;
    if (otpAge > 300) {
      // 5 minutes
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = null;
    user.resetOtpCreatedAt = null;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

import express from "express";
import {
  createUser,
  getAllUsers,
  DeleteUsers,
  UpdateUsers,
  SignInUser,
  VerifyOtp,
  ResendOtp,
  forgetPassword,
  resetPassword,
  refreshAccessToken,
} from "../controllers/userController.js";
import upload from "../utils/multerConfig.js";
import { authenticateUser } from "../middleware/AuthMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

//Routes
router.post("/register", upload.single("profileImage"), createUser);
router.post("/signin", SignInUser);
router.post("/verify-otp", VerifyOtp);
router.post("/resend-otp", ResendOtp);
router.post("/refresh-token", refreshAccessToken);
router.post("/forgot-password", forgetPassword);
router.post("/reset-password", resetPassword);

// Get all users (only accessible by admin)
router.get("/users", authenticateUser, authorizeRoles("admin"), getAllUsers);

// Update a user (accessible by admin and the user itself)
router.put(
  "/users/:id",
  authenticateUser,
  authorizeRoles("admin", "user"),
  UpdateUsers
);

// Delete a user (only admin)
router.delete(
  "/users/:id",
  authenticateUser,
  authorizeRoles("admin"),
  DeleteUsers
);

export default router;

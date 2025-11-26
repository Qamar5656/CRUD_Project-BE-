// routes/userRoutes.js
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
} from "../controllers/userController.js";
import upload from "../utils/multerConfig.js";
// import { registerUser } from "../controllers/userController.js";

const router = express.Router();

//CRUD routes
router.post("/register", upload.single("profileImage"), createUser);
router.get("/users", getAllUsers);
router.delete("/users/:id", DeleteUsers);
router.put("/users/:id", UpdateUsers);
router.post("/signin", SignInUser);

//Otp routes
router.post("/verify-otp", VerifyOtp);
router.post("/resend-otp", ResendOtp);

//Password Routes
router.post("/forgot-password", forgetPassword);
router.post("/reset-password", resetPassword);

export default router;

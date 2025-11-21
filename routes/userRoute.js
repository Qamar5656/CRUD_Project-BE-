// routes/userRoutes.js
import express from "express";
import {
  createUser,
  getAllUsers,
  DeleteUsers,
  UpdateUsers,
} from "../controllers/userController.js";
// import { registerUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", createUser);
router.get("/users", getAllUsers);
router.delete("/users/:id", DeleteUsers);
router.put("/users/:id", UpdateUsers);

export default router;

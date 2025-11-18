// controllers/userController.js
// export const registerUser = (req, res) => {
//   console.log("Received user data:", req.body);
//   res.json({
//     success: true,
//     message: "User data received successfully",
//   });
// };

// Create user in database
import User from "../models/userModel.js";

export const createUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body); // Saves to DB
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

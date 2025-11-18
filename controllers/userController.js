import User from "../models/userModel.js";

// Create user in database
export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Check required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // create user if all things are correct
    const newUser = await User.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
    });

    res.status(201).json({
      success: true,
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

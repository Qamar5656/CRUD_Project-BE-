// controllers/userController.js
export const registerUser = (req, res) => {
  console.log("Received user data:", req.body); // this will log data from your React form
  res.json({
    success: true,
    message: "User data received successfully",
    data: {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
    },
  });
};

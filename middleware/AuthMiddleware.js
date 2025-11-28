import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; //Bearer Token

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unautorized User" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: "Invalid token" });
  }
};

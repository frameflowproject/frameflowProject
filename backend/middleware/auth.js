const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, authorization denied",
      });
    }

    // Verify token
    // We are using JWT to verify the token sent from the frontend
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database using the id from the token
    const user = await User.findById(decoded.userId);

    if (!user) {
      console.log("User not found during auth");
      return res.status(401).json({
        success: false,
        message: "User not found, authorization denied",
      });
    }

    // Add user to request object so we can use it in other routes
    req.user = {
      id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      isVerified: user.isVerified,
      role: user.role,
    };

    next(); // Move to the next middleware or route handler
  } catch (error) {
    console.error("Auth middleware error:", error);

    // Specific error handling for JWT issues
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error in authentication",
    });
  }
};

module.exports = auth;

import Jwt from "jsonwebtoken";
import { User } from "../Models/user.model.js";

// Middleware to protect routes
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    // 🔐 1. Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    // ✅ 2. Verify the token
    const decoded = Jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
        return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid-Token",
      });
    }

    // 🧠 3. Attach decoded user ID to request for use in routes
    req.userId = decoded.UserId; // 👈 ensure this matches what you set in generateTokenAndSetCookie

    // 4. Get the user from database to get their role
    try {
      const user = await User.findById(req.userId);
      if (user) {
        // Check if user is blocked
        if (user.isBlocked) {
          return res.status(403).json({
            success: false,
            message: "Your account has been blocked. Please contact an administrator."
          });
        }
        
        req.userRole = user.role; // Add user's role to the request
        // Role is silently attached without logging
      } else {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
    } catch (err) {
      console.error("Error fetching user role:", err);
      // Continue without role if there's an error (could be a DB issue)
      req.userRole = "author"; // Default to author if can't determine role
    }

    next(); // 🔁 proceed to next middleware/route
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "ServerError",
    });
  }
};

import { User } from "../Models/user.model.js";

/**
 * Middleware to check if a user has admin privileges
 * This is used to protect admin-only routes
 */
export const isAdmin = async (req, res, next) => {
    try {
        // Get user from database to check their role
        const user = await User.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Check if user is an admin
        if (user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }
        
        // Add user object to request for future use
        req.user = user;
        
        // User is admin, proceed to next middleware/controller
        next();
    } catch (error) {
        console.error("Admin middleware error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}; 
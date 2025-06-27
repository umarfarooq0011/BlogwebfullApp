import { User } from "../Models/user.model.js";

/**
 * Get all users (admin only)
 * This is a placeholder for future implementation
 */
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        
        return res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        console.error("Error getting all users:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

/**
 * Toggle user block status (admin only)
 */
export const toggleUserBlock = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Find the user
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Don't allow admins to block themselves
        if (user.role === "admin" && user._id.toString() === req.userId) {
            return res.status(400).json({
                success: false,
                message: "You cannot block yourself"
            });
        }
        
        // Toggle block status
        user.isBlocked = !user.isBlocked;
        await user.save();
        
        return res.status(200).json({
            success: true,
            message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isBlocked: user.isBlocked
            }
        });
    } catch (error) {
        console.error("Error toggling user block status:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}; 
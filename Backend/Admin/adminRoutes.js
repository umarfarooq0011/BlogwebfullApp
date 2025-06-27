import express from "express";
import { verifyToken } from "../Middlewares/verifyToken.js";
import { isAdmin } from "./adminMiddleware.js";
import { getAllUsers, toggleUserBlock } from "./adminController.js";

const router = express.Router();

// Admin dashboard route (placeholder)
router.get("/dashboard", verifyToken, isAdmin, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Admin dashboard access granted"
    });
});

// Get all users (admin only)
router.get("/users", verifyToken, isAdmin, getAllUsers);

// Toggle user block status (admin only)
router.patch("/users/:userId/toggle-block", verifyToken, isAdmin, toggleUserBlock);

// Add more admin routes here in the future

export default router; 
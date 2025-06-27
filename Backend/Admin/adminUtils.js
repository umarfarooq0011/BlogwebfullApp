import { User } from "../Models/user.model.js";
import bcrypt from "bcryptjs";

/**
 * Seeds the admin user in the database if it doesn't already exist
 * This function is called when the server starts
 */
export const seedAdminUser = async () => {
    try {
        // Check if admin user already exists
        const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL});
        
        if (!adminExists) {
            // Create admin user
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 14);
            
            const adminUser = new User({
                name: "Admin",
                email: process.env.ADMIN_EMAIL,
                password: hashedPassword,
                role: "admin",
                isVerified: true // Admin is automatically verified
            });
            
            await adminUser.save();
            console.log("Admin user created successfully");
        } else {
            console.log("Admin user already exists");
        }
    } catch (error) {
        console.error("Error creating admin user:", error.message);
    }
}; 
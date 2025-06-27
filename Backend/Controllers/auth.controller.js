import { User } from "./../Models/user.model.js";
import bcrypt from "bcryptjs"; // ✅ CORRECT
import { generateTokenAndSetCookie } from "../Utils/generateTokenAndSetCookie.js";
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../Mails/emails.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Blog } from "../Models/Blog.model.js";
import { Newsletter } from "../Models/newsletter.model.js";

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
        success: false,
      });
    }
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res.status(400).json({
        message: "User already exists",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 14);

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // hash the verification token before saving it to the database
    const hashedVerificationToken = await bcrypt.hash(verificationToken, 14);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "author", // Set default role for new signups to author
      verificationToken: hashedVerificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    await user.save();

    generateTokenAndSetCookie(res, user._id);

    await sendVerificationEmail(user.email, verificationToken, user.name);

    res.status(201).json({
      message: "User created successfully",
      success: true,
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error.message); // 👈 log exact error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res
        .status(400)
        .json({ success: false, message: messages.join(", ") });
    }
    return res.status(500).json({ success: false, message: error.message }); // 👈 show actual error message
  }
};

export const verifyEmail = async (req, res) => {
  const { code, email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required for verification",
    });
  }
  
  try {
    const user = await User.findOne({
      email,
      verificationToken: { $exists: true }, // Ensure the token exists
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code. Please request a new code.",
      });
    }

    // Compare the provided code with the hashed verification token stored in the database
    const isTokenValid = await bcrypt.compare(code, user.verificationToken);

    if (!isTokenValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. Welcome email sent.",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error during verification",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email",
        success: false,
      });
    }
    
    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked. Please contact an administrator.",
        success: false,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid password",
        success: false,
      });
    }

    generateTokenAndSetCookie(res, user._id);

    user.lastlogin = Date.now();
    user.userActivity = user.userActivity || [];
    user.userActivity.push({ type: "login", timestamp: new Date() });

    await user.save();

    return res.status(200).json({
      message: "Login successful",
      success: true,
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const logout = async (req, res) => {
  try {
    // Find user by token if possible
    const token = req.cookies.token;
    let userId = null;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.UserId;
    }
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        user.userActivity = user.userActivity || [];
        user.userActivity.push({ type: "logout", timestamp: new Date() });
        await user.save();
      }
    }
  } catch (err) {
    console.error("Logout Error:", err.message);
    // ignore errors for logout activity
  }
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const deleteAuthorAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Only allow authors to delete their own accounts
    if (user.role !== "author") {
      return res.status(403).json({
        message: "Forbidden: Only authors can delete their accounts.",
        success: false,
      });
    }

    // 1. Delete all blogs by this author
    await Blog.deleteMany({ author: userId });

    // 2. Remove comments made by this author from other blogs
    await Blog.updateMany(
      { "comments.user": userId },
      { $pull: { comments: { user: userId } } }
    );

    // 3. Unsubscribe from newsletter
    await Newsletter.deleteOne({ email: user.email });

    // 4. Delete the user
    await User.findByIdAndDelete(userId);

    // 5. Clear cookie and log out
    res.clearCookie("token");

    return res.status(200).json({
      message: "Account deleted successfully.",
      success: true,
    });
  } catch (error) {
    console.error("Delete Account Error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash the reset token before saving it to the database
    const hashedToken = await bcrypt.hash(resetToken, 14);

    // Set the reset token and expiration date
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save();

    // Send the reset email
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your Email",
    });
  } catch (error) {
    console.error("Forget Password Error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const ResetPassword = async (req, res) => {
    const { token } = req.params; // Raw token from the URL
    const { password } = req.body;
  
    try {
      // Step 1: Find user with a valid (non-expired) reset token
      const user = await User.findOne({
        resetPasswordExpiresAt: { $gt: Date.now() },
        resetPasswordToken: { $exists: true } // Ensure the field is set
      });
  
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired password reset token",
        });
      }
  
      // Step 2: Compare raw token from URL with hashed token in DB
      const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
  
      if (!isTokenValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired password reset token",
        });
      }
  
      // Step 3: Hash the new password
      const hashedPassword = await bcrypt.hash(password, 14);
  
      // Step 4: Update password and clear reset token fields
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiresAt = undefined;
  
      await user.save();
  
      await sendResetSuccessEmail(user.email, user.name);
  
      return res.status(200).json({
        success: true,
        message: "Password successfully updated",
      });
  
    } catch (error) {
      console.error("Error in ResetPassword:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };

//   / Check if user is authenticated (used in frontend session checks)

export const checkauth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      // Clear the auth token cookie
      res.clearCookie("token");
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Please contact an administrator.",
        isBlocked: true
      });
    }

    return res.status(200).json({
      success: true,
      message: "User authenticated",
      user,
    });
  } catch (error) {
    console.error("Error in checkauth:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// New function to check user role efficiently
export const checkRole = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      role: user.role,
    });
  } catch (error) {
    console.error("Error in checkRole:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get user activity
export const getUserActivity = async (req, res) => {
    try {
      const user = await User.findById(req.userId).select('userActivity name email');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.status(200).json({
        success: true,
        activity: user.userActivity || [],
        name: user.name,
        email: user.email
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  };

// Resend verification email
export const resendVerificationEmail = async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      if (user.isVerified) {
        return res.status(400).json({ success: false, message: 'Email is already verified.' });
      }
      // Generate new verification code
      const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedVerificationToken = await bcrypt.hash(verificationToken, 14);
      user.verificationToken = hashedVerificationToken;
      user.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
      await user.save();
      await sendVerificationEmail(user.email, verificationToken, user.name);
      return res.status(200).json({ success: true, message: 'Verification email resent.' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
  };

  
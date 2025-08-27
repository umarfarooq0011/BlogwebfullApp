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
        message: "An account with this email already exists",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 14);
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "author", // Default role
      verificationToken: verificationToken, // Store plain token
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    await user.save();

    // We don't need to generate a token here, user needs to verify first.
    // generateTokenAndSetCookie(res, user._id);

    await sendVerificationEmail(user.email, verificationToken, user.name);

    res.status(201).json({
      message:
        "User created successfully. Please check your email to verify your account.",
      success: true,
    });
  } catch (error) {
    console.error("Signup Error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

export const verifyEmail = async (req, res) => {
  const { code, email } = req.body;
  if (!email || !code) {
    return res
      .status(400)
      .json({ success: false, message: "Email and code are required." });
  }

  try {
    const user = await User.findOne({
      email,
      verificationToken: { $exists: true },
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Invalid or expired verification code. Please request a new one.",
        });
    }

    if (code !== user.verificationToken) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification code." });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Verification Error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Server error during verification." });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid credentials.", success: false });
    }

    if (!user.isVerified) {
      return res
        .status(401)
        .json({
          message: "Please verify your email before logging in.",
          success: false,
        });
    }

    if (user.isBlocked) {
      return res
        .status(403)
        .json({
          message:
            "Your account has been blocked. Please contact an administrator.",
          success: false,
        });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Invalid credentials.", success: false });
    }

    generateTokenAndSetCookie(res, user._id);
    user.lastlogin = Date.now();
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      message: "Login successful",
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.UserId;
      if (userId) {
        const user = await User.findById(userId);
        if (user) {
          user.userActivity.push({ type: "logout", timestamp: new Date() });
          await user.save();
        }
      }
    }
  } catch (err) {
    console.error("Logout Activity Error:", err.message);
  }
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const deleteAuthorAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    if (user.role !== "author") {
      return res
        .status(403)
        .json({
          message: "Forbidden: Only authors can delete their accounts.",
          success: false,
        });
    }

    await Blog.deleteMany({ author: userId });
    await Blog.updateMany(
      { "comments.user": userId },
      { $pull: { comments: { user: userId } } }
    );
    await Newsletter.deleteOne({ email: user.email });
    await User.findByIdAndDelete(userId);

    res.clearCookie("token");
    return res
      .status(200)
      .json({ message: "Account deleted successfully.", success: true });
  } catch (error) {
    console.error("Delete Account Error:", error.message);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    // IMPORTANT: To prevent user enumeration, always return a success message.
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account with this email exists, a password reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    return res.status(200).json({
      success: true,
      message:
        "If an account with this email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forget Password Error:", error.message);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const ResetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Find potential users with a non-expired token.
    // This is necessary because we only store the hashed token.
    const potentialUsers = await User.find({
      resetPasswordExpiresAt: { $gt: Date.now() },
      resetPasswordToken: { $exists: true },
    });

    if (!potentialUsers.length) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid or expired password reset token.",
        });
    }

    let userToUpdate = null;
    // Securely find the correct user by comparing the provided token with each stored hashed token.
    for (const user of potentialUsers) {
      const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
      if (isTokenValid) {
        userToUpdate = user;
        break; // Found the user
      }
    }

    if (!userToUpdate) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid or expired password reset token.",
        });
    }

    const hashedPassword = await bcrypt.hash(password, 14);
    userToUpdate.password = hashedPassword;
    userToUpdate.resetPasswordToken = undefined;
    userToUpdate.resetPasswordExpiresAt = undefined;

    await userToUpdate.save();
    await sendResetSuccessEmail(userToUpdate.email, userToUpdate.name);

    return res
      .status(200)
      .json({
        success: true,
        message: "Password has been updated successfully.",
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
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (user.isBlocked) {
      res.clearCookie("token");
      return res
        .status(403)
        .json({
          success: false,
          message: "Your account has been blocked.",
          isBlocked: true,
        });
    }
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// New function to check user role efficiently
export const checkRole = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("role");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, role: user.role });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get user activity
export const getUserActivity = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "userActivity name email"
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.status(200).json({
      success: true,
      activity: user.userActivity || [],
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Resend verification email
export const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "This email is already verified." });
    }

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.verificationToken = verificationToken; // Store plain token
    user.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();
    await sendVerificationEmail(user.email, verificationToken, user.name);

    return res
      .status(200)
      .json({
        success: true,
        message: "A new verification email has been sent.",
      });
  } catch (error) {
    console.error("Resend Verification Email Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

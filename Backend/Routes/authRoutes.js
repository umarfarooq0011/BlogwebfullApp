import express from "express";
import { checkauth, checkRole, deleteAuthorAccount, forgetPassword, getUserActivity, login, logout, resendVerificationEmail, ResetPassword, signup, verifyEmail } from "../Controllers/auth.controller.js";
import { verifyToken } from "../Middlewares/verifyToken.js";
import { forgotPasswordLimiter, loginLimiter } from "../Middlewares/RateLimiter.js";

const router = express.Router();


router.get("/check-auth", verifyToken, checkauth)

router.get("/check-role", verifyToken, checkRole)

router.post("/signup", signup);

router.post("/verify-email", verifyEmail);

router.post("/login", loginLimiter, login);

router.post("/logout", logout);

router.delete("/delete-account", verifyToken, deleteAuthorAccount);

router.post("/forget-password", forgotPasswordLimiter, forgetPassword);

// reset passowrd

router.post("/reset-password/:token", ResetPassword);

router.get("/user-activity", verifyToken, getUserActivity);

router.post("/resend-verification-email", resendVerificationEmail);




export default router;


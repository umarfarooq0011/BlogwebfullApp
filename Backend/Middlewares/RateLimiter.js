import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // max 5 requests
    message: {
      success: false,
      message: "Too many login attempts. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  export const forgotPasswordLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 3, // max 3 requests
    message: {
      success: false,
      message: "Too many password reset attempts. Please try again in 30 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
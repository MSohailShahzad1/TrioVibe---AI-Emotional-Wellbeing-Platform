// routes/authRoutes.js
import express from "express";
import {
  signupRequest,
  resendOtp,
  login,
  forgotPasswordRequest,
  VerifyOTP,
  resetPassword,
  checkAuth,
  verifySignupOtp,
  signup
} from "../Controllers/userControlller.js";
import { protectRoute } from "../middleware/auth.js";

const authRouter = express.Router();


// Authentication routes
authRouter.post("/signup", signup);
authRouter.post("/signup-request", signupRequest);

authRouter.post("/signup/verify-otp", verifySignupOtp);
authRouter.post("/signup/resend-otp", resendOtp);
authRouter.post("/login", login);
authRouter.post("/forgot-password-request", forgotPasswordRequest);
authRouter.post("/verify-reset-otp", VerifyOTP);
authRouter.post("/reset-password", resetPassword);

// Check authentication status
authRouter.get("/check", protectRoute, checkAuth);

export default authRouter;
// import express from"express"
// import { checkAuth, editProfile, forgotPasswordRequest, getCurrentUser, getSuggestedUsers, getUserProfile, login, removeAcc,  resendOtp, resetPassword, signupRequest, updateProfile, VerifyOTP,  verifyResetOtp} from "../Controllers/userControlller.js";
// import { protectRoute } from "../middleware/auth.js";


// const userRouter=express.Router();

// // userRouter.post("/signup",signup);
// userRouter.post("/signup-request",signupRequest);
// userRouter.post("/signup/verify-otp",verifyResetOtp);
// userRouter.post("/signup/resend-otp",resendOtp)
// userRouter.post("/login",login);
// userRouter.post("/forgot-password-request",forgotPasswordRequest),
// userRouter.post("/verify-reset-otp",VerifyOTP),
// userRouter.post("/reset-password",resetPassword),
// userRouter.put("/updateProfile",protectRoute,updateProfile);
// userRouter.get("/check",protectRoute,checkAuth);
// userRouter.get("/profile",protectRoute,getCurrentUser);
// userRouter.delete("/remove",removeAcc);
// userRouter.get("profile/:userId",getUserProfile);
// userRouter.get("/suggested",protectRoute,getSuggestedUsers);
// userRouter.put("edit-profile",protectRoute,editProfile);

// export default userRouter;

// routes/userRoutes.js
import express from "express";
import { 
  getCurrentUser, 
  getSuggestedUsers, 
  getUserProfile, 
  updateProfile, 
  editProfile,
  removeAcc, 
  updateOnlineStatus,
  searchUsers,
  advancedSearch
} from "../Controllers/userControlller.js";
import { protectRoute } from "../middleware/auth.js";

const userRouter = express.Router();

// All user routes require authentication
userRouter.use(protectRoute);

// User profile routes
userRouter.get("/profile", getCurrentUser);
userRouter.get("/profile/:userId", getUserProfile);
userRouter.put("/updateProfile", updateProfile);
userRouter.put("/edit-profile", editProfile);

// User management
userRouter.get("/suggested", getSuggestedUsers);
userRouter.get('/search',searchUsers)
userRouter.get("/search/advance",advancedSearch)
userRouter.post("/online-status",updateOnlineStatus)
userRouter.delete("/remove", removeAcc);

export default userRouter;
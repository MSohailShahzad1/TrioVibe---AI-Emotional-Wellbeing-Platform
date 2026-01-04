// routes/userRoutes.js
/**
 * User Routes
 * Handles user profile management, suggested users, and search functionality.
 * All routes in this module are protected by the protectRoute middleware.
 */
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
userRouter.get('/search', searchUsers)
userRouter.get("/search/advance", advancedSearch)
userRouter.post("/online-status", updateOnlineStatus)
userRouter.delete("/remove", removeAcc);

export default userRouter;
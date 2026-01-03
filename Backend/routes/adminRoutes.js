import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {verifyAdmin} from "../middleware/adminAuth.js"
const adminRouter = express.Router();

// --- Predefined Admin Credentials ---
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123"; // change later
const ADMIN_ROLE = "admin";

// --- Admin Login ---
adminRouter.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Validate fields
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  // Check admin credentials
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }

  // Generate JWT
  const token = jwt.sign(
    {
      email: ADMIN_EMAIL,
      role: ADMIN_ROLE,
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  return res.status(200).json({
    message: "Admin login successful",
    token,
    admin: {
      email: ADMIN_EMAIL,
      role: ADMIN_ROLE,
    },
  });
});


adminRouter.get("/users", verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json({ users });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch users" });
  }
});

adminRouter.put("/users/:id", verifyAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role, therapistRequest: false }, // reset request if approved
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });

  } catch (err) {
    return res.status(500).json({ message: "Failed to update user" });
  }
});


adminRouter.get("/dashboard-stats", verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const therapists = await User.countDocuments({ role: "therapist" });
    const pendingRequests = await User.countDocuments({ therapistRequest: true });

    res.json({ totalUsers, therapists, pendingRequests });
  } catch (err) {
    res.status(500).json({ message: "Failed to get stats" });
  }
});


export default adminRouter;

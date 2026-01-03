// models/TempUser.js
import mongoose from "mongoose";

const tempUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String, required: true },
  otpExpires: { type: Date, required: true }
}, { timestamps: true });

export default mongoose.model("TempUser", tempUserSchema);

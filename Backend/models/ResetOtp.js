// models/ResetOTP.js
import mongoose from "mongoose";

const resetOTPSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // expires after 10 minutes
  verified: { type: Boolean, default: false },
});

// MongoDB will auto-delete after `expires: 600` (10 minutes)
// export default mongoose.model("ResetOTP", resetOTPSchema);
const ResetOTP=mongoose.model("ResetOtp",resetOTPSchema);

export default ResetOTP;
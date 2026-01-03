import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  therapist: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },

  status: {
    type: String,
    enum: ["pending", "approved", "completed", "cancelled"],
    default: "pending",
  },

  // Review fields AFTER appointment
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String },
  reviewed: { type: Boolean, default: false },
  
},
{
  timestamps:true
});

export default mongoose.model("Appointment", appointmentSchema);

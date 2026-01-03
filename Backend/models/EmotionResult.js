import mongoose from "mongoose";



const resultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  emotion: { type: String, required: true },
  probability: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  sourceType: { type: String, enum: ["text", "voice", "image", "video"], required: true },
  extraData: { type: Object }, // For pitch, facial landmarks, etc.
});

export default mongoose.model("EmotionResult", resultSchema);

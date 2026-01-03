
import mongoose from "mongoose";

const QASetSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
});

const AnswerSchema = new mongoose.Schema({
  day: { type: Number, required: true },
  responses: [QASetSchema], // ✅ array of {question, answer}
  date: { type: Date, default: Date.now }
});


const TherapySessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  currentDay: { type: Number, default: 1 },
  duration: { type: Number, required: true },
  responses: [
    {
      day: Number,
      answers: [{ question: String, answer: String }],
      submittedAt: { type: Date, default: Date.now },
    },
  ],
  locked: {
    type: Boolean,
    default: false
  },
  unlockTime: {
    type: Date,
    default: null
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  lastSubmittedAt: { type: Date, default: null }, // 👈 track last submission
});

export default mongoose.model("TherapySession", TherapySessionSchema);

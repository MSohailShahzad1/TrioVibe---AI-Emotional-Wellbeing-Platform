import TherapySession from "../models/TherapySession.js";
import User from "../models/User.js";
import { therapyQuestions } from "../lib/therapyQuestions.js";


export const startTherapy = async (req, res) => {
  try {
    const { userId, duration } = req.body;

    const existing = await TherapySession.findOne({ userId, isCompleted: false });
    if (existing) {
      return res.status(400).json({ success: false, message: "Session already running" });
    }

    const questions = [
      "How are you feeling today?",
      "What was the best part of your day?",
      "What challenge did you face today?",
      "What are you grateful for?",
      "What will you do to take care of yourself tomorrow?"
    ];

    const session = new TherapySession({
      userId,
      duration,
      questions,   // ✅ store once
      answers: []  // empty at start
    });

    await session.save();
    res.json({ success: true, session });
  } catch (err) {
    console.error("Start therapy error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};





// controller/therapyController.js
// export const submitAnswer = async (req, res) => {
//   try {
//     const { userId, responses } = req.body;

//     let session = await TherapySession.findOne({ userId });
//     if (!session) {
//       return res.status(404).json({ success: false, message: "Session not found" });
//     }

//     // Save responses with day info
//     session.responses.push({
//       day: session.currentDay,
//       responses, // array of {question, answer}
//     });

//     // Move to next day
//     if (session.currentDay < session.duration) {
//       session.currentDay += 1;
//     }

//     await session.save();

//     res.status(200).json({ success: true, message: "Answers saved", session });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };
export const submitAnswer = async (req, res) => {
  try {
    const { userId, answers } = req.body; // Changed from 'responses' to 'answers' to match frontend

    let session = await TherapySession.findOne({ userId });
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    // Check if already submitted today
    const today = new Date().toDateString();
    const lastResponse = session.responses[session.responses.length - 1];
    
    if (lastResponse && new Date(lastResponse.date).toDateString() === today) {
      return res.status(400).json({ 
        success: false, 
        message: "Already submitted answers today" 
      });
    }

    // Save responses with day info and current date
    session.responses.push({
      day: session.currentDay,
      date: new Date(),
      answers: answers, // array of {question, answer}
    });

    // Move to next day
    if (session.currentDay < session.duration) {
      session.currentDay += 1;
    }

    // Lock the session until next midnight
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0); // Set to next midnight

    session.locked = true;
    session.unlockTime = nextMidnight;

    await session.save();

    res.status(200).json({ 
      success: true, 
      message: "Answers saved successfully", 
      session 
    });
  } catch (err) {
    console.error("Submit answer error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// export const getSession = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     let session = await TherapySession.findOne({ userId });

//     if (!session) {
//       session = new TherapySession({
//         userId,
//         currentDay: 1,
//         duration: 7,
//         responses: [],
//       });
//       await session.save();
//     }

//     let unlockTime = null;
//     let locked = false;

//     if (session.lastSubmittedAt) {
//       // ⏰ Unlock at midnight after last submission
//       unlockTime = new Date(session.lastSubmittedAt);
//       unlockTime.setHours(24, 0, 0, 0); // move to next midnight

//       if (new Date() < unlockTime) {
//         locked = true;
//       }
//     }

//     // Advance to next day if unlocked and within duration
//     if (!locked && session.lastSubmittedAt) {
//       if (session.currentDay < session.duration) {
//         session.currentDay += 1;
//         await session.save();
//       }
//     }

//     const todayQuestions = locked
//       ? []
//       : therapyQuestions[session.currentDay] || ["How do you feel today?"];

//     res.status(200).json({
//       success: true,
//       session: {
//         ...session._doc,
//         questions: todayQuestions,
//         locked,
//         unlockTime,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };
export const getSession = async (req, res) => {
  try {
    const { userId } = req.params;

    let session = await TherapySession.findOne({ userId });
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    // Check if session should be unlocked (after unlockTime)
    if (session.locked && session.unlockTime) {
      const now = new Date();
      if (now >= new Date(session.unlockTime)) {
        session.locked = false;
        session.unlockTime = null;
        await session.save();
      }
    }

    // Get today's questions based on currentDay
    const questions = therapyQuestions[session.currentDay] || [];

    res.status(200).json({
      success: true,
      session: {
        ...session._doc,
        questions: questions
      }
    });
  } catch (err) {
    console.error("Get session error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    const session = await TherapySession.findOne({ userId, isCompleted: false });
    if (!session) return res.status(404).json({ success: false, message: "No active session" });

    res.json({ success: true, session });
  } catch (err) {
    console.error("Get progress error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getLatestTherapy = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, message: "UserId required" });
    }

    // Find latest session by startDate
    const latestSession = await TherapySession.findOne({ userId })
      .sort({ startDate: -1 })   // most recent first
      .populate("userId", "name email"); // optional: get user info too

    if (!latestSession) {
      return res.status(404).json({ success: false, message: "No therapy sessions found for this user" });
    }

    res.json({ success: true, session: latestSession });
  } catch (err) {
    console.error("Get latest therapy error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


 

export const getAllTherapies = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, message: "UserId required" });
    }

    // Fetch all therapy sessions for user
    const sessions = await TherapySession.find({ userId })
      .sort({ startDate: -1 }) // most recent first
      .populate("userId", "name email");

    if (!sessions || sessions.length === 0) {
      return res.status(404).json({ success: false, message: "No therapy sessions found for this user" });
    }

    res.json({ success: true, sessions });
  } catch (err) {
    console.error("Get all therapies error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



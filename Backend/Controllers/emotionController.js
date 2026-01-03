import EmotionResult from "../models/EmotionResult.js";


export const saveResult = async (req, res) => {
  try {
    const { userId, emotion, probability, sourceType, extraData } = req.body;

    if (!userId || !emotion || probability == null || !sourceType) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newResult = new EmotionResult({
      userId,
      emotion,
      probability,
      sourceType,
      extraData
    });

    await newResult.save();

    res.json({ success: true, data: newResult });
  } catch (error) {
    console.error("Error saving emotion result:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getUserResults = async (req, res) => {
  try {
    const { userId } = req.params;
    const results = await EmotionResult.find({ userId }).sort({ timestamp: -1 });
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};


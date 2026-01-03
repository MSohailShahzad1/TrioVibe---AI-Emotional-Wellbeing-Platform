import express from "express"
import { getUserResults, saveResult } from "../Controllers/emotionController.js";
import { predictTextEmotion } from "../Controllers/mlController.js";


const emotionRouter = express.Router();
emotionRouter.post("/getResult", getUserResults);
emotionRouter.post("/saveResult", saveResult);
emotionRouter.post("/predict", predictTextEmotion);

export default emotionRouter;
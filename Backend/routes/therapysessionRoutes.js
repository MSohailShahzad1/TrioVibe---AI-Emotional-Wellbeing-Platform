import express from "express";
import {  submitAnswer, getProgress, startTherapy, getLatestTherapy,getAllTherapies, getSession } from "../Controllers/therapyController.js";

const therapyRouter = express.Router();

therapyRouter.post("/start", startTherapy);
therapyRouter.post("/answer", submitAnswer);
therapyRouter.get("/progress/:userId", getProgress);
therapyRouter.get("/therapy/latest/:userId", getLatestTherapy);
therapyRouter.get("/history/:userId", getAllTherapies);
therapyRouter.get("/session/:userId",getSession)

export default therapyRouter;

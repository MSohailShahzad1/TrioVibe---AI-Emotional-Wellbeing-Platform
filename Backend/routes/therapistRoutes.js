

// export default therapistRouter;
import express from "express";
import { protectRoute } from "../middleware/auth.js";

import {
  requestTherapist,
  getTherapistRequests,
  updateTherapistStatus,getAllTherapists,getTherapistDetails,getTherapistReviews,getTherapistRating
} from "../Controllers/therapistController.js";

const therapistRouter = express.Router();

// therapistRouter.use(protectRoute);

// USER requests upgrade
therapistRouter.post("/request", requestTherapist);

// ADMIN fetches pending requests
therapistRouter.get("/requests", getTherapistRequests);

// ADMIN approves / rejects
therapistRouter.put("/update/:userId", updateTherapistStatus);

// GET all approved therapists (for frontend listing)
therapistRouter.get("/all", getAllTherapists);

// GET details of one therapist
therapistRouter.get("/:therapistId", getTherapistDetails);

therapistRouter.get("/:id/reviews", getTherapistReviews);

therapistRouter.get("/:id/rating", getTherapistRating);




export default therapistRouter;

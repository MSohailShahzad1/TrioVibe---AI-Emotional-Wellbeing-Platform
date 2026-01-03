// import express from "express";
// import { protectRoute } from "../middleware/auth.js";
// import {
//   bookAppointment,
//   approveAppointment,
//   completeAppointment,
//   addReview,getMyAppointments,getTherapistAppointments
// } from "../Controllers/appointmentController.js";

// const appointmentRouter = express.Router();
// // appointmentRouter.use(protectRoute);

// // User books appointment
// appointmentRouter.post("/book", bookAppointment);

// // Therapist approves appointment
// appointmentRouter.put("/approve/:appointmentId", approveAppointment);

// // Therapist marks completed
// appointmentRouter.put("/complete/:appointmentId", completeAppointment);

// // User adds review after completion
// appointmentRouter.post("/review/:appointmentId", addReview);

// // User sees their appointments
// appointmentRouter.get("/my", getMyAppointments);

// // Therapist sees appointments booked with them
// appointmentRouter.get("/therapist", getTherapistAppointments);


// export default appointmentRouter;
import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
  bookAppointment,
  getMyAppointments,
  getTherapistAppointments,
  approveAppointment,
  completeAppointment,
  addReview,
  getAppointmentDetails
} from "../Controllers/appointmentController.js";

const appointmentRouter = express.Router();
appointmentRouter.use(protectRoute);

appointmentRouter.post("/book", bookAppointment);
appointmentRouter.get("/my", getMyAppointments);
appointmentRouter.get("/therapist", getTherapistAppointments);
appointmentRouter.put("/approve/:appointmentId", approveAppointment);
appointmentRouter.put("/complete/:appointmentId", completeAppointment);
appointmentRouter.post("/review/:appointmentId", addReview);
appointmentRouter.get("/details/:appointmentId", getAppointmentDetails);


export default appointmentRouter;

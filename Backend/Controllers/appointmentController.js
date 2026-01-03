import Appointment from "../models/Appointment.js";
import User from "../models/User.js";

// ---------------------------------------------
// USER: Book Appointment
// ---------------------------------------------
export const bookAppointment = async (req, res) => {
  try {
    const { therapistId, date } = req.body;

    if (!therapistId || !date) {
      return res.status(400).json({ message: "Therapist ID and date are required" });
    }

    const userId = req.user?._id?.toString();
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const appointmentDate = new Date(date);

    // Prevent overlapping appointments
    const existing = await Appointment.findOne({
      user: userId,
      therapist: therapistId,
      date: appointmentDate,
      status: { $in: ["pending", "approved"] },
    });

    if (existing) {
      return res.status(400).json({
        message: "You already have an appointment with this therapist at this time.",
      });
    }

    const appointment = await Appointment.create({
      user: userId,
      therapist: therapistId,
      date: appointmentDate,
      status: "pending",
      reviewed: false,
    });

    res.json({ message: "Appointment booked", appointment });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const appointments = await Appointment.find({ user: userId })
      .populate("therapist", "name profile therapyPreferences rating totalReviews")
      .sort({ date: -1 });

    res.json({ appointments });
  } catch (error) {
    console.error("Get My Appointments Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getTherapistAppointments = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    if (user.role !== "therapist") {
      return res.status(403).json({ message: "Only therapists can view this." });
    }

    const appointments = await Appointment.find({ therapist: user._id })
      .populate("user", "name profile")
      .sort({ date: -1 });

    res.json({ appointments });
  } catch (error) {
    console.error("Get Therapist Appointments Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


// ---------------------------------------------
// THERAPIST: Approve Appointment
// ---------------------------------------------
export const approveAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = "approved";
    await appointment.save();

    res.json({ message: "Appointment approved" });
  } catch (error) {
    console.error("Approve Appointment Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ---------------------------------------------
// THERAPIST: Mark Completed
// ---------------------------------------------
export const completeAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = "completed";
    await appointment.save();

    res.json({ message: "Appointment marked completed" });
  } catch (error) {
    console.error("Complete Appointment Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ---------------------------------------------
// USER: Add Review After Completion
// ---------------------------------------------



// export const addReview = async (req, res) => {
//   try {
//     const { appointmentId } = req.params;
//     const { rating, review } = req.body;
//     const userId = req.user?._id?.toString();

//     if (!userId) return res.status(401).json({ message: "Unauthorized" });

//     const appointment = await Appointment.findById(appointmentId).populate("user");
//     if (!appointment) return res.status(404).json({ message: "Appointment not found" });
//     if (appointment.user._id.toString() !== userId) return res.status(403).json({ message: "Not your appointment" });
//     if (appointment.status !== "completed") return res.status(400).json({ message: "Appointment not completed yet" });
//     if (appointment.reviewed) return res.status(400).json({ message: "Already reviewed" });

//     // Save review on appointment
//     appointment.rating = rating;
//     appointment.review = review;
//     appointment.reviewed = true;
//     await appointment.save();

//     // Update therapist (User) rating
//     const therapistUser = await User.findById(appointment.therapist);

//     therapistUser.totalReviews += 1;
//     therapistUser.rating = ((therapistUser.rating * (therapistUser.totalReviews - 1)) + rating) / therapistUser.totalReviews;

//     // Add to reviews array
//     therapistUser.reviews.push({
//       user: appointment.user._id,
//       userName: appointment.user.profile?.fullName || appointment.user.name,
//       rating,
//       comment: review,
//       createdAt: new Date()
//     });

//     await therapistUser.save();

//     res.json({ message: "Review submitted" });
//   } catch (error) {
//     console.error("Add Review Error:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

export const addReview = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user?._id?.toString();

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate("user", "profile.fullName name");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.user._id.toString() !== userId) {
      return res.status(403).json({ message: "Not your appointment" });
    }

    if (appointment.status !== "completed") {
      return res.status(400).json({ message: "Appointment not completed yet" });
    }

    if (appointment.reviewed) {
      return res.status(400).json({ message: "Already reviewed" });
    }

    // ✅ Save review on appointment
    appointment.rating = rating;
    appointment.review = review;
    appointment.reviewed = true;
    await appointment.save();

    // ✅ Update therapist rating
    const therapist = await User.findById(appointment.therapist);
    therapist.totalReviews += 1;
    therapist.rating =
      ((therapist.rating * (therapist.totalReviews - 1)) + rating) /
      therapist.totalReviews;

    await therapist.save();

    res.json({ message: "Review submitted successfully" });
  } catch (error) {
    console.error("Add Review Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};




export const getAppointmentDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user?._id?.toString();

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const appointment = await Appointment.findById(appointmentId)
      .populate("therapist", "name email qualifications rating totalReviews")
      .populate("user", "name email");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // ensure only user can access it
    if (appointment.user._id.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({
      appointment
    });
  } catch (error) {
    console.error("Get Appt Details Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


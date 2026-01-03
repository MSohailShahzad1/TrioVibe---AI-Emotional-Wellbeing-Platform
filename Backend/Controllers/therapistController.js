import User from "../models/User.js";
import Appointment from "../models/Appointment.js"

// USER sends therapist upgrade request
export const requestTherapist = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.therapistRequest === "pending") {
      return res.status(400).json({ message: "Request already pending" });
    }

    user.therapistRequest = "pending";
    await user.save();

    res.json({ message: "Therapist upgrade request submitted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ADMIN gets all pending therapist requests
export const getTherapistRequests = async (req, res) => {
  try {
    const requests = await User.find({ therapistRequest: "pending" });
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ADMIN approves or rejects request
export const updateTherapistStatus = async (req, res) => {
  try {
    const { action } = req.body; // approve / reject
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (action === "approve") {
      user.role = "therapist";
      user.therapistRequest = "approved";
    } else if (action === "reject") {
      user.therapistRequest = "rejected";
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    await user.save();

    res.json({ message: "Action completed", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};



// GET all approved therapists
export const getAllTherapists = async (req, res) => {
  try {
    const therapists = await User.find({ role: "therapist" })
      .select("-password"); // do not send password

    res.json({ therapists });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// GET single therapist details


// export const getTherapistDetails = async (req, res) => {
//   try {
//     const { therapistId } = req.params;

//     // Fetch therapist info
//     const therapist = await User.findById(therapistId).select(
//       "-password -email"
//     );
//     if (!therapist || therapist.role !== "therapist") {
//       return res.status(404).json({ message: "Therapist not found" });
//     }

//     // Fetch all reviews from appointments
//     const appointmentsWithReviews = await Appointment.find({
//       therapist: therapistId,
//       reviewed: true,
//     })
//       .populate("user", "profile") // populate the user who gave review
//       .sort({ createdAt: -1 });

//     const reviews = appointmentsWithReviews.map((appt) => ({
//       _id: appt._id,
//       rating: appt.rating,
//       review: appt.review,
//       createdAt: appt.updatedAt,
//       user: appt.user, // populated user
//     }));

//     res.json({
//       therapist,
//       reviews,
//     });
//   } catch (err) {
//     console.error("Get Therapist Details Error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };







export const getTherapistDetails = async (req, res) => {
  try {
    const { therapistId } = req.params;

    const therapist = await User.findById(therapistId).select(
      "-password -email"
    );

    if (!therapist || therapist.role !== "therapist") {
      return res.status(404).json({ message: "Therapist not found" });
    }

    const appointmentsWithReviews = await Appointment.find({
      therapist: therapistId,
      reviewed: true,
      status: "completed",
    })
      .populate({
        path: "user",
        select: "profile", // ✅ full profile
      })
      .sort({ createdAt: -1 });

    const reviews = appointmentsWithReviews.map((appt) => ({
      _id: appt._id,
      rating: appt.rating,
      review: appt.review,
      createdAt: appt.createdAt, // ✅ FIXED
      user: appt.user,
    }));

    res.json({
      therapist,
      reviews,
    });
  } catch (error) {
    console.error("Get Therapist Details Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};












export const getTherapistReviews = async (req, res) => {
  try {
    const therapistId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Validate therapist
    const therapist = await User.findById(therapistId);
    if (!therapist || therapist.role !== "therapist") {
      return res.status(404).json({ message: "Therapist not found" });
    }

    const reviews = await Appointment.find({
      therapist: therapistId,
      reviewed: true,
      status: "completed",
    })
      .populate({
        path: "user",
        select: "profile name",
      })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalReviews = await Appointment.countDocuments({
      therapist: therapistId,
      reviewed: true,
      status: "completed",
    });

    const formatted = reviews.map((appt) => ({
      _id: appt._id,
      rating: appt.rating,
      review: appt.review,
      createdAt: appt.updatedAt,
      user: {
        name: appt.user?.profile?.fullName || appt.user?.name || "Anonymous",
        avatar: appt.user?.profile?.avatar || "👤",
      },
    }));

    res.json({
      reviews: formatted,
      hasMore: skip + reviews.length < totalReviews,
    });
  } catch (error) {
    console.error("Get Therapist Reviews Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// GET /api/therapist/:id/rating


export const getTherapistRating = async (req, res) => {
  try {
    const therapistId = req.params.id;
    const therapist = await User.findById(therapistId).select("rating totalReviews");

    if (!therapist || therapist.role !== "therapist") {
      return res.status(404).json({ message: "Therapist not found" });
    }

    res.json({
      rating: therapist.rating.toFixed(1),
      totalReviews: therapist.totalReviews,
    });
  } catch (err) {
    console.error("Get Therapist Rating Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

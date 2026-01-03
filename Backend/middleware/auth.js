
// import jwt from "jsonwebtoken";
// import User from "../models/User.js";






// export const protectRoute = async (req, res, next) => {
//   try {
//     let token;
//     const auth = req.headers.authorization;

//     if (auth && auth.startsWith("Bearer ")) {
//       token = auth.split(" ")[1];
//     } else if (req.headers.token) {
//       token = req.headers.token;
//     }

//     if (!token) {
//       return res.status(401).json({ success: false, message: "No token provided" });
//     }

//     // ✅ Verify and decode
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     if (!decoded?.userId) {
//       return res.status(401).json({ success: false, message: "Invalid token payload" });
//     }

//     // ✅ Find user by decoded.userId
//     const user = await User.findById(decoded.userId).select("-password");
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     req.user = user;
//     next();
//   } catch (err) {
//     console.error("protectRoute error:", err.message);
//     res.status(401).json({ success: false, message: "Invalid or expired token" });
//   }
// };


import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    let token;
    const auth = req.headers.authorization;

    if (auth && auth.startsWith("Bearer ")) {
      token = auth.split(" ")[1];
    } else if (req.headers.token) {
      token = req.headers.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Support all possible token styles:
    // { userId }, or { id }, or { _id }
    const id =
      decoded?.userId ||
      decoded?.id ||
      decoded?._id ||
      null;

    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload (missing userId)"
      });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("protectRoute error:", err.message);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};





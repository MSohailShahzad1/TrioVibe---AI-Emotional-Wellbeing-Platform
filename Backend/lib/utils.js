// utils/generateToken.js
import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
  return jwt.sign(
    { userId: String(userId) },       // <-- consistent key
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

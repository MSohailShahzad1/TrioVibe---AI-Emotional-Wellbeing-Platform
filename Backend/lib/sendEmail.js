import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"NeuroVibe" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    return true;
  } catch (err) {
    console.error("Email sending failed:", err.message);
    return false;
  }
};

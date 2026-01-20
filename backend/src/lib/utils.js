import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign(
    { userId }, // ✅ Prisma UUID
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,                // prevents XSS
    sameSite: "strict",            // CSRF protection
    secure: process.env.NODE_ENV === "production", // ✅ Render-safe
  });

  return token;
};

import jwt from "jsonwebtoken";
import prisma from "../lib/db.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    // 🔹 No token
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided" });
    }

    // 🔹 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized - Invalid Token" });
    }

    // 🔹 Get user from PostgreSQL (Prisma)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        profilePic: true,
      },
    });

    // 🔹 User not found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔹 Attach user to request
    req.user = user;

    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error);
    return res
      .status(401)
      .json({ message: "Unauthorized - Token failed" });
  }
};

import jwt from "jsonwebtoken";
import prisma from "../lib/db.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    // No token
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fix token ID reference
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    // Fetch user from DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error("❌ protectRoute Error:", error);
    return res.status(401).json({ message: "Unauthorized - Token Failed" });
  }
};

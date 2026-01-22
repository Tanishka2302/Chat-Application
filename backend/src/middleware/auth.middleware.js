import jwt from "jsonwebtoken";
import prisma from "../lib/db.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
      },
    });

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = {
      id: user.id,
      fullName: user.name,
      email: user.email,
      profilePic: user.profilePic,
    };

    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};

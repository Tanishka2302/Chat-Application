import bcrypt from "bcryptjs";
import prisma from "../lib/db.js";
import { generateToken } from "../lib/utils.js";

// ====================== SIGNUP ======================
export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const name = fullName; // Map frontend → Prisma DB field

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Generate JWT
    generateToken(newUser.id, res);

    return res.status(201).json({
      id: newUser.id,
      fullName: newUser.name,
      email: newUser.email,
      profilePic: null, // DB doesn't have this yet
    });

  } catch (error) {
    console.error("❌ Signup Error:", error);
    return res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

// ====================== LOGIN ======================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user.id, res);

    return res.status(200).json({
      id: user.id,
      fullName: user.name,
      email: user.email,
      profilePic: null,
    });

  } catch (error) {
    console.error("❌ Login Error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
};

// ====================== LOGOUT ======================
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("❌ Logout Error:", error);
    return res.status(500).json({ message: "Logout failed" });
  }
};

// ====================== UPDATE PROFILE (DISABLED SAFE) ======================
export const updateProfile = async (req, res) => {
  return res.status(200).json({
    message: "Profile updates disabled (DB has no profilePic yet)",
  });
};

// ====================== CHECK AUTH ======================
export const checkAuth = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return res.status(200).json({
      id: user.id,
      fullName: user.name,
      email: user.email,
      profilePic: null,
    });

  } catch (error) {
    console.error("❌ CheckAuth Error:", error);
    return res.status(500).json({ message: "Auth check failed" });
  }
};

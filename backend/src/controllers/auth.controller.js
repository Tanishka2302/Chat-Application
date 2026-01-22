import bcrypt from "bcryptjs";
import prisma from "../lib/db.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

// ====================== SIGNUP ======================
export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const name = fullName; // map frontend → prisma


    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        profilePic: null,
      },
    });

    // Generate JWT cookie
    generateToken(newUser.id, res);

    return res.status(201).json({
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });

  } catch (error) {
    console.error("❌ Signup Error:", error);
    return res.status(500).json({ message: "Signup failed" });
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
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
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

// ====================== UPDATE PROFILE ======================
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePic: uploadResponse.secure_url },
    });

    return res.status(200).json(updatedUser);

  } catch (error) {
    console.error("❌ Update Profile Error:", error);
    return res.status(500).json({ message: "Update failed" });
  }
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
        fullName: true,
        email: true,
        profilePic: true,
      },
    });

    return res.status(200).json(user);

  } catch (error) {
    console.error("❌ SIGNUP FAILED FULL ERROR:", error);
    return res.status(500).json({ 
      message: "Signup failed", 
      error: error.message 
    });
  }
  
};

import bcrypt from "bcryptjs";
import prisma from "../lib/db.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

// ====================== SIGNUP ======================
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // 🔹 Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 🔹 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 Create user
    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
      },
    });

    // 🔹 Generate JWT
    generateToken(newUser.id, res);

    res.status(201).json({
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
  } catch (error) {
    console.error("Error in signup controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ====================== LOGIN ======================
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user.id, res);

    res.status(200).json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ====================== LOGOUT ======================
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ====================== UPDATE PROFILE ======================
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user.id; // 🔹 Prisma uses `id`, not `_id`

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    // 🔹 Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    // 🔹 Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profilePic: uploadResponse.secure_url,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ====================== CHECK AUTH ======================
export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in checkAuth controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

import bcrypt from "bcryptjs";
import prisma from "../lib/db.js";
import { generateToken } from "../lib/utils.js";
export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
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
        name: fullName, // Prisma uses "name"
        email,
        password: hashedPassword,
      },
    });

    generateToken(newUser.id, res);

    return res.status(201).json({
      id: newUser.id,
      fullName: newUser.name,
      email: newUser.email,
      profilePic: null,
    });

  } catch (error) {
    console.error("❌ Signup Error:", error);
    return res.status(500).json({ message: "Signup failed" });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    generateToken(user.id, res);

    res.json({
      id: user.id,
      fullName: user.name,
      email: user.email,
      profilePic: user.profilePic,
    });

  } catch {
    res.status(500).json({ message: "Login failed" });
  }
};

export const logout = (req, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.json({ message: "Logged out" });
};

export const checkAuth = async (req, res) => {
  res.json(req.user);
};

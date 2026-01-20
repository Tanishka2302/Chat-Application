import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// 🔹 Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// 🔹 CORS (Render + local safe)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.options("*", cors());

// 🔹 API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// 🔹 Serve frontend (PRODUCTION)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get( (req, res) => {
    res.sendFile(
      path.join(__dirname, "../frontend/dist/index.html")
    );
  });
}

// 🔹 Start server AFTER DB connects
const startServer = async () => {
  try {
    await connectDB(); // ✅ PostgreSQL (Neon) connection
    server.listen(PORT, () => {
      console.log("🚀 Server running on PORT:", PORT);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

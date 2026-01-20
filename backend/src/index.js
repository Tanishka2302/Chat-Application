import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";


import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5001;

// ✅ Correct __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.get("/", (req, res) => {
  res.send("ROOT WORKING");
});

// 🔹 Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// 🔹 CORS (same-domain safe)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// 🔹 API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// 🔹 Serve frontend (PRODUCTION ONLY)
// 🔹 Serve frontend (PRODUCTION)
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.resolve(__dirname, "../dist");

  console.log("📦 Frontend path:", frontendPath);

  try {
    const files = fs.readdirSync(frontendPath);
    console.log("📂 Frontend files:", files);
  } catch (err) {
    console.error("❌ Cannot read frontend folder:", err.message);
  }

  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}


// 🔹 Start server AFTER DB connects
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log("🚀 Server running on PORT:", PORT);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

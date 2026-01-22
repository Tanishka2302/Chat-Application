import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    onlineUsers.set(userId, socket.id);
    console.log("✅ User connected:", userId);
  }

  io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));

  socket.on("disconnect", () => {
    if (userId) {
      onlineUsers.delete(userId);
      console.log("❌ User disconnected:", userId);
    }

    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
  });
});

export { app, server, io };

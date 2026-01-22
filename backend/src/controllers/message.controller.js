import prisma from "../lib/db.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// ================= GET USERS FOR SIDEBAR =================
export const getUsersForSidebar = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { id: { not: req.user.id } },
      select: { id: true, name: true, email: true, profilePic: true },
    });

    // Convert name → fullName for frontend compatibility
    res.json(
      users.map((u) => ({
        ...u,
        fullName: u.name,
      }))
    );
  } catch (error) {
    console.error("❌ getUsersForSidebar error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// ================= GET MESSAGES =================
export const getMessages = async (req, res) => {
  try {
    const myId = req.user.id;
    const otherId = req.params.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: myId, receiverId: otherId },
          { senderId: otherId, receiverId: myId },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    res.json(messages);
  } catch (error) {
    console.error("❌ getMessages error:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// ================= SEND MESSAGE =================
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.params.id;
    const { text, image } = req.body;

    if (!text && !image) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    let imageUrl = null;

    // Upload image if exists
    if (image) {
      const upload = await cloudinary.uploader.upload(image);
      imageUrl = upload.secure_url;
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        text: text || null,
        image: imageUrl,
      },
    });

    // Emit real-time message
    const socketId = getReceiverSocketId(receiverId);
    if (socketId) {
      io.to(socketId).emit("newMessage", message);
    }

    res.json(message);
  } catch (error) {
    console.error("❌ sendMessage error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

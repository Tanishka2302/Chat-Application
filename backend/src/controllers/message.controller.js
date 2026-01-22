import prisma from "../lib/db.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// ====================== GET USERS FOR SIDEBAR ======================
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;

    const users = await prisma.user.findMany({
      where: {
        id: {
          not: loggedInUserId,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Map name → fullName for frontend compatibility
    const formatted = users.map((u) => ({
      id: u.id,
      fullName: u.name,
      email: u.email,
      profilePic: null,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("❌ getUsersForSidebar Error:", error);
    return res.status(500).json({ message: "Failed to load users" });
  }
};

// ====================== GET MESSAGES ======================
export const getMessages = async (req, res) => {
  try {
    const { id: otherUserId } = req.params;
    const myId = req.user.id;

    // Find or create chat between users
    let chat = await prisma.chat.findFirst({
      where: {
        users: {
          every: {
            id: { in: [myId, otherUserId] },
          },
        },
      },
      include: { messages: true },
    });

    if (!chat) {
      return res.status(200).json([]);
    }

    return res.status(200).json(chat.messages);
  } catch (error) {
    console.error("❌ getMessages Error:", error);
    return res.status(500).json({ message: "Failed to load messages" });
  }
};

// ====================== SEND MESSAGE ======================
export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.id;

    if (!message) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    // Find or create chat
    let chat = await prisma.chat.findFirst({
      where: {
        users: {
          every: {
            id: { in: [senderId, receiverId] },
          },
        },
      },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          users: {
            connect: [{ id: senderId }, { id: receiverId }],
          },
        },
      });
    }

    // Save message
    const newMessage = await prisma.message.create({
      data: {
        content: message,
        senderId,
        chatId: chat.id,
      },
    });

    // Emit real-time message
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("❌ sendMessage Error:", error);
    return res.status(500).json({ message: "Failed to send message" });
  }
};

import prisma from "../lib/db.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// ====================== GET USERS FOR SIDEBAR ======================
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user.id; // 🔹 Prisma uses `id`

    const users = await prisma.user.findMany({
      where: {
        id: {
          not: loggedInUserId,
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        profilePic: true,
      },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ====================== GET MESSAGES ======================
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: myId,
            receiverId: userToChatId,
          },
          {
            senderId: userToChatId,
            receiverId: myId,
          },
        ],
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ====================== SEND MESSAGE ======================
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.id;

    let imageUrl = null;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // 🔹 Save message in PostgreSQL
    const newMessage = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        text,
        image: imageUrl,
      },
    });

    // 🔹 Emit socket event
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

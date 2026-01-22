import prisma from "../lib/db.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  const users = await prisma.user.findMany({
    where: { id: { not: req.user.id } },
    select: { id: true, name: true, email: true, profilePic: true },
  });

  res.json(users.map(u => ({
    ...u,
    fullName: u.name
  })));
};

export const getMessages = async (req, res) => {
  const myId = req.user.id;
  const otherId = req.params.id;

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: myId, receiverId: otherId },
        { senderId: otherId, receiverId: myId }
      ]
    },
    orderBy: { createdAt: "asc" }
  });

  res.json(messages);
};

export const sendMessage = async (req, res) => {
  const senderId = req.user.id;
  const receiverId = req.params.id;
  const { text, image } = req.body;

  let imageUrl = null;

  if (image) {
    const upload = await cloudinary.uploader.upload(image);
    imageUrl = upload.secure_url;
  }

  const message = await prisma.message.create({
    data: { senderId, receiverId, text, image: imageUrl }
  });

  const socketId = getReceiverSocketId(receiverId);
  if (socketId) io.to(socketId).emit("newMessage", message);

  res.json(message);
};

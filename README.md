# 💬 Full Stack Realtime Chat Application

A modern **Full Stack Realtime Chat App** built using the **MERN stack** with real-time messaging, authentication, image sharing, and online user status.

---

## 🚀 Features

- 🌟 MERN Stack (MongoDB, Express, React, Node.js)
- 🔐 Authentication & Authorization using JWT
- 💬 Realtime messaging with Socket.io
- 🟢 Online / Offline user status
- 🖼️ Image sharing with Cloudinary
- 🧠 Global state management using Zustand
- 🎨 Responsive UI with Tailwind CSS & DaisyUI
- 🐞 Proper error handling (frontend & backend)

---

## 📂 Project Structure

fullstack-chat-app/
├── backend/
│ ├── src/
│ ├── .env
│ └── package.json
├── frontend/
│ ├── src/
│ └── package.json
└── README.md


---

## ⚙️ Environment Variables

Create a `.env` file inside the **backend** folder:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/ChatApplication
PORT=5001
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

NODE_ENV=development
📦 Installation
Backend Setup
cd backend
npm install
npm start
Backend will run on:

http://localhost:5001
Frontend Setup
cd frontend
npm install
npm run dev
Frontend will run on:

http://localhost:5173
🧪 How to Use
Register a user

Open another browser or incognito window

Register another user

Start real-time chatting

Send text and images instantly

All registered users automatically appear as contacts.

🛠️ Issues Solved
CORS configuration between frontend & backend

Image upload payload size (413 error)

MongoDB local connection via Compass

Cloudinary image uploads

Socket.io real-time communication

🧠 Learnings
Full stack authentication flow

Realtime communication with Socket.io

Secure media uploads

Advanced debugging (CORS & payload limits)

🚀 Future Enhancements
User search

Add contacts feature

Notifications

Deployment (Render / Vercel)

🙌 Author
Tanishka Pandharpatte
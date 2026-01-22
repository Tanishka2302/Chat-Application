import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = window.location.origin;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  socket: null,
  onlineUsers: [], // ✅ MUST exist to avoid undefined errors

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch {
      set({ authUser: null });
    }
  },

  signup: async (data) => {
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created");
      get().connectSocket();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Signup failed");
    }
  },

  login: async (data) => {
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in");
      get().connectSocket();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null, onlineUsers: [] });
      get().disconnectSocket();
      toast.success("Logged out");
    } catch {
      toast.error("Logout failed");
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const newSocket = io(BASE_URL, {
      query: { userId: authUser.id },
      withCredentials: true,
    });

    newSocket.connect();
    set({ socket: newSocket });

    newSocket.on("getOnlineUsers", (users) => {
      // ✅ Always safe array
      set({ onlineUsers: Array.isArray(users) ? users : [] });
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) socket.disconnect();
    set({ socket: null });
  },
}));

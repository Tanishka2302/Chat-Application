import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = window.location.origin;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  socket: null,

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
    const res = await axiosInstance.post("/auth/signup", data);
    set({ authUser: res.data });
    toast.success("Account created");
    get().connectSocket();
  },

  login: async (data) => {
    const res = await axiosInstance.post("/auth/login", data);
    set({ authUser: res.data });
    toast.success("Logged in");
    get().connectSocket();
  },

  logout: async () => {
    await axiosInstance.post("/auth/logout");
    set({ authUser: null });
    get().disconnectSocket();
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser) return;

    const socket = io(BASE_URL, {
      query: { userId: authUser.id }
    });

    socket.connect();
    set({ socket });

    socket.on("getOnlineUsers", (users) => {
      set({ onlineUsers: users });
    });
  },

  disconnectSocket: () => {
    get().socket?.disconnect();
  }
}));

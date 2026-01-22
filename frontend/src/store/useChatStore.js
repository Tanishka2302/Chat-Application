import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,

  getUsers: async () => {
    const res = await axiosInstance.get("/messages/users");
    set({ users: res.data });
  },

  getMessages: async (userId) => {
    const res = await axiosInstance.get(`/messages/${userId}`);
    set({ messages: res.data });
  },

  sendMessage: async (data) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return toast.error("Select user");

    const res = await axiosInstance.post(
      `/messages/send/${selectedUser.id}`,
      data
    );

    set({ messages: [...messages, res.data] });
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();

    socket?.on("newMessage", (msg) => {
      if (msg.senderId === selectedUser?.id) {
        set({ messages: [...get().messages, msg] });
      }
    });
  },

  unsubscribeFromMessages: () => {
    useAuthStore.getState().socket?.off("newMessage");
  },

  setSelectedUser: (user) => set({ selectedUser: user })
}));

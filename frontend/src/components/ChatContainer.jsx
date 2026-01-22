import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (!selectedUser?.id) return;

    getMessages(selectedUser.id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser?.id]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = String(message.senderId) === String(authUser?.id);

          return (
            <div
              key={message.id}
              className={`chat ${isOwn ? "chat-end" : "chat-start"}`}
              ref={messageEndRef}
            >
              <div className="chat-bubble flex flex-col">

                {message.image && (
                  <img
                    src={message.image}
                    alt="message attachment"
                    className="rounded-md mb-2 max-w-[200px]"
                  />
                )}

                {message.text && <p>{message.text}</p>}

                <time className="text-xs opacity-50 mt-1">
                  {formatMessageTime(message.createdAt)}
                </time>

              </div>
            </div>
          );
        })}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;

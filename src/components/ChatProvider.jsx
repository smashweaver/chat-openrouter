import React from "react";
import ChatContext from "../contexts/ChatContext";
import { useChat } from "../contexts/chatReducer";

const ChatProvider = ({ children }) => {
  const chat = useChat();
  return <ChatContext value={chat}>{children}</ChatContext>;
};

export default ChatProvider;

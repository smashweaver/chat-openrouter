import React from "react";
import ChatContext from "../contexts/ChatContext";
import { useChat } from "../hooks/UseChat";

const ChatProvider = ({ children }) => {
  const chat = useChat();
  return <ChatContext value={chat}>{children}</ChatContext>;
};

export default ChatProvider;

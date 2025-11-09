import { useReducer } from "react";
import { chatReducer } from "../contexts/ChatReducer";

export const useChat = () => {
  const [state, dispatch] = useReducer(chatReducer, {
    active: null,
    chats: [],
  });

  const activateChat = (chatId) => {
    dispatch({ type: "CHAT:ACTIVATE", payload: chatId });
  };

  const createChat = (message) => {
    dispatch({ type: "CHAT:CREATE", payload: message });
  };

  const deleteChat = (chatId) => {
    dispatch({ type: "CHAT:DELETE", payload: chatId });
  };

  const addMessage = (message) => {
    dispatch({ type: "CHAT:SEND_MESSAGE", payload: message });
  };

  return {
    activeChat: state.active,
    chats: state.chats,
    activateChat,
    createChat,
    deleteChat,
    addMessage,
  };
};

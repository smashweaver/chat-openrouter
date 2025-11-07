import React, { useReducer } from "react";
import { produce } from "immer";
import { newChat } from "../utils/chat";

export const chatReducer = produce((draft, action) => {
  let chat;
  switch (action.type) {
    case "CHAT:ACTIVATE":
      draft.active = action.payload;
      break;
    case "CHAT:CREATE":
      chat = newChat(action.payload);
      draft.chats.unshift(chat);
      draft.active = chat.id;
      break;
    case "CHAT:DELETE":
      var indexToDelete = draft.chats.findIndex((c) => c.id === action.payload);
      draft.chats.splice(indexToDelete, 1);
      if (draft.activeChat === action.payload) {
        draft.activeChat = draft.chats.length > 0 ? draft.chats[0].id : null;
      }
      break;
    case "CHAT:SEND_MESSAGE":
      chat = draft.chats.find((c) => c.id === draft.active);
      if (chat) {
        chat.messages.push(action.payload);
      }
      break;
    default:
      console.error(`unknown action ${action.type}`);
  }
});

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
    if (state.chats.length === 0) {
      createChat();
    }
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

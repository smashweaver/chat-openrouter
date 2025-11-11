import { produce } from "immer";
import { newChat } from "./Chat";

export const chatReducer = produce((draft, action) => {
  let chat;
  switch (action.type) {
    case "CHAT:LOAD":
      // Bulk state hydration from storage
      draft.active = action.payload.active;
      draft.chats = action.payload.chats;
      break;
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
      if (draft.active === action.payload) {
        draft.active = draft.chats.length > 0 ? draft.chats[0].id : null;
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

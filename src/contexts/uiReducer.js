import React, { useReducer } from "react";
import { produce } from "immer";

export const uiReducer = produce((draft, action) => {
  switch (action.type) {
    case "UI:START_CHAT":
      draft.isChatting = true;
      break;
    case "UI:GO_BACK":
      draft.isChatting = false;
      break;
    default:
      console.error(`unknown action ${action.type}`);
  }
});

export const useUI = () => {
  const [state, dispatch] = useReducer(uiReducer, { isChatting: false });
  const goBack = () => dispatch({ type: "UI:GO_BACK" });
  const startChat = () => dispatch({ type: "UI:START_CHAT" });
  const isChatting = state.isChatting;

  return { isChatting, goBack, startChat };
};

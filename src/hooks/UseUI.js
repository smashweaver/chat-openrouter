import { useReducer } from "react";
import { uiReducer } from "../contexts/UIReducer";

export const useUI = () => {
  const [state, dispatch] = useReducer(uiReducer, { isChatting: false });
  const goBack = () => dispatch({ type: "UI:GO_BACK" });
  const startChat = () => dispatch({ type: "UI:START_CHAT" });
  const isChatting = state.isChatting;

  return { isChatting, goBack, startChat };
};

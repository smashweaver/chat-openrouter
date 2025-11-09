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

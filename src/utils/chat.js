import { v4 as uuid } from "uuid";

export function newChat(message) {
  const now = new Date();
  const date = now.toLocaleDateString("en-GB");
  const time = now.toLocaleTimeString("en-GB");
  const messages = message ? [message] : [];

  return {
    id: uuid(),
    displayId: `chat ${date} ${time}`,
    messages: [...messages],
  };
}

// type: "prompt" | "response"
export function newMessage(text, type = "prompt") {
  const now = new Date();
  const message = {
    type: type,
    text: text,
    timestamp: now.toLocaleTimeString("en-GB"),
  };

  return message;
}

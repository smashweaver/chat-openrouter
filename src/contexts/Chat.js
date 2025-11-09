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

function newMessage(text, type) {
  const now = new Date();
  const message = {
    type: type,
    text: text,
    timestamp: now.toLocaleTimeString("en-GB"),
  };

  return message;
}

export function newResponse(text) {
  return newMessage(text, "response");
}

export function newPrompt(text) {
  return newMessage(text, "prompt");
}

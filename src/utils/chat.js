import { v4 as uuid } from "uuid";

export class Chat {
  static create(now = new Date()) {
    const date = now.toLocaleDateString("en-GB");
    const time = now.toLocaleTimeString("en-GB");
    return {
      id: uuid(),
      displayId: `chat ${date} ${time}`,
      messages: [],
    };
  }
}

import React, { useEffect, useState } from "react";
import debounce from "../utils/debounce";
import { newMessage } from "../utils/chat";
import "./ChatBotApp.css";

const ChatBotApp = ({
  chats,
  setChats,
  activeChat,
  setActiveChat,
  onGoBack,
  onNewChat,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState();

  const handleInputValue = (e) => {
    setInputValue(e.target.value);
  };

  const sendMessage = () => {
    // Prevent sending empty messages
    if (inputValue.trim() === "") return;

    // Create a new message object with user prompt
    const message = newMessage(inputValue);

    if (!activeChat) {
      onNewChat(message);
    } else {
      // Create new messages array using spread operator for immutability
      const updatedMessages = [...messages, message];

      // Create new chats array using map() for immutability
      // Only update the active chat while preserving other chats
      const updatedChats = chats.map((chat) => {
        if (chat.id === activeChat) {
          // Create new chat object with updated messages using spread operator
          return { ...chat, messages: updatedMessages };
        }
        return chat; // Return unchanged chat objects
      });

      // Update the state with the modified chats array
      setChats(updatedChats);
    }

    // Clear the input field after sending
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSelectChat = (id) => setActiveChat(id);

  const handleDeleteChat = (id) => {
    const updatedChats = chats.filter((chat) => chat.id !== id);
    setChats(updatedChats);

    if (activeChat === id) {
      const newActiveChat = updatedChats.length > 0 ? updatedChats[0].id : null;
      setActiveChat(newActiveChat);
    }
  };

  const debouncedSelectChat = debounce(handleSelectChat, 100);

  const debouncedDeleteChat = debounce(handleDeleteChat, 100);

  const handleNewChat = (e) => {
    e.stopPropagation();
    onNewChat();
  };

  const debouncedNewChat = debounce(handleNewChat, 100);

  // init messages state
  useEffect(() => {
    const activeChatObj = chats.find((chat) => chat.id === activeChat);
    setMessages(activeChatObj ? activeChatObj.messages : []);
  }, [activeChat, chats]);

  return (
    <div className="chat-app">
      <div className="chat-list">
        <div className="chat-list-header">
          <h2>Chat List</h2>
          <i className="bx bx-edit-alt new-chat" onClick={debouncedNewChat}></i>
        </div>

        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-list-item ${
              chat.id === activeChat ? "active" : ""
            }`}
            onClick={() => debouncedSelectChat(chat.id)}
          >
            <h4>{chat.displayId}</h4>
            <i
              className="bx bx-x-circle"
              onClick={(e) => {
                e.stopPropagation();
                debouncedDeleteChat(chat.id);
              }}
            ></i>
          </div>
        ))}
      </div>

      <div className="chat-window">
        <div className="chat-title">
          <h3>Chat with Ai</h3>
          <i className="bx bx-arrow-back arrow" onClick={onGoBack}></i>
        </div>

        <div className="chat">
          {(messages ?? []).map((message, index) => (
            <div
              key={index}
              className={message.type === "prompt" ? "prompt" : "response"}
            >
              {message.text}
            </div>
          ))}

          <div className="typing">Typing...</div>
        </div>

        <form className="msg-form" onSubmit={(e) => e.preventDefault()}>
          <i className="fa-solid fa-face-smile emoji"></i>
          <input
            type="text"
            className="msg-input"
            placeholder="Type a message..."
            value={inputValue}
            onChange={handleInputValue}
            onKeyDown={handleKeyDown}
          />
          <i className="fa-solid fa-paper-plane" onClick={sendMessage}></i>
        </form>
      </div>
    </div>
  );
};

export default ChatBotApp;

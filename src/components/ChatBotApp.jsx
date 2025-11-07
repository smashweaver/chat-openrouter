import React, { useCallback, useContext, useState, useEffect } from "react";

import debounce from "../utils/debounce";
import ChatContext from "../contexts/ChatContext";
import { newMessage } from "../utils/chat";

import "./ChatBotApp.css";

const ChatBotApp = ({ onGoBack }) => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);

  const {
    activeChat,
    chats,
    activateChat,
    createChat,
    deleteChat,
    addMessage,
  } = useContext(ChatContext);

  const onNewChat = useCallback(() => createChat(), [createChat]);

  const handleActivateChat = (chatId) => activateChat(chatId);

  const handleDeleteChat = (chatId) => deleteChat(chatId);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNewChat = (e) => {
    e.stopPropagation();
    onNewChat();
  };

  const handleInputValue = (e) => setInputValue(e.target.value);

  const debouncedSelectChat = debounce(handleActivateChat, 100);

  const debouncedDeleteChat = debounce(handleDeleteChat, 100);

  const debouncedNewChat = debounce(handleNewChat, 100);

  const sendMessage = () => {
    if (inputValue.trim() === "") return;

    addMessage(newMessage(inputValue));

    setInputValue("");
  };

  useEffect(() => {
    let chat = chats.find((c) => c.id === activeChat);
    if (chat) {
      setMessages(chat.messages);
    } else {
      setMessages([]);
    }
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
          {messages.map((message, index) => (
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

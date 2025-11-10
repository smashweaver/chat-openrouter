import React, {
  useCallback,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

import { createPortal } from "react-dom";

import debounce from "../utils/debounce";
import ChatContext from "../contexts/ChatContext";
import { chatStream } from "../utils/openai";
import { newPrompt, newResponse } from "../contexts/Chat";
import EmojiPicker from "./EmojiPicker";

import "./ChatBotApp.css";

const ChatBotApp = ({ onGoBack }) => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [streamingResponse, setStreamingResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatEndRef = useRef(null);

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
      handleSendMessage();
    }
  };

  const handleNewChat = (e) => {
    e.stopPropagation();
    onNewChat();
  };

  const handleStreamingResponse = async (userInput) => {
    setIsStreaming(true);
    setStreamingResponse("");
    let accumulatedResponse = "";

    try {
      const stream = chatStream(userInput);

      for await (const chunk of stream) {
        accumulatedResponse += chunk;
        setStreamingResponse(accumulatedResponse);
      }

      // Stream completed successfully
      addMessage(newResponse(accumulatedResponse));
    } catch (error) {
      console.error("Streaming error:", error);
      addMessage(
        newResponse(
          "Sorry, I encountered an error while processing your request."
        )
      );
    } finally {
      setIsStreaming(false);
      setStreamingResponse("");
    }
  };

  const handleInputValue = (e) => setInputValue(e.target.value);

  const debouncedSelectChat = debounce(handleActivateChat, 100);

  const debouncedDeleteChat = debounce(handleDeleteChat, 100);

  const debouncedNewChat = debounce(handleNewChat, 100);

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;

    const userInput = inputValue;
    setInputValue("");

    // Add user message to chat
    addMessage(newPrompt(userInput));

    // Handle streaming response
    await handleStreamingResponse(userInput);
  };

  const handleEmojiSelect = (emoji) => {
    setInputValue((prev) => prev + emoji.native);
  };

  useEffect(() => {
    let chat = chats.find((c) => c.id === activeChat);
    if (chat) {
      setMessages(chat.messages);
    } else {
      setMessages([]);
    }
  }, [activeChat, chats]);

  useEffect(() => {
    if (chats.length > 0) return;
    createChat();
  }, [chats.length, createChat]);

  useEffect(() => {
    chatEndRef?.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingResponse]);

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

          {/* Show streaming response in real-time */}
          {isStreaming && streamingResponse && (
            <div className="response">{streamingResponse}</div>
          )}

          {/* Show AI working indicator when streaming but no response yet */}
          {isStreaming && !streamingResponse && (
            <div className="response ai-working">
              <div className="ai-thinking">
                <span className="ai-thinking-text">AI is thinking</span>
                <div className="thinking-dots">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef}></div>
        </div>

        <form className="msg-form" onSubmit={(e) => e.preventDefault()}>
          <i
            className="fa-solid fa-face-smile emoji"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          ></i>

          {showEmojiPicker &&
            createPortal(
              <div className="picker">
                <EmojiPicker onEmojiSelect={handleEmojiSelect}></EmojiPicker>
              </div>,
              document.body
            )}

          <input
            type="text"
            className="msg-input"
            placeholder="Type a message..."
            value={inputValue}
            onChange={handleInputValue}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowEmojiPicker(false)}
          />
          <i
            className="fa-solid fa-paper-plane"
            onClick={handleSendMessage}
          ></i>
        </form>
      </div>
    </div>
  );
};

export default ChatBotApp;

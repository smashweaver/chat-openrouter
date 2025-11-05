import React, { useState } from "react";
import ChatBotStart from "./components/ChatBotStart";
import ChatBotApp from "./components/ChatBotApp";
import { Chat } from "./utils/chat";

const App = () => {
  const [isChatting, setIsChatting] = useState(false);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  const handleStartChat = () => {
    setIsChatting(true);

    if (chats.length === 0) {
      createNewChat();
    }
  };

  const handleGoBack = () => setIsChatting(false);

  const createNewChat = () => {
    const chat = Chat.create();
    const updatedChats = [chat, ...chats];
    setChats(updatedChats);
    setActiveChat(chat.id);
  };

  return (
    <div className="container">
      {isChatting ? (
        <ChatBotApp
          chats={chats}
          setChats={setChats}
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          onGoBack={handleGoBack}
          onNewChat={createNewChat}
        />
      ) : (
        <ChatBotStart onStartChat={handleStartChat} />
      )}
    </div>
  );
};

export default App;

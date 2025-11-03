import React, { useState } from "react";
import ChatBotStart from "./components/ChatBotStart";
import ChatBotApp from "./components/ChatBotApp";

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
    // chat data structure: { id, messages }
    const newChat = {
      id: `chat ${new Date().toLocaleDateString(
        "en-GB"
      )} ${new Date().toLocaleTimeString()}`,
      messages: [],
    };

    const updatedChats = [newChat, ...chats];
    setChats(updatedChats);
    setActiveChat(newChat.id);
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

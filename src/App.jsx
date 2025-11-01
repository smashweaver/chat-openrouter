import React, { useState } from "react";
import ChatBotStart from "./components/ChatBotStart";
import ChatBotApp from "./components/ChatBotApp";

const App = () => {
  const [isChatting, setIsChatting] = useState(false);
  const [chats, setChats] = useState([]);

  const handleStartChat = () => {
    setIsChatting(true);

    // chat data structure: { id, messages }
    const newChat = {
      id: `chat ${new Date().toLocaleDateString(
        "en-GB"
      )} ${new Date().toLocaleTimeString()}`,
      messages: [],
    };

    setChats([newChat]);
  };

  const handleGoBack = () => setIsChatting(false);

  return (
    <div className="container">
      {isChatting ? (
        <ChatBotApp onGoBack={handleGoBack} chats={chats} setChats={setChats} />
      ) : (
        <ChatBotStart onStartChat={handleStartChat} />
      )}
    </div>
  );
};

export default App;

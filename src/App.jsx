import React, { Activity, useContext } from "react";
import ChatBotStart from "./components/ChatBotStart";
import ChatBotApp from "./components/ChatBotApp";
import UIContext from "./contexts/UIContext";

const App = () => {
  const { isChatting, goBack, startChat } = useContext(UIContext);

  const handleStartChat = () => startChat();

  const handleGoBack = () => goBack();

  return (
    <div className="container">
      <Activity mode={isChatting ? "visible" : "hidden"}>
        <ChatBotApp onGoBack={handleGoBack} />
      </Activity>

      <Activity mode={isChatting ? "hidden" : "visible"}>
        <ChatBotStart onStartChat={handleStartChat} />
      </Activity>
    </div>
  );
};

export default App;

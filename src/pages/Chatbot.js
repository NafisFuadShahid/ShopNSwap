import React, { useState } from "react";

function Chatbot() {
  const [text, setText] = useState("");
  const [chat, setChat] = useState([]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text) return;

    setChat([...chat, { text, user: "User" }]);
    setText("");

    const response = await fetch("http://localhost:3001/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    setChat(state => [...state, { text: data.reply, user: "Chatbot" }]);
  };

  return (
    <div className="chatbot">
      <h1>AI Chatbot</h1>
      <div className="chat-container">
        {chat.map((message, i) => (
          <p key={i}>
            <strong>{message.user}: </strong>
            {message.text}
          </p>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chatbot;

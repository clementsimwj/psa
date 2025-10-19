// src/components/ChatPanel.jsx
import React, { useState } from "react";
import axios from "axios";

export default function ChatPanel() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { type: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3000/ask", {
        question: input,
      });
      const botText = res.data.model?.headline || "No response";
      const botMessage = { type: "bot", text: botText };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "Error connecting to AI backend" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="chat-container">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble ${
              msg.type === "user" ? "chat-user" : "chat-bot"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && <div className="chat-bubble chat-bot">AI is typing...</div>}
      </div>
      <div className="chat-input-container">
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the dashboard..."
        />
        <button onClick={sendMessage}>Ask</button>
      </div>
    </div>
  );
}

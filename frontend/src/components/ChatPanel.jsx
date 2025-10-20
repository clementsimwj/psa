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
      // Build conversation history for AI context
      const conversationHistory = messages.map((msg) => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.text,
      }));

      const res = await axios.post("http://localhost:3000/ask", {
        question: input,
        conversationHistory: conversationHistory,
      });
      
      const botText = res.data.model?.headline || "No response";
      const botMessage = { type: "bot", text: botText };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Error connecting to AI backend";
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: `⚠️ ${errorMessage}` },
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
        {loading && <div className="chat-bubble chat-bot">🤖 Analyzing dashboard data...</div>}
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

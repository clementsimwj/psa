// src/components/ChatPanel.jsx
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useDashboard } from "../context/DashboardContext";

// Simple markdown-to-HTML converter
function parseMarkdown(text) {
  if (!text) return "";
  
  let html = text;
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Bullet lists (unordered)
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^• (.*$)/gim, '<li>$1</li>');
  
  // Numbered lists
  html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
  
  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  
  // Line breaks
  html = html.replace(/\n\n/g, '<br/><br/>');
  html = html.replace(/\n/g, '<br/>');
  
  return html;
}

export default function ChatPanel() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const shouldScrollRef = useRef(false);
  const { setCurrentQuestion, setFocusArea } = useDashboard();

  // Auto-scroll only when user sends a message
  useEffect(() => {
    if (shouldScrollRef.current && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      shouldScrollRef.current = false; // Reset flag
    }
  }, [messages]);

  // Detect focus area from question
  const detectFocusArea = (question) => {
    const lowerQ = question.toLowerCase();
    if (lowerQ.includes('terminal') || lowerQ.includes('business unit') || lowerQ.includes('bu')) {
      return 'terminals';
    } else if (lowerQ.includes('vessel') || lowerQ.includes('ship')) {
      return 'vessels';
    } else if (lowerQ.includes('carbon') || lowerQ.includes('sustainability') || lowerQ.includes('environment')) {
      return 'carbon';
    } else if (lowerQ.includes('performance') || lowerQ.includes('accuracy') || lowerQ.includes('berth') || lowerQ.includes('wait')) {
      return 'performance';
    } else {
      return 'overview';
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Update dashboard context with current question
    setCurrentQuestion(input);
    setFocusArea(detectFocusArea(input));
    
    const userMessage = { type: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    
    // Set flag to scroll after user message is added
    shouldScrollRef.current = true;

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

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      sendMessage();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="chat-container" ref={chatContainerRef}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble ${
              msg.type === "user" ? "chat-user" : "chat-bot"
            }`}
          >
            {msg.type === "bot" ? (
              <div 
                dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }}
              />
            ) : (
              msg.text
            )}
          </div>
        ))}
        {loading && <div className="chat-bubble chat-bot">🤖 Analyzing dashboard data...</div>}
      </div>
      <div className="chat-input-container">
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about the dashboard... (Press Enter to send)"
        />
        <button onClick={sendMessage}>Ask</button>
      </div>
    </div>
  );
}

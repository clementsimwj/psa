// src/App.jsx
import React from "react";
import ReportEmbed from "./components/ReportEmbed";
import ChatPanel from "./components/ChatPanel";
import "./styles.css";

export default function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        PSA — Global Insights (Chat + Dashboard)
      </header>
      <main className="app-main">
        <div className="left">
          <ReportEmbed />
        </div>
        <div className="right">
          <ChatPanel />
        </div>
      </main>
      <footer className="app-footer">
        Hackathon prototype — powered by React + Power BI + AI
      </footer>
    </div>
  );
}

// src/App.jsx
import React, { useState } from "react";
import ReportEmbed from "./components/ReportEmbed";
import MetricsDashboard from "./components/MetricsDashboard";
import ChatPanel from "./components/ChatPanel";
import "./styles.css";

export default function App() {
  const [useFallback, setUseFallback] = useState(false);

  return (
    <div className="app-root">
      <header className="app-header">
        <div>PSA — Global Insights (Chat + Dashboard)</div>
        <button
          onClick={() => setUseFallback(!useFallback)}
          style={{
            padding: "6px 12px",
            backgroundColor: "#4e8cff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px"
          }}
        >
          {useFallback ? "Try Power BI Embed" : "Use Metrics Dashboard"}
        </button>
      </header>
      <main className="app-main">
        <div className="left">
          {useFallback ? <MetricsDashboard /> : <ReportEmbed />}
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

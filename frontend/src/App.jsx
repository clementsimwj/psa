// src/App.jsx
import React from "react";
import MetricsDashboard from "./components/MetricsDashboard";
import ChatPanel from "./components/ChatPanel";
import { DashboardProvider } from "./context/DashboardContext";
import "./styles.css";

export default function App() {
  return (
    <DashboardProvider>
      <div className="app-root">
        <header className="app-header">
          <div>PSA — Global Insights Dashboard</div>
        </header>
        <main className="app-main">
          <div className="left">
            <MetricsDashboard />
          </div>
          <div className="right">
            <ChatPanel />
          </div>
        </main>
        <footer className="app-footer">
          AI-powered insights for PSA International's vessel operations
        </footer>
      </div>
    </DashboardProvider>
  );
}

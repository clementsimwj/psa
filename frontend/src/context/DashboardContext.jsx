// src/context/DashboardContext.jsx
import React, { createContext, useContext, useState } from 'react';

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [focusArea, setFocusArea] = useState('overview'); // overview, terminals, vessels, carbon, performance

  return (
    <DashboardContext.Provider value={{ 
      currentQuestion, 
      setCurrentQuestion,
      focusArea,
      setFocusArea
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
}

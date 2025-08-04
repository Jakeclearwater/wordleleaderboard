import React from "react";

const TABS = ["Wordle Game", "Score Entry", "Leaderboard", "Chart"];

const TabBar = ({ activeTab, setActiveTab }) => (
  <div style={{
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    margin: "0 0 0 0",
    position: "relative",
    height: "50px",
    maxWidth: "600px",
    width: "600px",
    zIndex: 10
  }}>
    {TABS.map((tab, idx) => (
      <button
        key={tab}
        style={{
          flex: 1,
          maxWidth: "180px",
          position: "relative",
          zIndex: activeTab === tab ? 3 : 1,
          fontWeight: activeTab === tab ? "600" : "500",
          fontSize: "14px",
          padding: activeTab === tab ? "14px 20px 18px 20px" : "10px 16px 14px 16px",
          borderRadius: "8px 8px 0 0",
          border: "none",
          background: activeTab === tab 
            ? "rgba(255, 255, 255, 0.98)" 
            : "rgba(255, 255, 255, 0.6)",
          backdropFilter: "blur(8px)",
          color: activeTab === tab ? "#1a1a1a" : "#555",
          boxShadow: activeTab === tab 
            ? "none" 
            : "0 2px 4px rgba(0,0,0,0.05)",
          marginRight: idx < TABS.length - 1 ? "4px" : "0",
          cursor: "pointer",
          transition: "all 0.2s ease",
          outline: "none",
          transform: activeTab === tab ? "translateY(1px)" : "translateY(0)",
          borderBottom: activeTab === tab ? "none" : "1px solid rgba(255, 255, 255, 0.3)",
        }}
        onMouseOver={e => {
          if (activeTab !== tab) {
            e.target.style.background = "rgba(255, 255, 255, 0.75)";
            e.target.style.color = "#333";
          }
        }}
        onMouseOut={e => {
          if (activeTab !== tab) {
            e.target.style.background = "rgba(255, 255, 255, 0.6)";
            e.target.style.color = "#555";
          }
        }}
        onClick={() => setActiveTab(tab)}
      >{tab}</button>
    ))}
  </div>
);

export default TabBar;

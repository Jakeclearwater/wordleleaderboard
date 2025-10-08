import { useState, useEffect } from "react";

const TABS = ["Wordle Game", "Training", "Score Entry", "Leaderboard", "Chart"];

const TabBar = ({ activeTab, setActiveTab }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [needsOverlap, setNeedsOverlap] = useState(false);
  const tabCount = TABS.length;

  useEffect(() => {
    const checkLayout = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 600);
      const baseWidth = width <= 600 ? 90 : 120;
      const gapAllowance = 12;
      setNeedsOverlap(width < tabCount * (baseWidth + gapAllowance));
    };
    
    checkLayout();
    window.addEventListener('resize', checkLayout);
    
    return () => window.removeEventListener('resize', checkLayout);
  }, [tabCount]);
  
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-end",
      margin: "0 auto",
      position: "relative",
      height: "40px",
      width: "100%",
      maxWidth: needsOverlap ? "100%" : `${tabCount * 130}px`,
      zIndex: 10,
      overflow: "visible"
    }}>
      {TABS.map((tab, idx) => {
        const dynamicWidth = needsOverlap
          ? `calc(${(100 / tabCount).toFixed(2)}% + 8px)`
          : "auto";
        return (
        <button
          key={tab}
          style={{
            flex: needsOverlap ? "0 1 auto" : "0 0 auto",
            minWidth: isMobile ? "70px" : "100px",
            maxWidth: needsOverlap ? (isMobile ? "120px" : "150px") : "180px",
            width: dynamicWidth,
            position: "relative",
            zIndex: activeTab === tab ? 10 : (tabCount - idx),
            fontWeight: activeTab === tab ? "600" : "500",
            fontSize: isMobile ? "12px" : "14px",
            padding: activeTab === tab 
              ? (isMobile ? "10px 8px 12px 8px" : "12px 16px 14px 16px")
              : (isMobile ? "6px 8px 8px 8px" : "8px 16px 10px 16px"),
            borderRadius: "8px 8px 0 0",
            border: "none",
            background: activeTab === tab 
              ? "rgba(255, 255, 255, 0.98)" 
              : "rgba(240, 240, 240, 0.85)",
            borderRight: needsOverlap && activeTab !== tab ? "1px solid rgba(0,0,0,0.1)" : "none",
            backdropFilter: "blur(8px)",
            color: activeTab === tab ? "#1a1a1a" : "#666",
            boxShadow: activeTab === tab 
              ? "none" 
              : needsOverlap 
                ? "inset 2px 0 4px rgba(0,0,0,0.15)" 
                : "0 -2px 4px rgba(0,0,0,0.15)",
            marginRight: needsOverlap && idx < TABS.length - 1 ? (isMobile ? "-12px" : "-8px") : (idx < TABS.length - 1 ? "8px" : "0"),
            cursor: "pointer",
            transition: "all 0.2s ease",
            outline: "none",
            transform: activeTab === tab ? "translateY(1px)" : "translateY(0)",
            borderBottom: activeTab === tab ? "none" : "1px solid rgba(255, 255, 255, 0.3)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          onMouseOver={e => {
            if (activeTab !== tab) {
              e.target.style.background = "rgba(250, 250, 250, 0.9)";
              e.target.style.color = "#444";
            }
          }}
          onMouseOut={e => {
            if (activeTab !== tab) {
              e.target.style.background = "rgba(240, 240, 240, 0.85)";
              e.target.style.color = "#666";
            }
          }}
          onClick={() => setActiveTab(tab)}
        >{tab}</button>
      );
      })}
    </div>
  );
};

export default TabBar;

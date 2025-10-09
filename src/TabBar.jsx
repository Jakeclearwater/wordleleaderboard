import { useState, useEffect } from "react";
import { createUseStyles } from 'react-jss';

const TABS = ["Wordle Game", "Training", "Score Entry", "Leaderboard", "Chart"];

const useTabStyles = createUseStyles({
  tabContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    margin: "0 auto 0 auto",
    position: "relative",
    height: "50px",
    width: "100%",
    maxWidth: "100%",
    padding: "0 20px",
    boxSizing: "border-box",
    zIndex: 100,
    overflow: "visible",
  },
  tab: {
    position: "relative",
    border: "none",
    borderRadius: "10px 10px 0 0",
    padding: "12px 24px",
    marginRight: "4px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    outline: "none",
    whiteSpace: "nowrap",
    overflow: "visible",
    textOverflow: "ellipsis",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    background: "rgba(240, 240, 240, 0.85)",
    color: "#666",
    fontWeight: "500",
    backdropFilter: "blur(8px)",
    zIndex: 1,
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    '&:focus': {
      outline: "none",
      boxShadow: "none",
    },
    '&:focus-visible': {
      outline: "none",
      boxShadow: "none",
    },
    '&:hover': {
      background: "rgba(250, 250, 250, 0.9)",
      color: "#444",
    },
  },
  tabActive: {
    background: "rgba(255, 255, 255, 0.98)",
    color: "#1a1a1a",
    fontWeight: "600",
    zIndex: 100,
    marginBottom: "-1px",
    transition: "all 0.1s ease",
    '&::before': {
      content: '""',
      position: "absolute",
      bottom: "-1px",
      left: "-16px",
      width: "16px",
      height: "16px",
      background: "transparent",
      borderRadius: "0 0 16px 0",
      boxShadow: "8px 0 0 0 rgba(255, 255, 255, 0.98)",
      backdropFilter: "blur(8px)",
      zIndex: 100,
      transition: "all 0.1s ease",
    },
    '&::after': {
      content: '""',
      position: "absolute",
      bottom: "-1px",
      right: "-16px",
      width: "16px",
      height: "16px",
      background: "transparent",
      borderRadius: "0 0 0 16px",
      boxShadow: "-8px 0 0 0 rgba(255, 255, 255, 0.98)",
      backdropFilter: "blur(8px)",
      zIndex: 100,
      transition: "all 0.1s ease",
    },
    '&:hover': {
      background: "rgba(255, 255, 255, 0.98)",
      '&::before': {
        boxShadow: "8px 0 0 0 rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(8px)",
      },
      '&::after': {
        boxShadow: "-8px 0 0 0 rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(8px)",
      },
    },
  },
});

const TabBar = ({ activeTab, setActiveTab }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [needsOverlap, setNeedsOverlap] = useState(false);
  const tabCount = TABS.length;
  const classes = useTabStyles();

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
    <div 
      className={classes.tabContainer}
      style={{ maxWidth: needsOverlap ? "100%" : `${tabCount * 130}px` }}
    >
      {TABS.map((tab, idx) => {
        const dynamicWidth = needsOverlap
          ? `calc(${(100 / tabCount).toFixed(2)}% + 8px)`
          : "auto";
        const isActive = activeTab === tab;
        
        return (
          <button
            key={tab}
            className={`${classes.tab} ${isActive ? classes.tabActive : ''}`}
            style={{
              flex: needsOverlap ? "0 1 auto" : "0 0 auto",
              minWidth: isMobile ? "70px" : "100px",
              maxWidth: needsOverlap ? (isMobile ? "120px" : "150px") : "180px",
              width: dynamicWidth,
              fontSize: isMobile ? "12px" : "14px",
              padding: isMobile ? "8px 12px" : "12px 24px",
              marginRight: needsOverlap && idx < TABS.length - 1 ? (isMobile ? "-12px" : "-8px") : (idx < TABS.length - 1 ? "4px" : "0"),
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
};

export default TabBar;

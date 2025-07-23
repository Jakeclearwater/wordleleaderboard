import { createUseStyles } from "react-jss";
import React, { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { firestore } from "./firebase"; // Adjust the import path as necessary
import axios from "axios"; // For sending HTTP requests
import Leaderboard from "./Leaderboard";
import BayesianChart from "./BayesianChart";

// Cookie helpers
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};
const setCookie = (name, value, days = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const TABS = ["Wordle Game", "Score Entry", "Leaderboard", "Chart"];

// Define your styles
const useStyles = createUseStyles({
  form: {
    display: "flex",
    flexDirection: "column",
    padding: "2rem",
    width: "400px",
    maxWidth: "400px",
    minWidth: "400px",
    margin: "0 auto",
    gap: "1.5rem",
    boxSizing: "border-box",
    "@media (max-width: 480px)": {
      width: "calc(100vw - 2rem)",
      maxWidth: "calc(100vw - 2rem)",
      minWidth: "calc(100vw - 2rem)",
      padding: "1rem",
    },
    "& label": {
      color: "#374151 !important",
      fontWeight: "500",
      fontSize: "14px",
      marginBottom: "0.5rem",
      display: "block",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    transition: "all 0.2s ease-out",
    gap: "0.25rem",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #e0e4e7",
    fontSize: "15px",
    width: "100%",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
    background: "white",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    "&:focus": {
      outline: "none",
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    },
    "&.disabled": {
      backgroundColor: "#f8f9fa",
      cursor: "not-allowed",
      color: "#6c757d",
      borderColor: "#dee2e6",
    },
  },
  select: {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    backgroundColor: "white",
    color: "black",
    fontSize: "16px",
    width: "100%",
    boxSizing: "border-box",
    appearance: "none",
    backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 4 5\"><path fill=\"%23666\" d=\"M2 0L0 2h4zm0 5L0 3h4z\"/></svg>')",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    backgroundSize: "12px",
    "&:focus": {
      outline: "none",
      borderColor: "#28a745",
      boxShadow: "0 0 0 2px rgba(40, 167, 69, 0.2)",
    },
  },
  button: {
    padding: "12px 24px",
    border: "none",
    borderRadius: "8px",
    background: "#3b82f6",
    color: "white",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "500",
    width: "100%",
    boxSizing: "border-box",
    marginTop: "1rem",
    transition: "all 0.2s ease",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    "&:hover": {
      background: "#2563eb",
    },
    "&:active": {
      transform: "translateY(1px)",
    },
    "&.disabled": {
      background: "#d1d5db",
      cursor: "not-allowed",
      "&:hover": {
        background: "#d1d5db",
      },
    },
  },
  checkboxGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  checkboxWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    accentColor: "#28a745",
  },
  textarea: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #e0e4e7",
    minHeight: "100px",
    width: "100%",
    boxSizing: "border-box",
    fontSize: "14px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'SF Mono', Consolas, monospace",
    resize: "vertical",
    transition: "all 0.2s ease",
    background: "white",
    "&:focus": {
      outline: "none",
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    },
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    opacity: 1,
    transition: "opacity 1s ease",
  },
  hidden: {
    opacity: 0,
  },
  confetti: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 9999,
    '& .confetti-piece': {
      position: 'absolute',
      width: '10px',
      height: '10px',
      backgroundColor: '#FFD700',
      animation: '$confettiBurst 3s ease-out forwards',
    }
  },
  '@keyframes confettiBurst': {
    '0%': {
      transform: 'translate(-50%, -50%) scale(0) rotateZ(0deg)',
      opacity: 1,
    },
    '10%': {
      transform: 'translate(-50%, -50%) scale(1) rotateZ(90deg)',
      opacity: 1,
    },
    '100%': {
      transform: 'translate(calc(-50% + var(--end-x, 0px)), calc(-50% + var(--end-y, 0px))) scale(0.5) rotateZ(720deg)',
      opacity: 0,
    }
  },
  toggleButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    width: "36px",
    height: "36px",
    minWidth: "36px",
    minHeight: "36px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    flexShrink: 0,
    aspectRatio: "1",
    lineHeight: "1",
    "&:hover": {
      backgroundColor: "#2563eb",
    },
    "&:active": {
      transform: "scale(0.95)",
    },
  },
  toggleContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: "1rem",
    marginBottom: "1rem",
  },
  modeSelector: {
    display: "flex",
    background: "#f3f4f6",
    borderRadius: "8px",
    padding: "4px",
    border: "1px solid #e5e7eb",
  },
  modeOption: {
    flex: 1,
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    background: "transparent",
    color: "#6b7280",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    "&:hover": {
      color: "#374151",
    },
  },
  activeMode: {
    background: "white",
    color: "#1f2937",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    fontWeight: "600",
    "&:hover": {
      color: "#1f2937",
    },
  },
  formContainer: {
    overflow: "hidden",
    transition: "max-height 0.3s ease-out, opacity 0.3s ease-out",
    width: "400px",
    maxWidth: "400px",
    minWidth: "400px",
    margin: "0 auto",
    boxSizing: "border-box",
    "@media (max-width: 480px)": {
      width: "calc(100vw - 2rem)",
      maxWidth: "calc(100vw - 2rem)",
      minWidth: "calc(100vw - 2rem)",
    },
    "&.collapsed": {
      maxHeight: "0",
      opacity: "0",
    },
    "&.expanded": {
      maxHeight: "1000px",
      opacity: "1",
    },
  }
});

const InputForm = ({ 
  backgroundThemes, 
  selectedTheme, 
  setSelectedTheme, 
  customColors, 
  setCustomColors, 
  getCurrentGradient 
}) => {
  const classes = useStyles();
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [guesses, setGuesses] = useState("");
  const [didNotFinish, setDidNotFinish] = useState(false);
  const [wordleResult, setWordleResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [pasteWordle, setPasteWordle] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [testConfetti, setTestConfetti] = useState(false);
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  useEffect(() => {
    const cookieUser = getCookie("wordle-username");
    if (cookieUser) {
      setUsername(cookieUser);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim().length < 3) return;
    setCookie("wordle-username", username.trim());
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setCookie("wordle-username", "", -1);
    setIsLoggedIn(false);
    setUsername("");
  };

  // Top right login info
  const TopRightLogin = () => (
    <div style={{
      position: "fixed",
      top: "1rem",
      right: "1rem",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      background: "rgba(255, 255, 255, 0.98)",
      backdropFilter: "blur(8px)",
      padding: "0.75rem 1rem",
      borderRadius: "50px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      fontSize: "14px",
      fontWeight: "500",
      zIndex: 100,
      border: "1px solid rgba(255, 255, 255, 0.3)",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {isLoggedIn && (
        <>
          <span style={{color: "#374151"}}>Welcome, {username}</span>
          
          {/* Settings Button */}
          <div style={{ position: 'relative' }}>
            <button 
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "none",
                background: getCurrentGradient ? getCurrentGradient() : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
                transition: "all 0.2s ease",
                position: "relative"
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "scale(1.1)";
                e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.25)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "scale(1)";
                e.target.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.15)";
              }}
              onClick={() => setShowSettings(!showSettings)}
              title="Settings & Options"
            >
              <span style={{
                color: "white",
                fontSize: "16px",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.6)"
              }}>
                ⚙️
              </span>
            </button>
            
            {/* Settings Dropdown */}
            {showSettings && (
              <div style={{
                position: 'absolute',
                top: '35px',
                right: '0',
                width: '320px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(15px)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '0',
                zIndex: 1000
              }}>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '12px 12px 0 0'
                }}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    🎨 Background Themes
                  </span>
                  <button 
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '14px',
                      cursor: 'pointer',
                      color: '#666',
                      padding: '4px'
                    }}
                    onClick={() => setShowSettings(false)}
                  >
                    ✕
                  </button>
                </div>
                
                {/* Theme Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                  padding: '12px'
                }}>
                  {backgroundThemes && Object.entries(backgroundThemes).filter(([key]) => key !== 'custom').map(([key, theme]) => (
                    <button
                      key={key}
                      style={{
                        height: '50px',
                        border: selectedTheme === key ? '3px solid rgba(255, 255, 255, 0.8)' : 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.2s ease',
                        boxShadow: selectedTheme === key ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                        background: theme.gradient,
                        transform: selectedTheme === key ? 'translateY(-2px)' : 'translateY(0)'
                      }}
                      onClick={() => setSelectedTheme(key)}
                      title={theme.name}
                      onMouseOver={(e) => {
                        if (selectedTheme !== key) {
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (selectedTheme !== key) {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                        }
                      }}
                    >
                      <span style={{
                        position: 'absolute',
                        bottom: '4px',
                        left: '8px',
                        right: '8px',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: '600',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.7)',
                        textAlign: 'center',
                        lineHeight: '1.2'
                      }}>
                        {theme.name}
                      </span>
                    </button>
                  ))}
                </div>
                
                {/* Custom Colors Section */}
                <div style={{
                  borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                  padding: '12px',
                  backgroundColor: 'rgba(248, 249, 250, 0.8)'
                }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '8px'
                  }}>
                    🎨 Custom Colors
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <label style={{
                        fontSize: '10px',
                        color: '#666',
                        fontWeight: '500',
                        display: 'block',
                        marginBottom: '2px'
                      }}>
                        Color 1:
                      </label>
                      <input
                        type="color"
                        value={customColors ? customColors.color1 : '#667eea'}
                        onChange={(e) => setCustomColors && setCustomColors(prev => ({ ...prev, color1: e.target.value }))}
                        style={{
                          width: '100%',
                          height: '32px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{
                        fontSize: '10px',
                        color: '#666',
                        fontWeight: '500',
                        display: 'block',
                        marginBottom: '2px'
                      }}>
                        Color 2:
                      </label>
                      <input
                        type="color"
                        value={customColors ? customColors.color2 : '#764ba2'}
                        onChange={(e) => setCustomColors && setCustomColors(prev => ({ ...prev, color2: e.target.value }))}
                        style={{
                          width: '100%',
                          height: '32px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                  </div>
                  <button
                    style={{
                      width: '100%',
                      height: '40px',
                      border: selectedTheme === 'custom' ? '3px solid rgba(255, 255, 255, 0.8)' : 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: customColors ? `linear-gradient(135deg, ${customColors.color1} 0%, ${customColors.color2} 100%)` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '600',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.7)',
                      transition: 'all 0.2s ease',
                      boxShadow: selectedTheme === 'custom' ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                    onClick={() => setSelectedTheme('custom')}
                  >
                    Use Custom
                  </button>
                </div>
                
                {/* Logout Section */}
                <div style={{
                  borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                  padding: '12px',
                  backgroundColor: 'rgba(248, 249, 250, 0.8)'
                }}>
                  <button 
                    style={{
                      width: '100%',
                      fontSize: "14px", 
                      padding: "10px 16px", 
                      borderRadius: "8px",
                      border: "none",
                      background: "#dc2626",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: "600",
                      transition: "all 0.2s ease",
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }} 
                    onMouseOver={(e) => e.target.style.background = "#b91c1c"}
                    onMouseOut={(e) => e.target.style.background = "#dc2626"}
                    onClick={handleLogout}
                  >
                    <span>🚪</span>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  // Tab navigation
  const TabBar = () => (
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
          onMouseOver={(e) => {
            if (activeTab !== tab) {
              e.target.style.background = "rgba(255, 255, 255, 0.75)";
              e.target.style.color = "#333";
            }
          }}
          onMouseOut={(e) => {
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

  // Create confetti pieces
  const createConfetti = () => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    const pieces = [];
    
    for (let i = 0; i < 50; i++) {
      // Generate random angle and distance for burst effect
      const angle = (Math.PI * 2 * i) / 50 + Math.random() * 0.5; // Distribute around circle with some randomness
      const distance = 50 + Math.random() * 300; // Random distance from center
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance;
      
      pieces.push(
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: '50%',
            top: '50%',
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${2 + Math.random() * 1}s`,
            '--end-x': `${endX}px`,
            '--end-y': `${endY}px`,
          }}
        />
      );
    }
    return pieces;
  };

  
    const parseWordleResult = (result) => {
      const lines = result.toString().trim().split("\n");
      const metadataLine = lines[0].trim();

      // Check for hard mode asterisk
      const hardMode = metadataLine.endsWith("*");
      // Remove asterisk for parsing
      const cleanMetadataLine = hardMode ? metadataLine.slice(0, -1).trim() : metadataLine;

      // Regular expressions to match different formats
      const metadataMatch = cleanMetadataLine.charAt(cleanMetadataLine.length - 3);
      const wordleNumber = cleanMetadataLine.split(" ")[1];
      let numberOfGuesses = 0;
      let isDNF = false;
      if (!(parseInt(metadataMatch, 10) > 0 && parseInt(metadataMatch, 10) < 7)) {
        isDNF = true;
      } else {
        numberOfGuesses = parseInt(metadataMatch, 10);
      }

      // Extract the result blocks (lines) from the remaining part
      const resultBlocks = lines.slice(2, lines.length);

      return [numberOfGuesses, wordleNumber, resultBlocks, isDNF, hardMode]; // Add hardMode to tuple
    };

  const sendResultToTeams = async (
    numGuesses,
    wordleNumber,
    name,
    didNotFinish,
    resultBlocks,
    hardMode = false // Add default value
  ) => {
    const grats = [
      "Genius",
      "Magnificent",
      "Impressive",
      "Splendid",
      "Great",
      "Phew",
      "Spoon!",
    ];
    const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;

    // Format the message consistently for all scores (1-6 guesses + DNF as 7)
    const messageText = `${name} scored ${numGuesses} in Wordle #${wordleNumber} - ${grats[numGuesses - 1]}${hardMode ? ' 🦾' : ''}`;

    // Map the result blocks to TextBlocks with compact styling
    const textBlocks = resultBlocks.map((line) => ({
      type: "TextBlock",
      text: line,
      wrap: true, // Allow text to wrap within the card
      spacing: "None", // Reduce spacing between lines
      size: "Medium", // Use smaller text size
    }));

    // Define the payload for the Teams webhook
    const payload = {
      type: "message",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          content: {
            $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
            type: "AdaptiveCard",
            version: "1.2",
            body: [
              {
                type: "TextBlock",
                text: messageText,
                weight: "bolder",
                size: "Medium",
                spacing: "None", // Reduce spacing for the title text
              },
              ...textBlocks,
            ],
          },
        },
      ],
    };

    // Send the payload to the Teams webhook
    try {
      console.log("Sending result to Teams:", payload);
      const response = await axios.post(webhookUrl, payload);
      console.log("Teams response:", response);
    } catch (error) {
      console.error("Error sending result to Teams:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowOverlay(true);

    // Get the final name to use
    const finalName = username.trim();

    if (!finalName) {
      alert("Please provide your name.");
      setLoading(false);
      setShowOverlay(false);
      return;
    }

    // Validate custom name length (3-12 characters)
    if (finalName.length < 3 || finalName.length > 12) {
      alert("Name must be between 3 and 12 characters long.");
      setLoading(false);
      setShowOverlay(false);
      return;
    }

    // This is the problematic part - we need to ensure DNF is always 7
    let finalGuesses = 0;
    let wordleNumber = '';
    let resultBlocks = [];
    let isDNF = didNotFinish; // Start with the checkbox value
    let hardMode = false; // Default hard mode to false
    
    if (pasteWordle && wordleResult.trim().length > 0) {
      // Parse the pasted result
      const [parsedWordleGuesses, parsedWordleNumber, parsedResultBlocks, parsedIsDNF, parsedHardMode] = 
        parseWordleResult(wordleResult);
      
      // Check for conflict between pasted result and DNF checkbox
      if (didNotFinish && !parsedIsDNF && parsedWordleGuesses > 0 && parsedWordleGuesses <= 6) {
        // User checked DNF but pasted a successful result - show confirmation
        const confirmOverride = window.confirm(
          `Conflict detected: You checked "Did Not Finish" but your pasted result shows you completed it in ${parsedWordleGuesses} guesses.\n\n` +
          `Click OK to use your actual score (${parsedWordleGuesses}) or Cancel to cancel submission.`
        );
        
        if (confirmOverride) {
          // Use the pasted result and uncheck DNF
          isDNF = false;
          setDidNotFinish(false);
          finalGuesses = parsedWordleGuesses;
        } else {
          // Cancel the submission entirely
          setLoading(false);
          setShowOverlay(false);
          return;
        }
      } else {
        // No conflict - use parsed result or update DNF status if detected
        isDNF = isDNF || parsedIsDNF;
        finalGuesses = isDNF ? 7 : parsedWordleGuesses;
      }
      
      // Set the values from parsing
      wordleNumber = parsedWordleNumber;
      resultBlocks = parsedResultBlocks;
      // Add hardMode
      hardMode = parsedHardMode;
    } else {
      // Manual entry - if DNF, set to 7, otherwise use the entered guesses
      finalGuesses = isDNF ? 7 : parseInt(guesses, 10) || 0;
      
      // Estimate current Wordle number for manual entries
      // Wordle started on June 19, 2021 (Wordle #1 was June 19, 2021)
      const startDate = new Date('2021-06-19');
      const today = new Date();
      const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
      wordleNumber = (daysDiff + 1).toString();
    }
    
    // Additional validation
    const isWordleResultPasted = wordleResult.trim().length > 0;
    const isNumGuessesProvided = parseInt(guesses, 10) > 0;

    if (!finalName) {
      alert("Please provide your name.");
      setLoading(false);
      setShowOverlay(false);
      return;
    }

    // Check for conflict between manual score entry and DNF checkbox
    if (!pasteWordle && didNotFinish && isNumGuessesProvided && parseInt(guesses, 10) >= 1 && parseInt(guesses, 10) <= 6) {
      const confirmDNF = window.confirm(
        `Conflict detected: You checked "Did Not Finish" but entered a valid score of ${guesses} guesses.\n\n` +
        `Click OK to use your actual score (${guesses}) or Cancel to cancel submission.`
      );
      
      if (confirmDNF) {
        // Use the entered score and uncheck DNF
        isDNF = false;
        setDidNotFinish(false);
        finalGuesses = parseInt(guesses, 10);
      } else {
        // Cancel the submission entirely
        setLoading(false);
        setShowOverlay(false);
        return;
      }
    }

    if (pasteWordle) {
      if (!isWordleResultPasted) {
        alert("Please provide the Wordle result.");
        setLoading(false);
        setShowOverlay(false);
        return;
      }
      if (isDNF) {
        if (!didNotFinish) {
          // Automatically check the DNF box when detected from pasted result
          setDidNotFinish(true);
        }
      } else if (isNumGuessesProvided && parseInt(guesses, 10) !== parsedWordleGuesses) {
        alert(
          `Mismatch detected: Number of guesses (${parseInt(guesses, 10)}) does not match the pasted result (${parsedWordleGuesses}).`
        );
        setLoading(false);
        setShowOverlay(false);
        return;
      }
    } else if (!pasteWordle && !isNumGuessesProvided && !didNotFinish) {
      alert("Please provide the number of guesses or select 'Did Not Finish'.");
      setLoading(false);
      setShowOverlay(false);
      return;
    }

    // Make sure we always have a valid guesses value (should be 1-6 or 7 for DNF)
    if (finalGuesses <= 0 || finalGuesses > 7) {
      finalGuesses = isDNF ? 7 : 0;
    }

    // Proceed only if we have valid guesses
    if (finalGuesses === 0 && !isDNF) {
      alert("Please provide the number of guesses or select 'Did Not Finish'.");
      setLoading(false);
      setShowOverlay(false);
      return;
    }

    // Get current date in New Zealand timezone
    const now = new Date();
    const nzTime = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Pacific/Auckland',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);
    const formattedNZDate = nzTime; // Already in YYYY-MM-DD format
    
    // Create ISO datetime with the current actual time
    // Save the exact time when the score was submitted
    const isoDateTime = new Date().toISOString();

    try {
      // Store in Firestore - ensure guesses is 7 for DNF and include dnf flag
      await addDoc(collection(firestore, "scores"), {
        name: finalName,
        guesses: isDNF ? 7 : finalGuesses,
        date: formattedNZDate,
        isoDate: isoDateTime,
        dnf: isDNF,
        wordleNumber: wordleNumber || null,
        hardMode: hardMode, // Save hardMode boolean
      });

      // Reset form
      setGuesses("");
      setDidNotFinish(false);
      setWordleResult("");
      setPasteWordle(false);
      
      // Auto-hide the form after successful submission
      setIsFormExpanded(false);

      // Show confetti for excellent scores (1 to 3 guesses)
      if (!isDNF && finalGuesses <= 3) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000); // Hide after 4 seconds
      }

      // Send to Teams webhook
      if (pasteWordle && isWordleResultPasted) {
        await sendResultToTeams(
          finalGuesses,  // Use the calculated final guesses
          wordleNumber,
          finalName,
          isDNF,        // Use the calculated isDNF
          resultBlocks,
          hardMode      // Pass hardMode to webhook
        );
      } else if (!pasteWordle && (isNumGuessesProvided || isDNF)) {
        // Send webhook for manual entries (both scored and DNF)
        await sendResultToTeams(
          finalGuesses,  
          wordleNumber || "Unknown", 
          finalName, 
          isDNF, 
          [],
          hardMode      // Pass hardMode to webhook (will be false)
        );
      }
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setShowOverlay(false);
        // Switch to Leaderboard tab after overlay disappears
        setActiveTab("Leaderboard");
      }, 3000);
    }
  };

  // Handle test confetti checkbox
  const handleTestConfetti = (e) => {
    setTestConfetti(e.target.checked);
    if (e.target.checked) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setTestConfetti(false);
      }, 4000); // Hide after 4 seconds and uncheck
    }
  };

  // Check if form is valid for submit button state
  const isFormValid = () => {
    const finalName = username.trim();
    
    // Must have a name
    if (!finalName) return false;
    
    // Custom name must be 3-12 characters
    if (finalName.length < 3 || finalName.length > 12) return false;
    
    // Must have either guesses, DNF, or paste wordle with content
    if (pasteWordle) {
      return wordleResult.trim().length > 0;
    } else {
      return didNotFinish || (guesses && parseInt(guesses, 10) >= 1 && parseInt(guesses, 10) <= 6);
    }
  };

  // Login screen
  if (!isLoggedIn) {
    return (
      <div style={{
        maxWidth: "400px", 
        margin: "4rem auto", 
        padding: "2rem", 
        background: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(8px)",
        borderRadius: "12px", 
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid rgba(255, 255, 255, 0.3)"
      }}>
        <h2 style={{
          textAlign: "center", 
          marginBottom: "2rem",
          color: "#1a1a1a",
          fontWeight: "600",
          fontSize: "24px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}>Wordle Leaderboard</h2>
        <p style={{
          textAlign: "center",
          color: "#6b7280",
          fontSize: "15px",
          marginBottom: "2rem",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}>Track your Wordle progress and compete with friends</p>
        <form onSubmit={handleLogin}>
          <label htmlFor="username" style={{
            fontWeight: "500", 
            fontSize: "14px",
            color: "#374151",
            display: "block",
            marginBottom: "0.5rem",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }}>Choose Your Name:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            minLength={3}
            maxLength={20}
            required
            style={{
              width: "100%", 
              padding: "12px 16px", 
              borderRadius: "8px", 
              border: "1px solid #e0e4e7", 
              fontSize: "15px", 
              marginBottom: "1.5rem",
              boxSizing: "border-box",
              transition: "all 0.2s ease",
              background: "white",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#3b82f6";
              e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e0e4e7";
              e.target.style.boxShadow = "none";
            }}
            placeholder="Enter your name"
          />
          <button type="submit" style={{
            width: "100%", 
            padding: "12px 24px", 
            borderRadius: "8px", 
            background: "#3b82f6", 
            color: "white", 
            fontWeight: "500", 
            fontSize: "15px", 
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }}
          onMouseOver={(e) => {
            e.target.style.background = "#2563eb";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "#3b82f6";
          }}
          onMouseDown={(e) => {
            e.target.style.transform = "translateY(1px)";
          }}
          onMouseUp={(e) => {
            e.target.style.transform = "translateY(0)";
          }}
          >Submit Your Name</button>
        </form>
      </div>
    );
  }

  // Main app with tabs and content
  return (
    <>
      <TopRightLogin />
      <div style={{
        width: "100%", 
        maxWidth: "calc(100% - 20px)", 
        margin: "0 auto", 
        padding: "2rem 1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <div style={{
          textAlign: "center",
          marginBottom: "1rem",
          width: "100%"
        }}>
         
        </div>
        <TabBar />
        <div style={{
          width: "100%", 
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(8px)",
          borderRadius: "0 0 12px 12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderTop: "none",
          overflow: "hidden",
          position: "relative",
          zIndex: 2
        }}>
          {activeTab === "Score Entry" && (
            <div style={{padding: "2rem", display: "flex", justifyContent: "center", width: "100%"}}>
              <form onSubmit={handleSubmit} className={classes.form}>
                <div className={classes.formGroup}>
                  <label htmlFor="guesses">Enter your guesses (1-6):</label>
                  <input
                    id="guesses"
                    type="number"
                    value={guesses}
                    onChange={e => setGuesses(e.target.value)}
                    min="1"
                    max="6"
                    required={!pasteWordle && !didNotFinish}
                    disabled={pasteWordle}
                    className={`${classes.input} ${pasteWordle ? 'disabled' : ''}`}
                  />
                </div>
                <div className={classes.checkboxGroup}>
                  <label className={classes.checkboxWrapper}>
                    <input
                      type="checkbox"
                      checked={didNotFinish}
                      onChange={e => setDidNotFinish(e.target.checked)}
                      className={classes.checkbox}
                    />
                    <span style={{marginLeft: "8px"}}>Did Not Finish (DNF)</span>
                  </label>
                </div>
                <div className={classes.formGroup}>
                  <label htmlFor="wordleResult">Paste your Wordle result:</label>
                  <textarea
                    id="wordleResult"
                    value={wordleResult}
                    onChange={e => setWordleResult(e.target.value)}
                    className={classes.textarea}
                    placeholder="Paste your Wordle result here"
                    disabled={!pasteWordle}
                    style={{
                      backgroundColor: !pasteWordle ? "#f8f9fa" : "white",
                      cursor: !pasteWordle ? "not-allowed" : "text"
                    }}
                  />
                </div>
                <div className={classes.toggleContainer}>
                  <div className={classes.modeSelector}>
                    <button
                      type="button"
                      onClick={() => setPasteWordle(false)}
                      className={`${classes.modeOption} ${!pasteWordle ? classes.activeMode : ''}`}
                    >
                      ✏️ Manual Entry
                    </button>
                    <button
                      type="button"
                      onClick={() => setPasteWordle(true)}
                      className={`${classes.modeOption} ${pasteWordle ? classes.activeMode : ''}`}
                    >
                      📋 Paste Result
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className={classes.button}
                  disabled={loading || !isFormValid()}
                >
                  {loading ? "Submitting..." : "Submit Score"}
                </button>
              </form>
            </div>
          )}
          {activeTab === "Leaderboard" && (
            <div style={{padding: "2rem", width: "100%", minHeight: "60vh"}}>
              <Leaderboard />
            </div>
          )}
          {activeTab === "Chart" && (
            <div style={{padding: "2rem", width: "100%", minHeight: "60vh"}}>
              <BayesianChart />
            </div>
          )}
          {activeTab === "Wordle Game" && (
            <div style={{padding: "1rem", width: "100%", minHeight: "80vh"}}>
              <div style={{
                width: "100%",
                height: "80vh",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                overflow: "hidden"
              }}>
                <iframe
                  src="https://www.nytimes.com/games/wordle"
                  width="100%"
                  height="100%"
                  style={{
                    border: "none",
                    borderRadius: "12px"
                  }}
                  title="New York Times Wordle Game"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>
      </div>
      {showOverlay && (
        <div className={`${classes.overlay} ${showOverlay ? '' : classes.hidden}`}>
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            color: "#333",
            padding: "2rem 3rem",
            borderRadius: "16px",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            fontWeight: "600"
          }}>Score submitted successfully! 🎉</div>
        </div>
      )}
      {showConfetti && (
        <div className={classes.confetti}>
          {createConfetti()}
        </div>
      )}
    </>
  );
};

export default InputForm;

import React, { useState, useEffect } from "react";
import { createUseStyles } from "react-jss";

import { collection, addDoc } from "firebase/firestore";
import { firestore } from "./firebase"; // Adjust the import path as necessary
// import axios from "axios"; // For sending HTTP requests
import { sendResultToTeams } from "./sendResultToTeams";
import Leaderboard from "./Leaderboard";
import BayesianChart from "./BayesianChart";
import { FlippingCountdownNZT, CountdownTimer } from "./FlippingCountdownNZT";
import TopRightLogin from "./TopRightLogin";
import { Confetti } from "./Confetti";
import TabBar from "./TabBar";

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
    width: "100%",
    maxWidth: "420px",
    minWidth: "220px",
    margin: "0 auto",
    gap: "1.5rem",
    boxSizing: "border-box",
    "@media (max-width: 600px)": {
      padding: "1rem",
      maxWidth: "98vw",
      minWidth: "0",
      width: "100%",
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
    minWidth: "0",
    maxWidth: "100%",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
    background: "white",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    "@media (max-width: 600px)": {
      fontSize: "15px",
      padding: "12px 12px",
    },
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
    minHeight: "120px",
    width: "100%",
    minWidth: "0",
    maxWidth: "100%",
    boxSizing: "border-box",
    fontSize: "14px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'SF Mono', Consolas, monospace",
    resize: "vertical",
    transition: "all 0.2s ease",
    background: "white",
    "@media (max-width: 600px)": {
      fontSize: "14px",
      padding: "10px 10px",
      minHeight: "80px",
    },
    "&:focus": {
      outline: "none",
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    },
    "&::placeholder": {
      color: "#bfc6d1",
      opacity: 0.55,
    },
    "&::-webkit-input-placeholder": {
      color: "#bfc6d1",
      opacity: 0.55,
    },
    "&::-moz-placeholder": {
      color: "#bfc6d1",
      opacity: 0.55,
    },
    "&:-ms-input-placeholder": {
      color: "#bfc6d1",
      opacity: 0.55,
    },
    "&::-ms-input-placeholder": {
      color: "#bfc6d1",
      opacity: 0.55,
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
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: 9999,
    overflow: 'hidden',
    '& .confetti-piece': {
      position: 'absolute',
      width: '22px',
      height: '22px',
      borderRadius: '50%',
      backgroundColor: '#FFD700',
      boxShadow: '0 0 24px 8px rgba(0,0,0,0.12)',
      animation: '$confettiBurst 2.5s cubic-bezier(0.23, 1, 0.32, 1) forwards',
      willChange: 'transform, opacity',
    }
  },
  '@keyframes confettiBurst': {
    '0%': {
      transform: 'translate(-50%, -50%) scale(0.2) rotateZ(0deg)',
      opacity: 1,
      filter: 'blur(0px)',
    },
    '10%': {
      transform: 'translate(-50%, -50%) scale(1.2) rotateZ(90deg)',
      opacity: 1,
      filter: 'blur(0px)',
    },
    '80%': {
      filter: 'blur(0px)',
    },
    '100%': {
      transform: 'translate(calc(-50% + var(--end-x, 0px)), calc(-50% + var(--end-y, 0px))) scale(2.2) rotateZ(1080deg)',
      opacity: 0,
      filter: 'blur(2px)',
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
    width: "100%",
    maxWidth: "420px",
    minWidth: "220px",
    margin: "0 auto",
    boxSizing: "border-box",
    "@media (max-width: 600px)": {
      width: "100%",
      maxWidth: "98vw",
      minWidth: "0",
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
  const [alreadySubmittedToday, setAlreadySubmittedToday] = useState(false);
  const [todaysScore, setTodaysScore] = useState(null);

  useEffect(() => {
    const cookieUser = getCookie("wordle-username");
    if (cookieUser) {
      setUsername(cookieUser);
      setIsLoggedIn(true);
    }
  }, []);

  // Check if already submitted for today (NZT)
  useEffect(() => {
    const checkAlreadySubmitted = async () => {
      if (!username) {
        setAlreadySubmittedToday(false);
        setTodaysScore(null);
        return;
      }
      // Get current date in NZT
      const now = new Date();
      const nzTime = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Pacific/Auckland',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(now);
      const formattedNZDate = nzTime;
      // Query Firestore for scores by this user for today
      try {
        const { getDocs, query, where, collection } = await import('firebase/firestore');
        const q = query(collection(firestore, "scores"), where("name", "==", username.trim()), where("date", "==", formattedNZDate));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setAlreadySubmittedToday(true);
          // Get the best score for today (lowest guesses)
          let bestScore = null;
          snapshot.forEach(doc => {
            const data = doc.data();
            if (!bestScore || data.guesses < bestScore.guesses) {
              bestScore = data;
            }
          });
          setTodaysScore(bestScore);
        } else {
          setAlreadySubmittedToday(false);
          setTodaysScore(null);
        }
      } catch (err) {
        setAlreadySubmittedToday(false);
        setTodaysScore(null);
      }
    };
    checkAlreadySubmitted();
  }, [username, activeTab]);

  const handleLogin = (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    // Only allow a-z, A-Z, and spaces, 3-20 chars
    const valid = /^[a-zA-Z ]{3,20}$/.test(trimmed);
    if (!valid) {
      alert("Name must be 3-20 letters or spaces (a-z, A-Z, space) only.");
      return;
    }
    setCookie("wordle-username", trimmed);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setCookie("wordle-username", "", -1);
    setIsLoggedIn(false);
    setUsername("");
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

// sendResultToTeams is now imported from './sendResultToTeams.js'

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
      <TopRightLogin
        isLoggedIn={isLoggedIn}
        username={username}
        getCurrentGradient={getCurrentGradient}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        backgroundThemes={backgroundThemes}
        selectedTheme={selectedTheme}
        setSelectedTheme={setSelectedTheme}
        customColors={customColors}
        setCustomColors={setCustomColors}
        handleLogout={handleLogout}
      />
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
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
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
              {alreadySubmittedToday ? (
                <FlippingCountdownNZT>
                  <span
                    style={{fontSize: "3rem", marginBottom: "1rem", cursor: "pointer", userSelect: "none"}}
                    title="Celebrate!"
                    onClick={() => {
                      setShowConfetti(true);
                      setTimeout(() => setShowConfetti(false), 4000);
                    }}
                  >🎉</span>
                  <div style={{marginBottom: "1.5rem"}}>Oops - You've already submitted your Wordle score for today.<br />
                    <span style={{fontWeight: 600, color: "#374151"}}>Next entry opens in:</span>
                  </div>
                  <CountdownTimer />
                  {todaysScore && (
                    <div style={{
                      marginTop: "1.5rem",
                      fontSize: "1.1rem",
                      color: "#2563eb",
                      background: "#f3f4f6",
                      borderRadius: "8px",
                      padding: "1rem 1.5rem",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      fontWeight: "600"
                    }}>
                      <span style={{fontSize: "2rem", marginRight: "0.5rem"}}>{todaysScore.dnf ? "🛑" : "⭐"}</span>
                      Your score: <span style={{fontWeight: "700", color: "#374151"}}>{todaysScore.guesses}</span>
                      {todaysScore.dnf && <span style={{marginLeft: "0.5rem", color: "#dc2626"}}>(DNF)</span>}
                      {todaysScore.hardMode && <span style={{marginLeft: "0.5rem", color: "#374151"}}>🦾 Hard Mode</span>}
                    </div>
                  )}
                </FlippingCountdownNZT>
              ) : (
                <form onSubmit={handleSubmit} className={classes.form}>
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
                  {!pasteWordle && (
                    <>
                      <div className={classes.formGroup}>
                        <label htmlFor="guesses">Enter your guesses (1-6):</label>
                        <input
                          id="guesses"
                          type="number"
                          value={guesses}
                          onChange={e => setGuesses(e.target.value)}
                          min="1"
                          max="6"
                          required={!didNotFinish}
                          className={classes.input}
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
                    </>
                  )}
                  {pasteWordle && (
                    <>
                      <div className={classes.formGroup}>
                        <label htmlFor="wordleResult">Paste your Wordle result:</label>
                        <textarea
                          id="wordleResult"
                          value={wordleResult}
                          onChange={e => setWordleResult(e.target.value)}
                          className={classes.textarea}
                          placeholder={`Paste your Wordle result here, for example:

Wordle 1,495 6/6

⬛🟨🟨🟨⬛
🟨⬛🟨⬛🟨
⬛🟩🟩🟩⬛
⬛🟩🟩🟩🟩
⬛🟩🟩🟩🟩
🟩🟩🟩🟩🟩`}
                          style={{
                            backgroundColor: "white",
                            cursor: "text"
                          }}
                        />
                      </div>
                    </>
                  )}
                  <button
                    type="submit"
                    className={classes.button}
                    disabled={loading || !isFormValid()}
                  >
                    {loading ? "Submitting..." : "Submit Score"}
                  </button>
                </form>
              )}
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
            <div style={{
              padding: "2rem", 
              width: "100%", 
              minHeight: "60vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: "2rem"
            }}>
              <div style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                padding: "3rem 2rem",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                maxWidth: "500px",
                width: "100%"
              }}>
                <div style={{
                  fontSize: "3rem",
                  marginBottom: "1rem"
                }}>
                  🎯
                </div>
                <h2 style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "#1a1a1a",
                  margin: "0 0 1rem 0",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                }}>
                  Play Today's Wordle
                </h2>
                <p style={{
                  fontSize: "1rem",
                  color: "#6b7280",
                  margin: "0 0 2rem 0",
                  lineHeight: "1.5",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                }}>
                  Unfortunately, the New York Times Wordle game cannot be embedded directly. Click the button below to open Wordle in a new tab.
                </p>
                <button
                  onClick={() => window.open('https://www.nytimes.com/games/wordle', '_blank', 'noopener,noreferrer')}
                  style={{
                    padding: "16px 32px",
                    borderRadius: "12px",
                    border: "none",
                    background: getCurrentGradient ? getCurrentGradient() : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    margin: "0 auto"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.4)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.3)";
                  }}
                  onMouseDown={(e) => {
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onMouseUp={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                  }}
                >
                  <span>🔗</span>
                  Open Wordle Game
                </button>
                <div style={{
                  marginTop: "1.5rem",
                  fontSize: "0.875rem",
                  color: "#9ca3af",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                }}>
                  After playing, come back here to submit your score!
                </div>
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
      <Confetti show={showConfetti} classes={classes} />
    </>
  );
};

export default InputForm;
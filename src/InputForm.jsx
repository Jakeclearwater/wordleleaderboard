import { createUseStyles } from "react-jss";
import React, { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { firestore } from "./firebase"; // Adjust the import path as necessary
import axios from "axios"; // For sending HTTP requests

// Define your styles
const useStyles = createUseStyles({
  form: {
    display: "flex",
    flexDirection: "column",
    padding: "1rem",
    "& label": {
      color: "black !important",
    },
  },
  input: {
    padding: "8px",
    margin: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
    "&.disabled": {
      backgroundColor: "#f0f0f0",
      cursor: "not-allowed",
    },
  },
  select: {
    padding: "8px",
    margin: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
    backgroundColor: "white",
    color: "black",
    appearance: "none"
  },
  button: {
    padding: "10px",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#007bff",
    color: "white",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#0056b3",
    },
  },
  checkbox: {
    margin: "0.5rem",
  },
  textarea: {
    padding: "8px",
    margin: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
    minHeight: "100px",
    minWidth: "195px",
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
  }
});

const InputForm = () => {
  const classes = useStyles();
  const [name, setName] = useState("");
  const [customName, setCustomName] = useState("");
  const [isCustomName, setIsCustomName] = useState(false);
  const [guesses, setGuesses] = useState("");
  const [didNotFinish, setDidNotFinish] = useState(false);
  const [wordleResult, setWordleResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [pasteWordle, setPasteWordle] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [testConfetti, setTestConfetti] = useState(false);

  useEffect(() => {
    const lastChosenName = localStorage.getItem("lastChosenName");
    if (lastChosenName) {
      if (names.includes(lastChosenName)) {
        setName(lastChosenName);
      } else {
        setCustomName(lastChosenName);
        setName("__new__");
        setIsCustomName(true);
      }
    }

    // Platform detection for debugging - runs when app loads
    const userAgent = navigator.userAgent.toLowerCase();
    let platformEmoji = '❓'; // Default unknown
    
    if (userAgent.includes('windows') || userAgent.includes('win32') || userAgent.includes('win64')) {
      platformEmoji = '🪟'; // Windows
    } else if (userAgent.includes('macintosh') || userAgent.includes('mac os x') || userAgent.includes('darwin')) {
      platformEmoji = '🍎'; // Mac
    } else if (userAgent.includes('linux') && !userAgent.includes('android')) {
      platformEmoji = '🐧'; // Linux
    } else if (userAgent.includes('android')) {
      platformEmoji = '🤖'; // Android
    } else if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ios')) {
      platformEmoji = '📱'; // iOS
    }
    
    // Debug logging on app load
    console.log('=== Platform Detection (App Load) ===');
    console.log('User Agent:', navigator.userAgent);
    console.log('Detected Platform:', platformEmoji);
    console.log('Modern Platform API:', navigator.userAgentData?.platform || 'not available');
    console.log('=====================================');
  }, []);

  const handleNameChange = (event) => {
    const newName = event.target.value;
    setName(newName);
    if (newName === "__new__") {
      setIsCustomName(true);
    } else {
      setIsCustomName(false);
      localStorage.setItem("lastChosenName", newName);
    }
  };

  const handleCustomNameChange = (event) => {
    const newCustomName = event.target.value;
    // Only allow letters (a-z, A-Z) and spaces
    const isValid = /^[a-zA-Z ]*$/.test(newCustomName);
    
    if (isValid) {
      setCustomName(newCustomName);
      if (newCustomName) {
        localStorage.setItem("lastChosenName", newCustomName);
      }
    }
    // If invalid, don't update the state (effectively blocking the input)
  };

  const names = [
    "Shay",
    "Damien",
    "Jake",
    "Michael",
    "Nick T",
    "Nick M",
    "Andy",
    "Brett",
    "Jordan",
    "Jeff",
    "Katie",
    "Ryan D",
    "James",
    "Ryan",
    "Ronan",
    "Sean",
    "Don",
    "Simon",
    "Cam",
    "Callum"
  ];

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
    const metadataLine = lines[0].trim(); // The first line contains the metadata

    console.log("Metadata Line:", metadataLine); // Debugging line

    // Regular expressions to match different formats
    const metadataMatch = metadataLine.charAt(metadataLine.length - 3);
    const wordleNumber = metadataLine.split(" ")[1];
    let numberOfGuesses = 0;
    let isDNF = false;
    if (!(parseInt(metadataMatch, 10) > 0 && parseInt(metadataMatch, 10) < 7)) {
      console.log("not found integer must be x ", metadataMatch); // Debugging line
      isDNF = true;
    } else {
      numberOfGuesses = parseInt(metadataMatch, 10);
    }

    // Extract the result blocks (lines) from the remaining part
    const resultBlocks = lines.slice(2, lines.length);

    console.log("Number of Guesses: ", numberOfGuesses); // Debugging line
    console.log("Wordle Result", wordleNumber);
    console.log("Meta-dataMatch: ", metadataMatch);
    console.log("Result Blocks: ", resultBlocks); // Debugging line

    return [numberOfGuesses, wordleNumber, resultBlocks, isDNF]; // Return as a tuple
  };

  const sendResultToTeams = async (
    numGuesses,
    wordleNumber,
    name,
    didNotFinish,
    resultBlocks,
    platformEmoji = null
  ) => {
    const grats = [
      "Genius",
      "Magnificent",
      "Impressive",
      "Splendid",
      "Great",
      "Phew",
    ];
    const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;

    // Format the message based on whether the player finished or not
    const messageText = didNotFinish
      ? `${name} did not finish - spoon!`
      : `${name} scored ${numGuesses} in Wordle #${wordleNumber} - ${
          grats[numGuesses - 1]
        }`;

    // Map the result blocks to TextBlocks with compact styling
    const textBlocks = resultBlocks.map((line) => ({
      type: "TextBlock",
      text: line,
      wrap: true, // Allow text to wrap within the card
      spacing: "None", // Reduce spacing between lines
      size: "Medium", // Use smaller text size
    }));

    // Add platform emoji if available
    const platformBlock = platformEmoji ? [{
      type: "TextBlock",
      text: `${platformEmoji} Platform`,
      wrap: true,
      spacing: "Small",
      size: "Small",
      isSubtle: true
    }] : [];

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
              ...platformBlock,
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
    const finalName = isCustomName ? customName.trim() : name;

    if (!finalName) {
      alert("Please provide your name.");
      setLoading(false);
      setShowOverlay(false);
      return;
    }

    // Detect platform and assign emoji
    const userAgent = navigator.userAgent.toLowerCase();
    let platformEmoji = '❓'; // Default unknown
    
    if (userAgent.includes('windows') || userAgent.includes('win32') || userAgent.includes('win64')) {
      platformEmoji = '🪟'; // Windows
    } else if (userAgent.includes('macintosh') || userAgent.includes('mac os x') || userAgent.includes('darwin')) {
      platformEmoji = '🍎'; // Mac
    } else if (userAgent.includes('linux') && !userAgent.includes('android')) {
      platformEmoji = '🐧'; // Linux
    } else if (userAgent.includes('android')) {
      platformEmoji = '🤖'; // Android
    } else if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ios')) {
      platformEmoji = '📱'; // iOS
    }
    
    // Debug logging
    console.log('Platform Detection:', {
      userAgent: navigator.userAgent,
      detectedPlatform: platformEmoji,
      // Using userAgent for detection instead of deprecated navigator.platform
      modernPlatform: navigator.userAgentData?.platform || 'not available'
    });

    // This is the problematic part - we need to ensure DNF is always 7
    let finalGuesses = 0;
    let wordleNumber = '';
    let resultBlocks = [];
    let isDNF = didNotFinish; // Start with the checkbox value
    
    if (pasteWordle && wordleResult.trim().length > 0) {
      // Parse the pasted result
      const [parsedWordleGuesses, parsedWordleNumber, parsedResultBlocks, parsedIsDNF] = 
        parseWordleResult(wordleResult);
      
      // Update DNF status if the pasted result indicates it
      isDNF = isDNF || parsedIsDNF;
      
      // Set the values from parsing
      wordleNumber = parsedWordleNumber;
      resultBlocks = parsedResultBlocks;
      
      // If DNF, set guesses to 7, otherwise use parsed value
      finalGuesses = isDNF ? 7 : parsedWordleGuesses;
    } else {
      // Manual entry - if DNF, set to 7, otherwise use the entered guesses
      finalGuesses = isDNF ? 7 : parseInt(guesses, 10) || 0;
    }
    
    // Additional validation
    const isWordleResultPasted = wordleResult.trim().length > 0;
    const isNumGuessesProvided = parseInt(guesses, 10) > 0;

    if (!name) {
      alert("Please provide your name.");
      setLoading(false);
      setShowOverlay(false);
      return;
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
      } else if (isNumGuessesProvided && numGuesses !== parsedWordleGuesses) {
        alert(
          `Mismatch detected: Number of guesses (${numGuesses}) does not match the pasted result (${parsedWordleGuesses}).`
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

    const utcDate = new Date();
    const nzDate = new Date(
      utcDate.toLocaleString("en-US", { timeZone: "Pacific/Auckland" })
    );
    const formattedNZDate = nzDate.toISOString().split("T")[0];

    try {
      // Store in Firestore - ensure guesses is 7 for DNF and include dnf flag
      await addDoc(collection(firestore, "scores"), {
        name: finalName,
        guesses: isDNF ? 7 : finalGuesses, // Explicitly set 7 for DNF
        date: formattedNZDate,
        dnf: isDNF, // Add DNF flag to database
      });

      // Reset form
      setGuesses("");
      setDidNotFinish(false);
      setWordleResult("");
      setPasteWordle(false);

      // Show confetti for excellent scores (1 to 3 guesses)
      if (!isDNF && finalGuesses <= 3) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000); // Hide after 4 seconds
      }

      // Send to Teams webhook with platform info
      if (pasteWordle && isWordleResultPasted) {
        await sendResultToTeams(
          finalGuesses,  // Use the calculated final guesses
          wordleNumber,
          finalName,
          isDNF,        // Use the calculated isDNF
          resultBlocks,
          platformEmoji // Include platform emoji
        );
      } else if (!pasteWordle && isNumGuessesProvided) {
        await sendResultToTeams(
          finalGuesses,  
          wordleNumber || "Unknown", 
          finalName, 
          isDNF, 
          [],
          platformEmoji // Include platform emoji
        );
      }
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setShowOverlay(false);
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

  return (
    <>
      {showOverlay && (
        <div className={`${classes.overlay} ${loading ? "" : classes.hidden}`}>
          <div>
            <h2>Submitting Result...</h2>
          </div>
        </div>
      )}
      {showConfetti && (
        <div className={classes.confetti}>
          {createConfetti()}
        </div>
      )}
      <form onSubmit={handleSubmit} className={classes.form}>
        <div>
          <label htmlFor="name">Name:</label>
          <select
            id="name"
            value={name}
            onChange={handleNameChange}
            required={!didNotFinish && !isCustomName}
            className={classes.select}
            disabled={didNotFinish}
          >
            <option value="" disabled>
              Select your name
            </option>
            {names.map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
            <option value="__new__">Add New Name</option>
          </select>
        </div>
        {isCustomName && (
          <div>
            <label htmlFor="customName">Enter your name:</label>
            <input
              type="text"
              id="customName"
              value={customName}
              onChange={handleCustomNameChange}
              required={!didNotFinish && isCustomName}
              className={classes.input}
              disabled={didNotFinish}
              placeholder="Type your name (letters only)"
              pattern="[a-zA-Z ]*"
              title="Only letters and spaces are allowed"
            />
          </div>
        )}
        <div>
          <label htmlFor="guesses">Number of Guesses:</label>
          <input
            type="number"
            id="guesses"
            value={didNotFinish ? "" : guesses}
            onChange={(e) => setGuesses(e.target.value)}
            min={1}
            max={6}
            required={!didNotFinish && !pasteWordle} // Only required if DNF is not checked and Wordle output is not pasted
            className={`${classes.input} ${
              didNotFinish || pasteWordle ? classes.disabled : ""
            }`} // Disable if DNF or Paste Wordle Output is checked
            disabled={didNotFinish || pasteWordle} // Disable if DNF or Paste Wordle Output is checked
          />
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={didNotFinish}
              onChange={(e) => setDidNotFinish(e.target.checked)}
              className={classes.checkbox}
            />
            Did Not Finish
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={pasteWordle}
              onChange={(e) => setPasteWordle(e.target.checked)}
              className={classes.checkbox}
            />
            Paste Wordle Output
          </label>
        </div>
        {pasteWordle && (
          <div>
            <textarea
              id="wordleResult"
              value={wordleResult}
              onChange={(e) => setWordleResult(e.target.value)}
              className={classes.textarea}
            />
          </div>
        )}

        <button
          type="submit"
          className={`${classes.button} ${loading ? classes.disabled : ""}`}
          disabled={loading}
        >
          Submit
        </button>
      </form>
    </>
  );
};

export default InputForm;

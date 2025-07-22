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
    padding: "2rem",
    width: "400px",
    maxWidth: "400px",
    minWidth: "400px",
    margin: "0 auto",
    gap: "1rem",
    boxSizing: "border-box",
    "@media (max-width: 480px)": {
      width: "calc(100vw - 2rem)",
      maxWidth: "calc(100vw - 2rem)",
      minWidth: "calc(100vw - 2rem)",
      padding: "1rem",
    },
    "& label": {
      color: "black !important",
      fontWeight: "400",
      fontSize: "14px",
      marginBottom: "0.3rem",
      display: "block",
    },
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    transition: "all 0.2s ease-out",
  },
  input: {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease",
    "&:focus": {
      outline: "none",
      borderColor: "#28a745",
      boxShadow: "0 0 0 2px rgba(40, 167, 69, 0.2)",
    },
    "&.disabled": {
      backgroundColor: "#f8f9fa",
      cursor: "not-allowed",
      color: "#6c757d",
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
    padding: "10px 24px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#007bff",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    width: "100%",
    boxSizing: "border-box",
    marginTop: "0.3rem",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#0056b3",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 8px rgba(0, 123, 255, 0.3)",
    },
    "&:active": {
      transform: "translateY(0)",
    },
    "&.disabled": {
      backgroundColor: "#6c757d",
      cursor: "not-allowed",
      transform: "none",
      boxShadow: "none",
      "&:hover": {
        backgroundColor: "#6c757d",
        transform: "none",
        boxShadow: "none",
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
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    minHeight: "120px",
    width: "100%",
    boxSizing: "border-box",
    fontSize: "14px",
    fontFamily: "monospace",
    resize: "vertical",
    transition: "all 0.2s ease-out",
    "&:focus": {
      outline: "none",
      borderColor: "#28a745",
      boxShadow: "0 0 0 2px rgba(40, 167, 69, 0.2)",
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
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    minWidth: "50px",
    minHeight: "50px",
    fontSize: "24px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.2s ease",
    margin: "0 auto 1rem auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    flexShrink: 0,
    aspectRatio: "1",
    lineHeight: "1",
    "&:hover": {
      backgroundColor: "#0056b3",
    },
    "&:active": {
      transform: "translateY(0)",
    },
  },
  toggleContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: "0.5rem",
    marginBottom: "1rem",
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
  const [isFormExpanded, setIsFormExpanded] = useState(false);

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
    // Only allow letters (a-z, A-Z) and spaces, up to 12 characters max
    // Allow 0+ characters during typing, but we'll validate 3+ on submission
    const isValid = /^[a-zA-Z ]{0,12}$/.test(newCustomName);
    
    if (isValid) {
      setCustomName(newCustomName);
      if (newCustomName && newCustomName.length >= 3) {
        localStorage.setItem("lastChosenName", newCustomName);
      }
    }
    // If invalid, don't update the state (effectively blocking the input)
  };

  const handlePasteWordleChange = (e) => {
    const isChecked = e.target.checked;
    setPasteWordle(isChecked);
    
    // Clear DNF checkbox and guesses when Paste Wordle Output is checked
    // The DNF status and score will be determined automatically from the pasted content
    if (isChecked) {
      setDidNotFinish(false);
      setGuesses("");
    }
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
    resultBlocks
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
    const messageText = `${name} scored ${numGuesses} in Wordle #${wordleNumber} - ${grats[numGuesses - 1]}`;

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
    const finalName = isCustomName ? customName.trim() : name;

    if (!finalName) {
      alert("Please provide your name.");
      setLoading(false);
      setShowOverlay(false);
      return;
    }

    // Validate custom name length (3-12 characters)
    if (isCustomName && (finalName.length < 3 || finalName.length > 12)) {
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
    
    if (pasteWordle && wordleResult.trim().length > 0) {
      // Parse the pasted result
      const [parsedWordleGuesses, parsedWordleNumber, parsedResultBlocks, parsedIsDNF] = 
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

    if (!name) {
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
        guesses: isDNF ? 7 : finalGuesses, // Explicitly set 7 for DNF
        date: formattedNZDate,
        isoDate: isoDateTime, // Add ISO datetime field
        dnf: isDNF, // Add DNF flag to database
        wordleNumber: wordleNumber || null, // Store Wordle number if available
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
          resultBlocks
        );
      } else if (!pasteWordle && (isNumGuessesProvided || isDNF)) {
        // Send webhook for manual entries (both scored and DNF)
        await sendResultToTeams(
          finalGuesses,  
          wordleNumber || "Unknown", 
          finalName, 
          isDNF, 
          []
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

  // Check if form is valid for submit button state
  const isFormValid = () => {
    const finalName = isCustomName ? customName.trim() : name;
    
    // Must have a name
    if (!finalName) return false;
    
    // Custom name must be 3-12 characters
    if (isCustomName && (finalName.length < 3 || finalName.length > 12)) return false;
    
    // Must have either guesses, DNF, or paste wordle with content
    if (pasteWordle) {
      return wordleResult.trim().length > 0;
    } else {
      return didNotFinish || (guesses && parseInt(guesses, 10) >= 1 && parseInt(guesses, 10) <= 6);
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
      
      <div className={classes.toggleContainer}>
        <button 
          className={classes.toggleButton}
          onClick={() => setIsFormExpanded(!isFormExpanded)}
          type="button"
          title={isFormExpanded ? "Hide Score Submission" : "Submit New Score"}
        >
          {isFormExpanded ? "▲" : "▼"}
        </button>
      </div>
      
      <div className={`${classes.formContainer} ${isFormExpanded ? 'expanded' : 'collapsed'}`}>
        <form onSubmit={handleSubmit} className={classes.form}>
        <div className={classes.formGroup}>
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
          <div className={classes.formGroup}>
            <label htmlFor="customName">Enter your name:</label>
            <input
              type="text"
              id="customName"
              value={customName}
              onChange={handleCustomNameChange}
              required={!didNotFinish && isCustomName}
              className={`${classes.input} ${didNotFinish ? classes.disabled : ""}`}
              disabled={didNotFinish}
              placeholder="Type your name (3-12 characters)"
              pattern="[a-zA-Z ]{3,12}"
              title="Name must be 3-12 characters, letters and spaces only"
              minLength={3}
              maxLength={12}
            />
          </div>
        )}

        <div className={classes.formGroup}>
          <label htmlFor="guesses">Number of Guesses:</label>
          <input
            type="number"
            id="guesses"
            value={didNotFinish ? "" : guesses}
            onChange={(e) => setGuesses(e.target.value)}
            min={1}
            max={6}
            required={!didNotFinish && !pasteWordle}
            className={`${classes.input} ${
              didNotFinish || pasteWordle ? classes.disabled : ""
            }`}
            disabled={didNotFinish || pasteWordle}
            placeholder="Enter 1-6"
          />
        </div>

        <div className={classes.checkboxGroup}>
          <div className={classes.checkboxWrapper}>
            <input
              type="checkbox"
              id="didNotFinish"
              checked={didNotFinish}
              onChange={(e) => setDidNotFinish(e.target.checked)}
              className={classes.checkbox}
              disabled={pasteWordle}
            />
            <label htmlFor="didNotFinish">Did Not Finish</label>
          </div>

          <div className={classes.checkboxWrapper}>
            <input
              type="checkbox"
              id="pasteWordle"
              checked={pasteWordle}
              onChange={handlePasteWordleChange}
              className={classes.checkbox}
            />
            <label htmlFor="pasteWordle">Paste Wordle Output</label>
          </div>
        </div>

        {pasteWordle && (
          <div className={classes.formGroup}>
            <label htmlFor="wordleResult">Paste your Wordle result:</label>
            <textarea
              id="wordleResult"
              value={wordleResult}
              onChange={(e) => setWordleResult(e.target.value)}
              className={classes.textarea}
              placeholder="Paste your Wordle result here..."
            />
          </div>
        )}

        <button
          type="submit"
          className={`${classes.button} ${(!isFormValid() || loading) ? classes.disabled : ""}`}
          disabled={!isFormValid() || loading}
        >
          {loading ? "Submitting..." : "Submit Score"}
        </button>
        </form>
      </div>
    </>
  );
};

export default InputForm;

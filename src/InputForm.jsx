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
    transition: "opacity 0.5s ease",
  },
  hidden: {
    opacity: 0,
  },
});

const InputForm = () => {
  const classes = useStyles();
  const [name, setName] = useState("");
  const [guesses, setGuesses] = useState("");
  const [didNotFinish, setDidNotFinish] = useState(false);
  const [wordleResult, setWordleResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [pasteWordle, setPasteWordle] = useState(false);

  useEffect(() => {
    const lastChosenName = localStorage.getItem("lastChosenName");
    if (lastChosenName) {
      setName(lastChosenName);
    }
  }, []);

  const handleNameChange = (event) => {
    const newName = event.target.value;
    setName(newName);
    localStorage.setItem("lastChosenName", newName);
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
  ];

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

    // Ensure wordleGuesses is an integer or default to 0
    const wordleGuesses = parseInt(wordleResult, 10) || 0;
    const numGuesses = didNotFinish ? 0 : parseInt(guesses, 10) || 0;

    const [parsedWordleGuesses, wordleNumber, resultBlocks, isDNF] =
      parseWordleResult(wordleResult);

    // Automatically set DNF if pasted result indicates it
    if (pasteWordle && isDNF) {
      setDidNotFinish(true);
    }

    const isWordleResultPasted = wordleResult.trim().length > 0;
    const isNumGuessesProvided = numGuesses > 0;

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
          alert(
            "The pasted result indicates DNF, but 'Did Not Finish' is not selected."
          );
          setLoading(false);
          setShowOverlay(false);
          return;
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

    const utcDate = new Date();
    const nzDate = new Date(
      utcDate.toLocaleString("en-US", { timeZone: "Pacific/Auckland" })
    );
    const formattedNZDate = nzDate.toISOString().split("T")[0];

    try {
      const finalGuesses =
        pasteWordle && isWordleResultPasted
          ? isDNF
            ? 0
            : parsedWordleGuesses // Use parsed guesses if Wordle output is pasted
          : numGuesses; // Otherwise use the provided number of guesses

      await addDoc(collection(firestore, "scores"), {
        name,
        guesses: finalGuesses,
        date: formattedNZDate,
      });

    setGuesses("");
    setDidNotFinish(false);
    setWordleResult("");
    setPasteWordle(false);

      if (pasteWordle && isWordleResultPasted) {
        await sendResultToTeams(
          parsedWordleGuesses,
          wordleNumber,
          name,
          isDNF,
          resultBlocks
        );
      } else if (!pasteWordle && isNumGuessesProvided) {
        await sendResultToTeams(numGuesses, name, didNotFinish, []);
      }

      setGuesses("");
      setDidNotFinish(false);
      setWordleResult("");
      setPasteWordle(false);
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setShowOverlay(false);
      }, 3000);
    }
  };

  return (
    <>
      {showOverlay && (
        <div className={`${classes.overlay} ${loading ? "" : classes.hidden}`}>
          <div>
            <h2>Thank You!</h2>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className={classes.form}>
        <div>
          <label htmlFor="name">Name:</label>
          <select
            id="name"
            value={name}
            onChange={handleNameChange}
            required={!didNotFinish}
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
          </select>
        </div>
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

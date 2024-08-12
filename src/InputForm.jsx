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
  },
});

const InputForm = () => {
  const classes = useStyles(); // Use the styles
  const [name, setName] = useState("");
  const [guesses, setGuesses] = useState("");
  const [didNotFinish, setDidNotFinish] = useState(false); // State for toggle button
  const [wordleResult, setWordleResult] = useState(""); // State for Wordle result

  // Load the last chosen name from localStorage (if exists)
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
    "Simon"
  ];

  const parseWordleResult = (result) => {
    // Split the result into lines and separate the header from the body
    const lines = result.trim().split('\n');
    const header = lines[0]; // The first line as the header
    const resultLines = lines.slice(1); // The rest as result lines

    return { header, resultLines };
  };

  const sendResultToTeams = async (result, name, didNotFinish, wordleResult) => {
    const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;
    const { header, resultLines } = parseWordleResult(wordleResult);

    // Ensure resultLines is an array
    if (!Array.isArray(resultLines)) {
      console.error("resultLines is not an array:", resultLines);
      return;
    }

    // Create an array of TextBlock objects for each line
    const textBlocks = resultLines.map((line, index) => ({
      type: "TextBlock",
      text: line,
      wrap: false, // Prevent text wrapping to keep the formatting intact
      separator: false
    }));

    const payload = {
      type: "message",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          content: {
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "type": "AdaptiveCard",
            "version": "1.2",
            "body": [
              {
                "type": "TextBlock",
                "text": `${name} scored ${didNotFinish ? 'X' : 'N/A'} DID NOT FINISH:`,
                "weight": "bolder",
                "size": "medium"
              },
              {
                "type": "TextBlock",
                "text": header, // Add the header
                "wrap": false,
                "separator": true
              },
              ...textBlocks // Add each TextBlock for each line of the Wordle result
            ]
          }
        }
      ]
    };

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

    // Extract the number of guesses from the pasted result
    const wordleGuesses = parseWordleResult(wordleResult);
    const resultGuesses = wordleGuesses.resultLines.length; // Number of lines is the number of guesses
    const numGuesses = didNotFinish ? 0 : Number(guesses); // Get the number of guesses from input

    console.log("Number of guesses:", numGuesses);
    console.log("Parsed Wordle guesses:", wordleGuesses);

    // Check if Wordle result is pasted
    const isWordleResultPasted = wordleResult.trim().length > 0;

    if (isWordleResultPasted) {
      // If Wordle result is pasted, ignore `numGuesses` and `didNotFinish`
      if (numGuesses !== 0 && numGuesses !== resultGuesses) {
        // If there’s a mismatch between the number of guesses and the pasted result
        alert(`Mismatch detected: Number of guesses (${numGuesses}) does not match the pasted result (${resultGuesses}).`);
        return; // Prevent form submission
      }
    } else {
      // If Wordle result is not pasted, validate based on the form fields
      if (numGuesses === 0) {
        alert("Better luck next time " + name + "!");
        return; // Prevent form submission
      }

      if (
        !name ||
        (didNotFinish || (Number.isInteger(numGuesses) && (numGuesses >= 1 && numGuesses <= 6 || numGuesses === 7)))
      ) {
        alert("Guesses must be between 1 and 6 or exactly 7 for a fail.");
        return; // Prevent form submission
      }
    }

    const utcDate = new Date();
    const nzDate = new Date(utcDate.toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" }));
    const formattedNZDate = nzDate.toISOString().split("T")[0];

    try {
      await addDoc(collection(firestore, "scores"), {
        name,
        guesses: isWordleResultPasted ? resultGuesses : numGuesses,
        date: formattedNZDate,
      });
      setName(name);
      setGuesses("");
      setDidNotFinish(false);
      setWordleResult("");

      const result = didNotFinish ? 0 : wordleGuesses;
      await sendResultToTeams(result, name, didNotFinish, wordleResult);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={classes.form}>
      <div>
        <h2>Enter Results</h2>
        <label htmlFor="name">Name:</label>
        <select
          id="name"
          value={name}
          onChange={handleNameChange}
          required={!didNotFinish} // Make this required only if not DNF
          className={classes.select}
          disabled={didNotFinish} // Disable select if DNF is checked
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
          value={didNotFinish ? "" : guesses} // Clear value if DNF is checked
          onChange={(e) => setGuesses(e.target.value)}
          min={0}
          max={7}
          required={!didNotFinish} // Make this required only if not DNF
          className={`${classes.input} ${didNotFinish ? classes.disabled : ""}`} // Apply disabled style if DNF
          disabled={didNotFinish} // Disable input if DNF is checked
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
        <label htmlFor="wordleResult">Wordle Result:</label>
        <textarea
          id="wordleResult"
          value={wordleResult}
          onChange={(e) => setWordleResult(e.target.value)}
          className={classes.textarea}
        />
      </div>
      <button type="submit" className={classes.button}>
        Submit
      </button>
    </form>
  );
};

export default InputForm;

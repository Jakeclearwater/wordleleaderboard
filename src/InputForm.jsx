// Import `createUseStyles` from `react-jss`
import { createUseStyles } from "react-jss";
import React, { useState, useEffect } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { firestore } from "./firebase"; // Adjust the import path as necessary

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
});

const InputForm = () => {
  const classes = useStyles(); // Use the styles
  const [name, setName] = useState("");
  const [guesses, setGuesses] = useState("");
  const [didNotFinish, setDidNotFinish] = useState(false); // State for toggle button

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
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numGuesses = didNotFinish ? 0 : Number(guesses);
    if (numGuesses === 0) {
      alert("Better luck next time " + name + "!");
    }
    // Check if guesses is valid
    if (
      name &&
      (didNotFinish ||
        (Number.isInteger(numGuesses) &&
         (numGuesses >= 1 && numGuesses <= 6 || numGuesses === 7)))
    ) {
      try {
        await addDoc(collection(firestore, "scores"), {
          name,
          guesses: numGuesses,
          date: Timestamp.fromDate(new Date())
            .toDate()
            .toISOString()
            .split("T")[0],
        });
        setName(name);
        setGuesses("");
        setDidNotFinish(false); // Reset toggle button state
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    } else {
      // Handle invalid input
      alert("Guesses must be between 1 and 6 or exactly 7 for a fail.");
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
      <button type="submit" className={classes.button}>
        Submit
      </button>
    </form>
  );
};

export default InputForm;

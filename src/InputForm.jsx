// Import `createUseStyles` from `react-jss`
import { createUseStyles } from 'react-jss';
import React, { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { firestore } from './firebase'; // Adjust the import path as necessary

// Define your styles
const useStyles = createUseStyles({
  form: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
'& label': {
      color: 'black !important',
    }
  },
  input: {
    padding: '8px',
    margin: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  select: {
    padding: '8px',
    margin: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#0056b3',
    },
  },
});

const InputForm = () => {
  const classes = useStyles(); // Use the styles
  const [name, setName] = useState('');
  const [guesses, setGuesses] = useState('');

  const names = ['Shay', 'Damien', 'Jake', 'Michael', 'Nick T', 'Nick M', 'Andy', 'Brett', 'Jordan', 'Jeff', 'James', 'Ryan', 'Ronan', 'Sean', 'Don'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check if guesses is between 1 and 6 or is exactly 7
    if (name == 'Brett') {
      alert('Brett doesnt play, stop it Shay!.');
    } else if (name && Number.isInteger(guesses) && guesses >= 1 && guesses <= 7) {
      try {
        await addDoc(collection(firestore, 'scores'), {
          name,
          guesses,
          date: Timestamp.fromDate(new Date()).toDate().toISOString().split('T')[0],
        });
        setName('');
        setGuesses('');
      } catch (error) {
        console.error('Error adding document: ', error);
      }
    } else {
      // Handle invalid input
      alert('Guesses must be between 1 and 6 or exactly 7 for a fail.');
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
          onChange={(e) => setName(e.target.value)}
          required
          className={classes.select}
        >
          <option value="" disabled>Select your name</option>
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
          value={guesses}
          onChange={(e) => setGuesses(Number(e.target.value))}
          min={1}
          max={6}
          required
          className={classes.input}
        />
      </div>
      <button type="submit" className={classes.button}>Submit</button>
    </form>
  );
};

export default InputForm;
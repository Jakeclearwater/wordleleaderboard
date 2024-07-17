// src/components/InputForm.js
import React, { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { firestore } from './firebase'; // Adjust the import path as necessary

const InputForm = () => {
  const [name, setName] = useState('');
  const [guesses, setGuesses] = useState(0);

  // List of names for the dropdown
  const names = ['Shay', 'Damien', 'Jake', 'Michael', 'Nick T', 'Nick M', 'Andy', 'Brett', 'Jordan', 'Jeff'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name && guesses > 0) {
      try {
        await addDoc(collection(firestore, 'scores'), {
          name,
          guesses,
          date: Timestamp.fromDate(new Date()).toDate().toISOString().split('T')[0], // Format date as YYYY-MM-DD
        });
        setName('');
        setGuesses(0);
      } catch (error) {
        console.error('Error adding document: ', error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name:</label>
        <select
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        >
          <option value="" disabled>Select a name</option>
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
          required
        />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default InputForm;
// src/App.js
import React from 'react';
import InputForm from './InputForm';
import Leaderboard from './Leaderboard';

const App = () => {
  return (
    <div className="App">
      <h1>Wordle Leaderboard</h1>
      <InputForm />
      <Leaderboard />
    </div>
  );
};

export default App;

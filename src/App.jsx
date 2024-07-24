import React from 'react';
import InputForm from './InputForm';
import Leaderboard from './Leaderboard';
import { createUseStyles } from 'react-jss';

const App = () => {
  const classes = useStyles();
  // Split "Wordle" into individual characters and wrap each in a span
  const wordleSpans = "ITWORDLE".split('').map((char, index) => (
    <span key={index} className={classes.char}>{char}</span>
  ));

  return (
    <div className={classes.App}>
      <h1>{wordleSpans}</h1>
      <InputForm />
      <Leaderboard />
      <p>Pls dont <a href="https://www.crowdstrike.com/en-us/">break</a> it, it was a 15min hack</p>
    </div>
  );
};

const useStyles = createUseStyles({
  App: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center !important',
    width: '100vw',
    backgroundColor: 'white',
    marginTop: 'auto !important',
    marginBottom: 'auto !important',
    '& p': {
      color: 'black !important'
    }
  },
  h1: {
    color: '#333',
    fontSize: '2rem',
    margin: '0.5rem',
  },
  // Style for each character span
  char: {
    display: 'inline-block',
    padding: '0.5rem',
    margin: '0.25rem',
    width: '3.5rem',
    textAlign: 'center',
    borderRadius: '4px',
    // Use green or yellow background color
    backgroundColor: index => (index % 2 === 0 ? 'green' : 'green'), // Alternate colors for demonstration
    color: 'white',
    fontWeight: 'bold',
  },
})

export default App;

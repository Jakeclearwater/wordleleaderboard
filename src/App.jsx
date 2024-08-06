import React from 'react';
import InputForm from './InputForm';
import Leaderboard from './Leaderboard';
import { createUseStyles } from 'react-jss';
import bsod from './assets/bsod.png';

const App = () => {
  const classes = useStyles();
  const wordle = "ITWORDLE";
  const appVersion = '1.0.0'
  const classNames = ["green", "yellow", "gray"];
  // Split "Wordle" into individual characters and wrap each in a span
  const wordleSpans = wordle.split('').map((char, index) => (
    <span key={index}
    className={classes.char + ' ' + classes['color_' + classNames[Math.floor(Math.random() * classNames.length)]]}
    >{char}</span>
  ));



  const hack = () => {
    console.log("oops");
    document.body.style.backgroundImage = `url('${bsod}')`;
  }

  return (
    <div className={classes.App}>
      <p><span className={classes.versionInfo}>Application Version {appVersion}</span></p>
      <h1>{wordleSpans}</h1>
      <InputForm />
      <Leaderboard />
      <p>Pls dont <span className={classes.spanicon} onClick={hack}>break</span> it, it was a 2hour hack</p>
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
    marginTop: 'auto !important',
    marginBottom: 'auto !important',
    '& p': {
      color: 'black !important'
    },
  },
  versionInfo: {
    position: 'absolute',
    top: 0,
    left: 0,
    color: 'grey',
    fontSize: '0.8rem',
    textAlign: 'left',
    display: 'block',
    marginLeft: '10px',
  },
  spanicon: {
    color: 'red !important',
    cursor: 'pointer',
    textDecoration: 'underline',
    '&:hover': {
      color: 'darkred', // Optional: Change color on hover
      textDecoration: 'underline', // Ensure underline stays on hover
    },
  },
  h1: {
    color: '#333',
    fontSize: '2rem',
    margin: '0.5rem',
  },
  char: {
    display: 'inline-block',
    padding: '0.5rem',
    margin: '0.25rem',
    width: '3.5rem',
    textAlign: 'center',
    borderRadius: '4px',
    backgroundColor: 'none',
    background: 'none',
    color: 'white !important',
    fontWeight: 'bold',
  },
  color_green: {
    backgroundColor: '#538d4e',
  },
  color_yellow: {
    backgroundColor: '#b59f3b',
  },
  color_gray: {
    backgroundColor: '#3a3a3c',
  }
})

export default App;

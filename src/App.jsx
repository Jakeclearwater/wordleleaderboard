import React from 'react';
import InputForm from './InputForm';
import Leaderboard from './Leaderboard';
import { createUseStyles } from 'react-jss';
import bsod from './assets/bsod.png';

// Function to get the current date and time in ddmmyyhhmmss format
const getBuildDateVersion = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = String(now.getFullYear()).slice(-2); // Last two digits of the year
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${day}${month}${year}${hours}${minutes}${seconds}`;
};

const App = () => {
  const gradientStyle = {
    background: 'linear-gradient(to bottom, #e3e3e1, #d0d0c0)',
    height: '100%', // Ensure the gradient covers the full viewport height
    margin: 0
  };
  const classes = useStyles();
  const wordle = "ITWORDLE";
  const appVersion = getBuildDateVersion();
  const classNames = ["green", "yellow", "gray"];

  const wordleSpans = wordle.split('').map((char, index) => (
    <span key={index}
      className={classes.char + ' ' + classes['color_' + classNames[Math.floor(Math.random() * classNames.length)]]}
    >{char}</span>
  ));

  const hack = () => {
    console.log("oops");
    // This will now not affect the background image since the image is managed by BackgroundOverlay
    document.getElementById('backgroundOverlay').style.backgroundImage = `url('${bsod}')`;
    document.getElementById('backgroundOverlay').style.backgroundSize = 'cover';
    document.getElementById('backgroundOverlay').style.backgroundRepeat = 'no-repeat';
    document.getElementById('backgroundOverlay').style.backgroundPosition = 'center';
    document.getElementById('backgroundOverlay').style.backgroundColor = 'transparent';
  };

  return (
    <div className={classes.App}  style={gradientStyle}>
      <div id="backgroundOverlay" className={classes.overlay}></div>
      <p><span className={classes.versionInfo}>Build: {appVersion}</span></p>
      <h1>{wordleSpans}</h1>
      <InputForm />
      <Leaderboard />
      <p>Please don't <span className={classes.spanicon} onClick={hack}>break</span> this app. It is an ongoing, currently a 2.4 hour hack.</p>
    </div>
  );
};

const useStyles = createUseStyles({
  App: {
    position: 'relative', // Ensure children are positioned relative to this container
    backgroundColor: '#e3e3e1',
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
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 999, // Ensure it's above other content
    pointerEvents: 'none', // Allows interaction with underlying elements
  },
  versionInfo: {
    position: 'absolute',
    top: 0,
    left: 0,
    color: 'rgba(83, 73, 73, 0.87);',
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
      color: 'darkred',
      textDecoration: 'underline',
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
});

export default App;

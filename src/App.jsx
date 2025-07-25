import React, { useState, useEffect } from 'react';
import InputForm from './InputForm';
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

// Cookie helper functions
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const setCookie = (name, value, days = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

// Predefined background themes
const backgroundThemes = {
  default: {
    name: '🌈 Default Purple',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  ocean: {
    name: '🌊 Ocean Blue',
    gradient: 'linear-gradient(135deg, #667db6 0%, #0082c8 50%, #0082c8 100%)'
  },
  sunset: {
    name: '🌅 Sunset Orange',
    gradient: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 50%, #c44569 100%)'
  },
  forest: {
    name: '🌲 Forest Green',
    gradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)'
  },
  midnight: {
    name: '🌙 Midnight Blue',
    gradient: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)'
  },
  aurora: {
    name: '✨ Aurora',
    gradient: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)'
  },
  cherry: {
    name: '🌸 Cherry Blossom',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  },
  cosmic: {
    name: '🚀 Cosmic',
    gradient: 'linear-gradient(135deg, #8360c3 0%, #2ebf91 100%)'
  },
  monochrome: {
    name: '⚫ Monochrome',
    gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)'
  },
  custom: {
    name: '🎨 Custom',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }
};

const App = () => {
  // Background theme state with cookie persistence
  const [selectedTheme, setSelectedTheme] = useState(() => getCookie('background-theme') || 'default');
  const [customColors, setCustomColors] = useState(() => {
    const saved = getCookie('custom-background-colors');
    return saved ? JSON.parse(saved) : { color1: '#667eea', color2: '#764ba2' };
  });
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);

  // Save theme preference to cookies
  useEffect(() => {
    setCookie('background-theme', selectedTheme);
  }, [selectedTheme]);

  // Save custom colors to cookies
  useEffect(() => {
    setCookie('custom-background-colors', JSON.stringify(customColors));
  }, [customColors]);

  // Get current gradient based on selected theme
  const getCurrentGradient = () => {
    if (selectedTheme === 'custom') {
      return `linear-gradient(135deg, ${customColors.color1} 0%, ${customColors.color2} 100%)`;
    }
    return backgroundThemes[selectedTheme]?.gradient || backgroundThemes.default.gradient;
  };

  const gradientStyle = {
    background: getCurrentGradient(),
    minHeight: '100vh',
    width: '100%',
    margin: 0,
    padding: 0
  };
  const classes = useStyles();
  const wordle = "ITWORDLE";
  const appVersion = getBuildDateVersion();
  const classNames = ["green", "yellow"];

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
    <div className={classes.App} style={gradientStyle}>
      <div id="backgroundOverlay" className={classes.overlay}></div>

      <div className={classes.container}>
        <p><span className={classes.versionInfo}>Build: {appVersion}</span></p>
        <h1 className={classes.title}>{wordleSpans}</h1>
        <InputForm 
          backgroundThemes={backgroundThemes}
          selectedTheme={selectedTheme}
          setSelectedTheme={setSelectedTheme}
          customColors={customColors}
          setCustomColors={setCustomColors}
          getCurrentGradient={getCurrentGradient}
        />
        <footer className={classes.footer}>
          <p>Made with 💚 for Wordle enthusiasts · <span className={classes.spanicon} onClick={hack}>Don't break this!</span></p>
        </footer>
      </div>
    </div>
  );
};

const useStyles = createUseStyles({
  App: {
    position: 'relative',
    minHeight: '100vh',
    width: '100%',
    maxWidth: '100%',
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
  },
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    justifyContent: 'flex-start',
    width: '100%',
    maxWidth: '100%',
    padding: '0 1rem',
    boxSizing: 'border-box',
    
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 999,
    pointerEvents: 'none',
  },
  versionInfo: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.8rem',
    fontFamily: 'monospace',
  },
  title: {
    color: 'white',
    fontSize: '3.8rem',
    fontWeight: '900',
    letterSpacing: '-0.02em',
    margin: '1.5rem 0 0 0',
    padding: '0.5rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    '@media (max-width: 768px)': {
      fontSize: '2.8rem',
      margin: '1rem 0 0.5rem 0',
    },
  },
  footer: {
    marginTop: 'auto',
    padding: '2rem 0',
    textAlign: 'center',
    '& p': {
      color: 'rgba(255, 255, 255, 0.8) !important',
      fontSize: '0.9rem',
      margin: 0,
    },
  },
  spanicon: {
    color: '#ff6b6b !important',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontWeight: 'bold',
    '&:hover': {
      color: '#ff5252 !important',
      textDecoration: 'underline',
    },
  },
  char: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '0.75rem 1rem',
    margin: '0.15rem',
    minWidth: '3.5rem',
    width: 'auto',
    height: '3.5rem',
    textAlign: 'center',
    borderRadius: '6px',
    color: 'white !important',
    fontWeight: '800',
    fontSize: '1.4rem',
    boxSizing: 'border-box',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
    transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
    border: 'none',
    perspective: '600px',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'rotateY(180deg) scale(1.08)',
      boxShadow: '0 4px 18px rgba(0,0,0,0.25)',
      backgroundColor: '#787c7e',
      color: 'transparent !important',
    },
    '&:hover::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#787c7e',
      borderRadius: '6px',
      zIndex: 2,
      display: 'block',
    },
    '@media (max-width: 768px)': {
      padding: '0.6rem 0.8rem',
      minWidth: '2.8rem',
      height: '2.8rem',
      fontSize: '1.1rem',
      margin: '0.1rem',
    },
  },
  color_green: {
    backgroundColor: '#6aaa64',
    border: '2px solid #5a8a54',
  },
  color_yellow: {
    backgroundColor: '#c9b458',
    border: '2px solid #b9a448',
  },
  color_gray: {
    backgroundColor: '#787c7e',
    border: '2px solid #686c6e',
  }
});

export default App;

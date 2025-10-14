import { useState, useEffect } from 'react';
import InputForm from './InputForm';
import { createUseStyles } from 'react-jss';
import bsod from './assets/bsod.png';
import githubLogo from './assets/github-logo.svg';
import versionInfo from './version.json';

// Get static version info from build time
const getAppVersion = () => {
  const date = new Date(versionInfo.buildTime);
  const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  return `v${versionInfo.version} (${versionInfo.commit}) ${formattedDate}`;
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
    gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
  },
  sunset: {
    name: '🌅 Sunset Orange',
    gradient: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)'
  },
  forest: {
    name: '🌲 Forest Green',
    gradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)'
  },
  caruba: {
    name: '🌴 Jamaican Jungle',
    gradient: 'linear-gradient(135deg, #6aaa64 0%, #c9b458 100%)'
  },
  midnight: {
    name: '🌙 Midnight Blue',
    gradient: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
  },
  aurora: {
    name: '✨ Aurora',
    gradient: 'linear-gradient(135deg, #2f6f78 0%, #4f4d77 40%, #736070 100%)'
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
  
  // Dark mode state with cookie persistence
  const [darkMode, setDarkMode] = useState(() => getCookie('dark-mode') === 'true');

  // Save theme preference to cookies
  useEffect(() => {
    setCookie('background-theme', selectedTheme);
  }, [selectedTheme]);

  // Save custom colors to cookies
  useEffect(() => {
    setCookie('custom-background-colors', JSON.stringify(customColors));
  }, [customColors]);
  
  // Save dark mode preference to cookies
  useEffect(() => {
    setCookie('dark-mode', darkMode.toString());
    // Apply dark mode class to document root for global styling
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [darkMode]);

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
  const [playIntro, setPlayIntro] = useState(true);
  const appVersion = getAppVersion();
  const classNames = ["green", "yellow"];

  // Stable color assignment - only calculated once
  const [stableColors] = useState(() => 
    wordle.split('').map(() => classNames[Math.floor(Math.random() * classNames.length)])
  );

  useEffect(() => {
    if (!playIntro) return undefined;
    const totalDuration = wordle.length * 300 + 600; // 300ms per letter, 600ms buffer
    const timeout = setTimeout(() => setPlayIntro(false), totalDuration);
    return () => clearTimeout(timeout);
  }, [playIntro, wordle.length]);

  const wordleSpans = wordle.split('').map((char, index) => {
    const colorKey = stableColors[index];
    const colorClass = classes[`color_${colorKey}`];
    const spanClasses = [classes.char, colorClass];

    if (playIntro) {
      spanClasses.push(classes.charIntro);
    }

    return (
      <span
        key={index}
        className={spanClasses.join(' ')}
        style={playIntro ? { animationDelay: `${index * 0.3}s` } : undefined} // Middle ground: 0.3s
      >
        <span className={classes.charFaceFront}>{char}</span>
        <span className={classes.charFaceBack} aria-hidden="true" />
      </span>
    );
  });

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
        <div className={classes.header}>
          <span className={classes.versionInfo}>Build: {appVersion}</span>
          <a href="https://github.com/Jakeclearwater/wordleleaderboard" target="_blank" rel="noopener noreferrer" className={classes.githubLink}>
            <img src={githubLogo} alt="GitHub" className={classes.githubLogo} />
          </a>
        </div>
        <h1 className={classes.title}>{wordleSpans}</h1>
        <InputForm 
          backgroundThemes={backgroundThemes}
          selectedTheme={selectedTheme}
          setSelectedTheme={setSelectedTheme}
          customColors={customColors}
          setCustomColors={setCustomColors}
          getCurrentGradient={getCurrentGradient}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
        <footer className={classes.footer}>
          <p>Made with 💚 for Wordle enthusiasts · <span className={classes.spanicon} onClick={hack}>Don&apos;t break this!</span></p>
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
    color: 'white',
    fontSize: '0.8rem',
    fontFamily: 'monospace',
  },
  githubLink: {
    color: 'white',
    marginLeft: '1rem',
    '&:hover': {
      opacity: 0.8,
    },
  },
  githubLogo: {
    width: '20px',
    height: '20px',
    opacity: 0.8,
  },
  header: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: '3.8rem',
    fontWeight: '900',
    letterSpacing: '-0.02em',
    margin: '4rem 0 -1rem 0',
    padding: '0.5rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    '@media (max-width: 768px)': {
      fontSize: '2.4rem',
      margin: '3.2rem 0 -1rem 0',
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
    color: 'white',
    fontWeight: '800',
    fontSize: '1.4rem',
    boxSizing: 'border-box',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
    transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.3s ease',
    border: 'none',
    perspective: '900px',
    position: 'relative',
    overflow: 'visible',
    transformStyle: 'preserve-3d',
    willChange: 'transform',
    transform: 'rotateY(0deg)',
    backgroundColor: 'var(--tile-bg, #6aaa64)',
    '@media (max-width: 768px)': {
      padding: '0.6rem 0.8rem',
      minWidth: '2.8rem',
      height: '2.8rem',
      fontSize: '1.1rem',
      margin: '0.1rem',
    },
    '&:hover': {
      transform: 'rotateY(180deg) scale(1.04)',
      boxShadow: '0 14px 28px rgba(15, 23, 42, 0.32)',
    },
  },
  charIntro: {
    animationName: '$revealChar',
    animationDuration: '0.4s',
    animationFillMode: 'both',
    animationTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
  },
  charFaceFront: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'inherit',
    background: 'inherit',
    color: 'inherit',
    backfaceVisibility: 'hidden',
    transform: 'rotateY(0deg)',
    pointerEvents: 'none',
  },
  charFaceBack: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'inherit',
    background: '#787c7e',
    color: '#f4f5f7',
    backfaceVisibility: 'hidden',
    transform: 'rotateY(180deg)',
    pointerEvents: 'none',
  },
  color_green: {
    '--tile-bg': '#6aaa64',
    backgroundColor: 'var(--tile-bg)',
    border: 'none',
  },
  color_yellow: {
    '--tile-bg': '#c9b458',
    backgroundColor: 'var(--tile-bg)',
    border: 'none',
  },
  color_gray: {
    '--tile-bg': '#787c7e',
    backgroundColor: 'var(--tile-bg)',
    border: 'none',
  },
  '@keyframes revealChar': {
    '0%': {
      transform: 'rotateY(0deg)',
      backgroundColor: '#787c7e',
      color: '#d7dadc',
    },
    '45%': {
      transform: 'rotateY(90deg)',
      backgroundColor: '#787c7e',
      color: '#d7dadc',
    },
    '100%': {
      transform: 'rotateY(0deg)',
      backgroundColor: 'var(--tile-bg, #6aaa64)',
      color: 'white',
    },
  },
});

export default App;

import React, { useState, useEffect } from 'react';
import InputForm from './InputForm';
import Leaderboard from './Leaderboard';
import BayesianChart from './BayesianChart';
import { createUseStyles } from 'react-jss';
import bsod from './assets/bsod.png';

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
  const classes = useStyles();
  const [playerName, setPlayerName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [tempName, setTempName] = useState('');
  
  const wordle = "ITWORDLE";
  const appVersion = getBuildDateVersion();
  const classNames = ["green", "yellow", "gray"];

  // Check for existing name on component mount
  useEffect(() => {
    const savedName = getCookie('wordlePlayerName');
    if (savedName && savedName.trim()) {
      setPlayerName(savedName);
      setIsNameSet(true);
    }
  }, []);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    const trimmedName = tempName.trim();
    if (trimmedName && trimmedName.length >= 2 && trimmedName.length <= 20 && /^[a-zA-Z ]+$/.test(trimmedName)) {
      setPlayerName(trimmedName);
      setCookie('wordlePlayerName', trimmedName);
      setIsNameSet(true);
    }
  };

  const handleNameChange = () => {
    setIsNameSet(false);
    setTempName(playerName);
  };

  const wordleSpans = wordle.split('').map((char, index) => (
    <span key={index}
      className={classes.char + ' ' + classes['color_' + classNames[Math.floor(Math.random() * classNames.length)]]}
    >{char}</span>
  ));

  const hack = () => {
    console.log("oops");
    document.getElementById('backgroundOverlay').style.backgroundImage = `url('${bsod}')`;
    document.getElementById('backgroundOverlay').style.backgroundSize = 'cover';
    document.getElementById('backgroundOverlay').style.backgroundRepeat = 'no-repeat';
    document.getElementById('backgroundOverlay').style.backgroundPosition = 'center';
    document.getElementById('backgroundOverlay').style.backgroundColor = 'transparent';
  };

  // If name is not set, show the name entry screen
  if (!isNameSet) {
    return (
      <div className={classes.App}>
        <div className={classes.nameGate}>
          <div className={classes.nameGateContent}>
            <div className={classes.logoContainer}>
              <h1 className={classes.logo}>{wordleSpans}</h1>
              <div className={classes.subtitle}>Leaderboard</div>
            </div>
            
            <div className={classes.welcomeText}>
              <h2>Welcome to the Wordle Leaderboard!</h2>
              <p>Please enter your name to continue</p>
            </div>

            <form onSubmit={handleNameSubmit} className={classes.nameForm}>
              <input
                type="text"
                value={tempName}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[a-zA-Z ]{0,20}$/.test(value)) {
                    setTempName(value);
                  }
                }}
                placeholder="Enter your name"
                className={classes.nameInput}
                autoFocus
                required
              />
              <button 
                type="submit" 
                className={classes.nameSubmitButton}
                disabled={!tempName.trim() || tempName.trim().length < 2}
              >
                Enter Leaderboard
              </button>
            </form>
            
            <p className={classes.nameHint}>
              Your name will be saved and used for all future score submissions
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.App}>
      <div id="backgroundOverlay" className={classes.overlay}></div>
      
      {/* Hero Section */}
      <header className={classes.hero}>
        <div className={classes.heroContent}>
          <div className={classes.versionBadge}>v{appVersion}</div>
          <div className={classes.logoContainer}>
            <h1 className={classes.logo}>{wordleSpans}</h1>
            <div className={classes.subtitle}>Leaderboard</div>
          </div>
          <p className={classes.tagline}>Track your Wordle progress and compete with friends</p>
          <div className={classes.playerWelcome}>
            Welcome back, <strong>{playerName}</strong>!
            <button onClick={handleNameChange} className={classes.changeNameButton}>
              Change Name
            </button>
          </div>
        </div>
        <div className={classes.heroDecoration}></div>
      </header>

      {/* Main Content */}
      <main className={classes.main}>
        <div className={classes.container}>
          <section className={classes.formSection}>
            <InputForm playerName={playerName} />
          </section>
          
          <section className={classes.leaderboardSection}>
            <Leaderboard />
          </section>
          
          <section className={classes.chartSection}>
            <BayesianChart />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className={classes.footer}>
        <div className={classes.container}>
          <p className={classes.footerText}>
            Made with 💚 for Wordle enthusiasts · 
            <span className={classes.hackSpan} onClick={hack}> Don't break this!</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

const useStyles = createUseStyles({
  App: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8f7ff 0%, #f0efff 50%, #ede9ff 100%)', // Very light purple gradient
    position: 'relative',
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

  hero: {
    position: 'relative',
    background: 'var(--gradient-hero)',
    color: 'white',
    padding: 'var(--space-16) var(--space-4) var(--space-12)',
    textAlign: 'center',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%)',
      pointerEvents: 'none',
    }
  },

  heroContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '800px',
    margin: '0 auto',
    animation: 'fade-in 0.8s ease-out',
  },

  heroDecoration: {
    position: 'absolute',
    top: '-50%',
    right: '-20%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },

  versionBadge: {
    display: 'inline-block',
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-2) var(--space-4)',
    fontSize: '0.75rem',
    fontWeight: '500',
    letterSpacing: '0.05em',
    marginBottom: 'var(--space-6)',
    textTransform: 'uppercase',
  },

  logoContainer: {
    marginBottom: 'var(--space-6)',
  },

  logo: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 'var(--space-2)',
    margin: '0 0 var(--space-3) 0',
    fontSize: 'clamp(2.5rem, 8vw, 4rem)',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    flexWrap: 'wrap',
  },

  subtitle: {
    fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
    fontWeight: '600',
    opacity: 0.9,
    letterSpacing: '0.02em',
  },

  tagline: {
    fontSize: 'clamp(1rem, 3vw, 1.2rem)',
    opacity: 0.8,
    fontWeight: '400',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6',
  },

  char: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'clamp(2.5rem, 8vw, 4rem)',
    height: 'clamp(2.5rem, 8vw, 4rem)',
    margin: 'var(--space-1)',
    borderRadius: 'var(--radius-md)',
    color: 'white',
    fontWeight: '800',
    fontSize: 'clamp(1.2rem, 4vw, 2rem)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    transform: 'translateY(0)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px) scale(1.05)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
    }
  },

  color_green: {
    background: 'linear-gradient(135deg, #6aaa64 0%, #5a9954 100%)',
  },
  
  color_yellow: {
    background: 'linear-gradient(135deg, #c9b458 0%, #b8a347 100%)',
  },
  
  color_gray: {
    background: 'linear-gradient(135deg, #787c7e 0%, #686c6e 100%)',
  },

  main: {
    flex: 1,
    padding: 'var(--space-8) 0',
  },

  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 var(--space-4)',
  },

  formSection: {
    marginBottom: 'var(--space-16)',
    animation: 'slide-up 0.8s ease-out 0.2s both',
  },

  leaderboardSection: {
    marginBottom: 'var(--space-16)',
    animation: 'slide-up 0.8s ease-out 0.4s both',
  },

  chartSection: {
    marginBottom: 'var(--space-8)',
    animation: 'slide-up 0.8s ease-out 0.6s both',
  },

  footer: {
    background: 'var(--secondary-bg)',
    borderTop: '1px solid var(--border-light)',
    padding: 'var(--space-8) 0',
    textAlign: 'center',
  },

  footerText: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    margin: 0,
  },

  hackSpan: {
    color: 'var(--wordle-green)',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'color 0.2s ease',
    '&:hover': {
      color: 'var(--wordle-dark-gray)',
      textDecoration: 'underline',
    },
  },

  nameGate: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--space-4)',
    background: 'linear-gradient(135deg, #f8f7ff 0%, #f0efff 50%, #ede9ff 100%)',
  },
  
  nameGateContent: {
    textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    borderRadius: 'var(--radius-2xl)',
    padding: 'var(--space-12) var(--space-8)',
    boxShadow: '0 20px 40px rgba(106, 170, 100, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    maxWidth: '500px',
    width: '100%',
  },
  
  welcomeText: {
    marginBottom: 'var(--space-8)',
    '& h2': {
      fontSize: '1.8rem',
      fontWeight: '700',
      color: 'var(--text-primary)',
      margin: '0 0 var(--space-3) 0',
      letterSpacing: '-0.01em',
    },
    '& p': {
      fontSize: '1.1rem',
      color: 'var(--text-secondary)',
      margin: 0,
    },
  },
  
  nameForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
    marginBottom: 'var(--space-6)',
  },
  
  nameInput: {
    padding: 'var(--space-4) var(--space-5)',
    borderRadius: 'var(--radius-lg)',
    border: '2px solid var(--border-light)',
    fontSize: '1.1rem',
    fontWeight: '500',
    textAlign: 'center',
    background: '#fff',
    color: 'var(--text-primary)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:focus': {
      outline: 'none',
      borderColor: 'var(--wordle-green)',
      boxShadow: '0 0 0 3px rgba(106, 170, 100, 0.1)',
    },
    '&::placeholder': {
      color: 'var(--text-muted)',
    },
  },
  
  nameSubmitButton: {
    padding: 'var(--space-4) var(--space-6)',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
    background: 'linear-gradient(135deg, var(--wordle-green) 0%, #4a8a44 100%)',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: '600',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    letterSpacing: '-0.01em',
    boxShadow: '0 4px 16px rgba(106, 170, 100, 0.3)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(106, 170, 100, 0.4)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
    '&:disabled': {
      background: 'var(--border-light)',
      color: 'var(--text-muted)',
      cursor: 'not-allowed',
      boxShadow: 'none',
      transform: 'none',
    },
  },
  
  nameHint: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    margin: 0,
    fontStyle: 'italic',
  },
  
  playerWelcome: {
    marginTop: 'var(--space-4)',
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-3)',
    flexWrap: 'wrap',
  },
  
  changeNameButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-1) var(--space-3)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.3)',
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
  },

  // Responsive design
  '@media (max-width: 768px)': {
    hero: {
      padding: 'var(--space-12) var(--space-4) var(--space-8)',
    },
    main: {
      padding: 'var(--space-6) 0',
    },
    formSection: {
      marginBottom: 'var(--space-12)',
    },
    leaderboardSection: {
      marginBottom: 'var(--space-12)',
    },
    chartSection: {
      marginBottom: 'var(--space-6)',
    },
  }
});

export default App;

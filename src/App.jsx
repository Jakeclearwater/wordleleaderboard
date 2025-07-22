import React from 'react';
import InputForm from './InputForm';
import Leaderboard from './Leaderboard';
import BayesianChart from './BayesianChart';
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
    document.getElementById('backgroundOverlay').style.backgroundImage = `url('${bsod}')`;
    document.getElementById('backgroundOverlay').style.backgroundSize = 'cover';
    document.getElementById('backgroundOverlay').style.backgroundRepeat = 'no-repeat';
    document.getElementById('backgroundOverlay').style.backgroundPosition = 'center';
    document.getElementById('backgroundOverlay').style.backgroundColor = 'transparent';
  };

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
        </div>
        <div className={classes.heroDecoration}></div>
      </header>

      {/* Main Content */}
      <main className={classes.main}>
        <div className={classes.container}>
          <section className={classes.formSection}>
            <InputForm />
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
    background: 'var(--primary-bg)',
    position: 'relative',
    overflow: 'hidden',
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

import { useState, useEffect } from 'react';
import ShootingStars from './ShootingStars.jsx';
import InputForm from './InputForm';
import { createUseStyles } from 'react-jss';
import bsod from './assets/bsod.png';
import githubLogo from './assets/github-logo.svg';
import christmasHat from './assets/christmas-hat.png';
import versionInfo from './version.json';

// Festive decorations configuration
const festiveDecorations = [
  {
    id: 'christmas-hat',
    image: christmasHat,
    alt: 'Christmas Hat',
    startDate: { month: 12, day: 1 },  // December 1st
    endDate: { month: 12, day: 29 },   // December 29th
    style: {
      position: 'absolute',
      right: '-40px',
      top: '-40px',
      width: '120px',
      transform: 'rotate(15deg)',
    },
    mobileStyle: {
      width: '80px',
      right: '-80px',
      top: '-25px',
    }
  },
  // Future decorations can be added here:
  // {
  //   id: 'easter-egg',
  //   image: easterEgg,
  //   alt: 'Easter Egg',
  //   startDate: { month: 3, day: 15 },  // March 15th
  //   endDate: { month: 4, day: 15 },     // April 15th
  //   style: { ... },
  //   mobileStyle: { ... }
  // },
];

// Check if current date is within decoration's date range
const isDecorationActive = (decoration) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
  const currentDay = now.getDate();
  
  const { startDate, endDate } = decoration;
  
  // Handle same-month range
  if (startDate.month === endDate.month) {
    return currentMonth === startDate.month && 
           currentDay >= startDate.day && 
           currentDay <= endDate.day;
  }
  
  // Handle cross-month range (e.g., Dec 20 - Jan 5)
  if (startDate.month > endDate.month) {
    return (currentMonth === startDate.month && currentDay >= startDate.day) ||
           (currentMonth === endDate.month && currentDay <= endDate.day) ||
           (currentMonth > startDate.month || currentMonth < endDate.month);
  }
  
  // Handle normal cross-month range (e.g., March 15 - April 15)
  return (currentMonth === startDate.month && currentDay >= startDate.day) ||
         (currentMonth === endDate.month && currentDay <= endDate.day) ||
         (currentMonth > startDate.month && currentMonth < endDate.month);
};

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
    name: '💜 Violet Dreams',
    gradient: 'linear-gradient(135deg, #3a5870ff 20%, #764ba2 90%)'
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
    name: '🌈 Rainbow',
    gradient: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 25%, #48dbfb 50%, #1dd1a1 75%, #ee5a6f 100%)'
  },
  caruba: {
    name: '🌴 Jamaican Summer',
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
    name: '🌌 Space',
    gradient: 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%), linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    special: 'space'
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

  // List of dark themes that need light button gradients
  const darkThemes = ['monochrome', 'midnight'];
  
  // Get current gradient based on selected theme
  const getCurrentGradient = () => {
    if (selectedTheme === 'custom') {
      return `linear-gradient(135deg, ${customColors.color1} 0%, ${customColors.color2} 100%)`;
    }
    return backgroundThemes[selectedTheme]?.gradient || backgroundThemes.default.gradient;
  };

  // Get gradient for buttons/accents (light fallback for dark themes)
  const getAccentGradient = () => {
    if (darkThemes.includes(selectedTheme)) {
      // Use a bright, vibrant gradient for dark backgrounds
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
    return getCurrentGradient();
  };

  const getBackgroundStyle = () => {
    const currentTheme = backgroundThemes[selectedTheme];
    if (selectedTheme === 'monochrome' && currentTheme?.special === 'space') {
      return {
        background: 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)',
        minHeight: '100vh',
        width: '100%',
        margin: 0,
        padding: 0,
        position: 'relative'
      };
    }
    return {
      background: getCurrentGradient(),
      minHeight: '100vh',
      width: '100%',
      margin: 0,
      padding: 0
    };
  };

  const gradientStyle = getBackgroundStyle();
  const classes = useStyles();
  const wordle = "ITWORDLE";
  // Shooting stars now run in production mode (no debug artifacts)
  const [playIntro, setPlayIntro] = useState(true);
  const appVersion = getAppVersion();
  const classNames = ["green", "yellow"];

  // Generate random space elements on component mount
  const [spaceElements] = useState(() => {
    const generateRandomStars = (count, type) => {
      return Array.from({ length: count }, (_, i) => {
        const base = {
          id: i,
          top: Math.random() * 90 + 5, // 5% to 95%
          left: Math.random() * 90 + 5, // 5% to 95%
          animationDelay: type === 'distant' ? 0 : Math.random() * 4, // Distant stars stay fixed
        };

        if (type === 'distant') {
          return {
            ...base,
            size: Math.random() * 0.9 + 0.6,
            opacity: 0.24 + Math.random() * 0.25,
            blur: Math.random() * 0.6 + 0.2,
          };
        }

        if (type === 'small') {
          return {
            ...base,
            size: Math.random() * 2 + 1,
          };
        }

        if (type === 'bright') {
          return {
            ...base,
            size: Math.random() * 3 + 4,
          };
        }

        return {
          ...base,
          size: Math.random() * 2 + 3,
        };
      });
    };

    // Legacy shooting star generator removed. Shooting stars now handled exclusively
    // by the <ShootingStars /> component with a pooled rAF system.

    const generateNebulae = () => {
      const nebulaColors = [
        'radial-gradient(ellipse 60% 40% at 30% 30%, rgba(138,43,226,0.4) 0%, rgba(75,0,130,0.3) 40%, rgba(25,25,112,0.2) 70%, transparent 90%)', // Purple
        'radial-gradient(ellipse 50% 35% at 40% 20%, rgba(255,69,0,0.4) 0%, rgba(255,140,0,0.3) 40%, rgba(220,20,60,0.2) 70%, transparent 90%)', // Orange-Red
        'radial-gradient(ellipse 55% 45% at 25% 35%, rgba(0,191,255,0.4) 0%, rgba(30,144,255,0.3) 40%, rgba(0,0,139,0.2) 70%, transparent 90%)', // Blue
        'radial-gradient(ellipse 65% 30% at 35% 40%, rgba(50,205,50,0.4) 0%, rgba(34,139,34,0.3) 40%, rgba(0,100,0,0.2) 70%, transparent 90%)', // Green
        'radial-gradient(ellipse 45% 50% at 45% 25%, rgba(255,20,147,0.4) 0%, rgba(199,21,133,0.3) 40%, rgba(139,0,139,0.2) 70%, transparent 90%)', // Pink-Magenta
      ];
      
      return Array.from({ length: 4 }, (_, i) => ({
        id: i,
        top: Math.random() * 70 + 10, // 10% to 80%
        left: Math.random() * 70 + 10, // 10% to 80%
        width: Math.random() * 80 + 80, // 80px to 160px
        height: Math.random() * 60 + 60, // 60px to 120px
        rotation: Math.random() * 360, // 0 to 360 degrees
        animationDelay: Math.random() * 10, // 0-10s delay
        color: nebulaColors[Math.floor(Math.random() * nebulaColors.length)],
      }));
    };

    return {
      distantStars: generateRandomStars(60, 'distant'),
      regularStars: generateRandomStars(25, 'regular'),
      brightStars: generateRandomStars(8, 'bright'),
      smallStars: generateRandomStars(15, 'small'),
      nebulae: generateNebulae(),
    };
  });

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

    const handleMouseEnter = (e) => {
      if (playIntro) return; // Don't allow hover during intro
      
      // Clear any existing timeout
      if (e.target.hoverTimeout) {
        clearTimeout(e.target.hoverTimeout);
      }
      
      // Add hover effect with small delay to prevent jitter
      e.target.hoverTimeout = setTimeout(() => {
        e.target.style.transform = 'rotateX(180deg) scale(1.04)';
        e.target.style.boxShadow = '0 14px 28px rgba(15, 23, 42, 0.32)';
      }, 100); // 100ms delay
    };

    const handleMouseLeave = (e) => {
      // Clear any pending hover timeout
      if (e.target.hoverTimeout) {
        clearTimeout(e.target.hoverTimeout);
        e.target.hoverTimeout = null;
      }
      
      // Add small delay before removing hover to prevent flicker
      setTimeout(() => {
        e.target.style.transform = 'rotateX(0deg)';
        e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
      }, 50); // 50ms delay on exit
    };

    return (
      <span
        key={index}
        className={spanClasses.join(' ')}
        style={playIntro ? { animationDelay: `${index * 0.3}s` } : undefined}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span className={classes.charFaceFront}>{char}</span>
        <span className={classes.charFaceBack} aria-hidden="true" />
      </span>
    );
  });

  const hack = () => {
  // Placeholder: Background overlay mutation trigger
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
      {(() => {
        const isSpaceTheme = selectedTheme === 'monochrome' && backgroundThemes[selectedTheme]?.special === 'space';
        // Space theme active
        return isSpaceTheme;
      })() && (
        <div className={classes.starsOverlay}>
          {/* Distant Fixed Stars */}
          {spaceElements.distantStars.map(star => (
            <div
              key={`distant-${star.id}`}
              className={classes.distantStar}
              style={{
                top: `${star.top}%`,
                left: `${star.left}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                filter: `blur(${star.blur}px)`
              }}
            ></div>
          ))}

          {/* Regular Twinkling Stars */}
          {spaceElements.regularStars.map(star => (
            <div
              key={`star-${star.id}`}
              className={classes.star}
              style={{
                top: `${star.top}%`,
                left: `${star.left}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.animationDelay}s`
              }}
            ></div>
          ))}

          {/* Bright Stars */}
          {spaceElements.brightStars.map(star => (
            <div
              key={`bright-${star.id}`}
              className={classes.brightStar}
              style={{
                top: `${star.top}%`,
                left: `${star.left}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.animationDelay}s`
              }}
            ></div>
          ))}

          {/* Small Distant Stars */}
          {spaceElements.smallStars.map(star => (
            <div
              key={`small-${star.id}`}
              className={classes.smallStar}
              style={{
                top: `${star.top}%`,
                left: `${star.left}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.animationDelay}s`
              }}
            ></div>
          ))}

          {/* Randomized Nebulae */}
          {spaceElements.nebulae.map(nebula => (
            <div
              key={`nebula-${nebula.id}`}
              className={classes.nebula}
              style={{
                top: `${nebula.top}%`,
                left: `${nebula.left}%`,
                width: `${nebula.width}px`,
                height: `${nebula.height}px`,
                background: nebula.color,
                transform: `rotate(${nebula.rotation}deg)`,
                animationDelay: `${nebula.animationDelay}s`
              }}
            ></div>
          ))}

          {/* Shooting Stars */}
          <ShootingStars />
        </div>
      )}

      <div className={classes.container}>
        <div className={classes.header}>
          <span className={classes.versionInfo}>Build: {appVersion}</span>
          <a href="https://github.com/Jakeclearwater/wordleleaderboard" target="_blank" rel="noopener noreferrer" className={classes.githubLink}>
            <img src={githubLogo} alt="GitHub" className={classes.githubLogo} />
          </a>
        </div>
        <div className={classes.titleContainer}>
          <h1 className={classes.title}>{wordleSpans}</h1>
          {festiveDecorations
            .filter(decoration => isDecorationActive(decoration))
            .map(decoration => (
              <img 
                key={decoration.id}
                src={decoration.image} 
                alt={decoration.alt} 
                className={classes.festiveDecoration}
                style={decoration.style}
              />
            ))
          }
        </div>
        <InputForm 
          backgroundThemes={backgroundThemes}
          selectedTheme={selectedTheme}
          setSelectedTheme={setSelectedTheme}
          customColors={customColors}
          setCustomColors={setCustomColors}
          getCurrentGradient={getCurrentGradient}
          getAccentGradient={getAccentGradient}
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
    zIndex: 0, // Behind everything - just for special background images
    pointerEvents: 'none',
  },
  starsOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: 1,
  },
  distantStar: {
    position: 'absolute',
    width: '1.2px',
    height: '1.2px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 60%, transparent 100%)',
    pointerEvents: 'none',
    mixBlendMode: 'screen',
  },
  shootingStar1: {
    position: 'fixed',
    top: '15%',
    left: '-10%',
    fontSize: '24px',
    animation: 'shootingStar1 8s linear infinite',
    zIndex: 2,
    pointerEvents: 'none',
    filter: 'drop-shadow(-15px 0 8px rgba(255,255,255,0.6)) drop-shadow(-30px 0 15px rgba(255,255,255,0.3))',
    transform: 'rotate(45deg)',
  },
  shootingStar2: {
    position: 'fixed',
    top: '35%',
    left: '-10%',
    fontSize: '20px',
    animation: 'shootingStar2 12s linear infinite 3s',
    zIndex: 2,
    pointerEvents: 'none',
    filter: 'drop-shadow(-12px 0 6px rgba(255,255,255,0.5)) drop-shadow(-24px 0 12px rgba(255,255,255,0.2))',
    transform: 'rotate(45deg)',
  },
  shootingStar3: {
    position: 'fixed',
    top: '65%',
    left: '-10%',
    fontSize: '22px',
    animation: 'shootingStar3 10s linear infinite 6s',
    zIndex: 2,
    pointerEvents: 'none',
    filter: 'drop-shadow(-18px 0 10px rgba(255,255,255,0.7)) drop-shadow(-36px 0 18px rgba(255,255,255,0.4))',
    transform: 'rotate(45deg)',
  },
  star: {
    position: 'absolute',
    width: '4px',
    height: '4px',
    background: 'radial-gradient(circle, #ffffff 0%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.3) 80%, transparent 100%)',
    borderRadius: '50%',
    animation: 'twinkle 3s ease-in-out infinite',
    pointerEvents: 'none',
    boxShadow: '0 0 8px rgba(255,255,255,1), 0 0 16px rgba(255,255,255,0.8), 0 0 32px rgba(255,255,255,0.6), 0 0 48px rgba(255,255,255,0.3)',
    filter: 'blur(0.5px) brightness(1.2)',
  },
  brightStar: {
    position: 'absolute',
    width: '6px',
    height: '6px',
    background: 'radial-gradient(circle, #ffff99 0%, rgba(255,255,153,1) 40%, rgba(255,255,153,0.7) 70%, transparent 100%)',
    borderRadius: '50%',
    pointerEvents: 'none',
    boxShadow: '0 0 12px rgba(255,255,153,1), 0 0 24px rgba(255,255,153,0.9), 0 0 48px rgba(255,255,153,0.7), 0 0 72px rgba(255,255,153,0.4)',
    animation: 'pulse 4s ease-in-out infinite',
    filter: 'blur(0.3px) brightness(1.3)',
  },
  smallStar: {
    position: 'absolute',
    width: '2px',
    height: '2px',
    background: 'radial-gradient(circle, #f0f0f0 0%, rgba(240,240,240,0.8) 60%, rgba(224,224,224,0.4) 85%, transparent 100%)',
    borderRadius: '50%',
    animation: 'twinkle 2s ease-in-out infinite',
    pointerEvents: 'none',
    boxShadow: '0 0 6px rgba(240,240,240,0.9), 0 0 12px rgba(240,240,240,0.6), 0 0 24px rgba(240,240,240,0.3)',
    filter: 'blur(0.2px) brightness(1.1)',
  },
  nebula: {
    position: 'absolute',
    borderRadius: '60%',
    pointerEvents: 'none',
    animation: 'float 12s ease-in-out infinite',
    filter: 'blur(8px) drop-shadow(0 0 60px rgba(120, 150, 255, 0.28)) drop-shadow(0 0 120px rgba(90, 110, 200, 0.18))',
    zIndex: 0,
    opacity: 0.8,
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '320%',
      height: '320%',
      transform: 'translate(-50%, -50%)',
      borderRadius: '60%',
      background: 'radial-gradient(circle, rgba(160, 190, 255, 0.22) 0%, rgba(110, 140, 220, 0.16) 38%, rgba(70, 90, 180, 0.08) 60%, transparent 80%)',
      filter: 'blur(24px)',
      opacity: 0.55,
      mixBlendMode: 'screen',
      pointerEvents: 'none',
    },
  },
  dynamicShootingStar: {
    position: 'fixed',
    width: '4px',
    height: '4px',
    background: 'radial-gradient(circle, #ffffff 0%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.3) 80%, transparent 100%)',
    borderRadius: '50%',
    zIndex: 10, // Above nebulae and stars
    pointerEvents: 'none',
    willChange: 'transform, opacity',
    // Add motion blur trail effect
    boxShadow: '0 0 8px rgba(255,255,255,1), 0 0 16px rgba(255,255,255,0.8), 0 0 32px rgba(255,255,255,0.6)',
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
  titleContainer: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '4rem 0 -1rem 0',
    '@media (max-width: 768px)': {
      margin: '3.2rem 0 -1rem 0',
    },
  },
  title: {
    color: 'white',
    fontSize: '3.8rem',
    fontWeight: '900',
    letterSpacing: '-0.02em',
    margin: 0,
    padding: '0.5rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
    zIndex: 10,
    '@media (max-width: 768px)': {
      fontSize: '2.4rem',
    },
  },
  festiveDecoration: {
    height: 'auto',
    zIndex: 11,
    pointerEvents: 'none',
    '@media (max-width: 768px)': {
      // Mobile-specific styles are applied inline from config
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
    transformOrigin: 'center center',
    willChange: 'transform',
    transform: 'rotateX(0deg)',
    backgroundColor: 'var(--tile-bg, #6aaa64)',
    '@media (max-width: 768px)': {
      padding: '0.6rem 0.8rem',
      minWidth: '2.8rem',
      height: '2.8rem',
      fontSize: '1.1rem',
      margin: '0.1rem',
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
    transform: 'rotateX(0deg)',
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
    transform: 'rotateX(180deg)',
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
      transform: 'rotateX(0deg)',
      backgroundColor: '#787c7e',
      color: '#d7dadc',
    },
    '45%': {
      transform: 'rotateX(90deg)',
      backgroundColor: '#787c7e',
      color: '#d7dadc',
    },
    '100%': {
      transform: 'rotateX(0deg)',
      backgroundColor: 'var(--tile-bg, #6aaa64)',
      color: 'white',
    },
  },

  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
      opacity: 0.8,
    },
    '50%': {
      transform: 'scale(1.2)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(1)',
      opacity: 0.8,
    },
  },
  '@keyframes float': {
    '0%': {
      transform: 'translateY(0px) rotate(0deg)',
      opacity: 0.6,
    },
    '33%': {
      transform: 'translateY(-10px) rotate(120deg)',
      opacity: 0.8,
    },
    '66%': {
      transform: 'translateY(5px) rotate(240deg)',
      opacity: 0.7,
    },
    '100%': {
      transform: 'translateY(0px) rotate(360deg)',
      opacity: 0.6,
    },
  },
  '@keyframes shootingStar': {
    '0%': {
      opacity: 0,
      transform: 'translate(0, 0) scale(0.8)',
    },
    '10%': {
      opacity: 1,
      transform: 'translate(0, 0) scale(1)',
    },
    '90%': {
      opacity: 1,
      transform: 'translate(var(--end-x, 100vw), var(--end-y, 100vh)) scale(1)',
    },
    '100%': {
      opacity: 0,
      transform: 'translate(var(--end-x, 100vw), var(--end-y, 100vh)) scale(0.5)',
    },
  },
});

export default App;

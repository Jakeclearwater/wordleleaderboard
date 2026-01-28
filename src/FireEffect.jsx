import { createUseStyles } from 'react-jss';
import glitterTexture from './assets/silver-glitter-background.png';

const useStyles = createUseStyles({
  '@keyframes fire': {
    '0%': {
      backgroundPosition: 'center 0px, center 0px, 50% 100%, center center',
    },
    '100%': {
      backgroundPosition: 'center -200vh, center -240vh, 50% 100%, center center',
    },
  },
  '@keyframes spark': {
    '0%': {
      transform: 'translateY(0) translateX(0) scale(1)',
      opacity: 1,
    },
    '100%': {
      transform: 'translateY(-100vh) translateX(var(--drift)) scale(0.3)',
      opacity: 0,
    },
  },
  '@keyframes ash': {
    '0%': {
      transform: 'translateY(0) translateX(0) rotate(0deg)',
      opacity: 0.7,
    },
    '100%': {
      transform: 'translateY(-100vh) translateX(var(--drift)) rotate(360deg)',
      opacity: 0,
    },
  },
  container: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: 0,
    overflow: 'hidden',
  },
  fire: {
    width: '100%',
    height: '100%',
    position: 'relative',
    '&::before, &::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
    },
    '&::before': {
      backgroundImage: `
        url(${glitterTexture}),
        url(${glitterTexture}),
        linear-gradient(0deg, white 0px, #ff8951 2%, #dcbc169c 15%, transparent 95%),
        radial-gradient(ellipse 60% 200% at 50% 100%, transparent 50%, black 90%)
      `,
      backgroundSize: '350px 200vh, 400px 240vh, 100% 100%, 100% 100%',
      backgroundBlendMode: 'hard-light, color-dodge, multiply',
      backgroundPosition: '0px 0px, 0px 0px, 50% 100%, center center',
      backgroundRepeat: 'repeat, repeat, repeat, no-repeat',
      mixBlendMode: 'color-dodge',
      filter: 'brightness(3.7) blur(7px) contrast(6)',
      animation: '$fire 3.5s linear infinite',
      boxShadow: 'inset 0 -40px 50px -60px #63bbc5',
    },
  },
  particlesContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  spark: {
    position: 'absolute',
    bottom: '60%',
    width: 3,
    height: 3,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(255, 200, 100, 1) 40%, rgba(255, 100, 0, 0.8) 100%)',
    boxShadow: '0 0 10px rgba(255, 150, 50, 0.8)',
    animation: '$spark linear infinite',
    '--drift': 'var(--spark-drift)',
  },
  ash: {
    position: 'absolute',
    bottom: '50%',
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: 'rgba(150, 150, 150, 0.6)',
    animation: '$ash linear infinite',
    '--drift': 'var(--ash-drift)',
  },
});

export default function FireEffect() {
  const classes = useStyles();

  // Generate sparks
  const sparks = Array.from({ length: 30 }, (_, i) => ({
    id: `spark-${i}`,
    left: `${10 + Math.random() * 80}%`,
    duration: 2 + Math.random() * 3,
    delay: Math.random() * 5,
    drift: `${(Math.random() - 0.5) * 100}px`,
  }));

  // Generate ash particles
  const ashParticles = Array.from({ length: 40 }, (_, i) => ({
    id: `ash-${i}`,
    left: `${5 + Math.random() * 90}%`,
    duration: 3 + Math.random() * 4,
    delay: Math.random() * 6,
    drift: `${(Math.random() - 0.5) * 150}px`,
  }));

  return (
    <div className={classes.container}>
      <div className={classes.fire} />
      <div className={classes.particlesContainer}>
        {sparks.map((spark) => (
          <div
            key={spark.id}
            className={classes.spark}
            style={{
              left: spark.left,
              animationDuration: `${spark.duration}s`,
              animationDelay: `${spark.delay}s`,
              '--spark-drift': spark.drift,
            }}
          />
        ))}
        {ashParticles.map((ash) => (
          <div
            key={ash.id}
            className={classes.ash}
            style={{
              left: ash.left,
              animationDuration: `${ash.duration}s`,
              animationDelay: `${ash.delay}s`,
              '--ash-drift': ash.drift,
            }}
          />
        ))}
      </div>
    </div>
  );
}

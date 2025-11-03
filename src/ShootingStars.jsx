import { useRef, useEffect, useCallback } from 'react';
import { createUseStyles } from 'react-jss';

// Pooled, requestAnimationFrame-based shooting stars to replace CSS keyframes.
// This avoids issues with transform composition and makes debugging easier.

const useStyles = createUseStyles({
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: 10,
    overflow: 'hidden'
  },
  star: {
    position: 'absolute',
    borderRadius: '50%',
    willChange: 'transform, opacity',
  }
});

const randomBetween = (min, max) => Math.random() * (max - min) + min;

function makeStar() {
  const side = Math.floor(Math.random() * 4); // 0 top,1 right,2 bottom,3 left
  let startX, startY, endX, endY;
  switch (side) {
    case 0: // top
      startY = -5; startX = randomBetween(0,100); endY = 105 + randomBetween(0,10); endX = startX + randomBetween(-30,30); break;
    case 1: // right
      startX = 105; startY = randomBetween(0,100); endX = -5 - randomBetween(0,10); endY = startY + randomBetween(-30,30); break;
    case 2: // bottom
      startY = 105; startX = randomBetween(0,100); endY = -5 - randomBetween(0,10); endX = startX + randomBetween(-30,30); break;
    case 3: // left
      startX = -5; startY = randomBetween(0,100); endX = 105 + randomBetween(0,10); endY = startY + randomBetween(-30,30); break;
    default:
      startX = -5; startY = 50; endX = 110; endY = 55; break;
  }
  // Make stars less frequent and longer-lived to reduce overall activity
  const duration = randomBetween(2200, 4200); // ms (slower travel)
  const delay = randomBetween(2000, 8000); // ms (less frequent)
  const size = randomBetween(3,5);
  return {
    startX, startY, endX, endY, duration, delay, size,
    // add a tiny jitter so recycled stars don't line up exactly
    startTime: performance.now() + delay + randomBetween(-150, 150),
    brightness: randomBetween(1.0,1.35)
  };
}

export default function ShootingStars({ count = 4 }) {
  const classes = useStyles();
  const containerRef = useRef();
  const starsRef = useRef([]);
  const elementsRef = useRef([]);
  const frameRef = useRef();

  // Initialize pool
  useEffect(() => {
  starsRef.current = Array.from({ length: count }, () => makeStar());
    // Create DOM nodes
    const nodes = starsRef.current.map((star) => {
      const el = document.createElement('div');
      el.className = classes.star;
      el.style.width = `${star.size}px`;
      el.style.height = `${star.size}px`;
      el.style.background = 'radial-gradient(circle, #ffffff 0%, rgba(255,255,255,0.85) 60%, rgba(255,255,255,0.25) 80%, transparent 100%)';
      el.style.filter = `brightness(${star.brightness}) blur(0.4px)`;
      el.style.boxShadow = `0 0 ${star.size*2}px rgba(255,255,255,0.85), 0 0 ${star.size*4}px rgba(255,255,255,0.55)`;
      containerRef.current.appendChild(el);
      return el;
    });
    elementsRef.current = nodes;
  }, [classes.star, count]);

  const recycleStar = useCallback((idx) => {
    const newStar = makeStar();
    starsRef.current[idx] = newStar;
    const el = elementsRef.current[idx];
    if (el) {
      el.style.width = `${newStar.size}px`;
      el.style.height = `${newStar.size}px`;
      el.style.filter = `brightness(${newStar.brightness}) blur(0.4px)`;
      el.style.boxShadow = `0 0 ${newStar.size*2}px rgba(255,255,255,0.85), 0 0 ${newStar.size*4}px rgba(255,255,255,0.55)`;
    }
  }, []);

  // Animation loop
  useEffect(() => {
    function animate(ts) {
      starsRef.current.forEach((star, i) => {
        const { startTime, duration, startX, startY, endX, endY } = star;
        const el = elementsRef.current[i];
        if (!el) return;
        const elapsed = ts - startTime;
        if (elapsed < 0) {
          // Not started yet
          el.style.opacity = '0';
          return;
        }
        const pct = Math.min(elapsed / duration, 1);
        const curX = startX + (endX - startX) * pct;
        const curY = startY + (endY - startY) * pct;
        el.style.transform = `translate(${curX}vw, ${curY}vh)`;
        // Opacity ramp in/out
        const fadeIn = Math.min(pct * 5, 1);
        const fadeOut = 1 - Math.max((pct - 0.8) * 5, 0);
        el.style.opacity = String(fadeIn * fadeOut);
        if (pct >= 1) recycleStar(i);
      });
      frameRef.current = requestAnimationFrame(animate);
    }
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [recycleStar]);

  return <div ref={containerRef} className={classes.container}></div>;
}

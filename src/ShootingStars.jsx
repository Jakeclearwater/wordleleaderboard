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
    transformOrigin: 'center left', // Rotation pivot at the head of the star
  }
});

const randomBetween = (min, max) => Math.random() * (max - min) + min;

// Color palette for shooting stars
const pickRandomColor = () => {
  const colors = [
    { r: 144, g: 238, b: 144 }, // Light green
    { r: 34, g: 139, b: 34 },   // Forest green
    { r: 255, g: 255, b: 102 }, // Light yellow
    { r: 255, g: 215, b: 0 },   // Gold
    { r: 186, g: 85, b: 211 },  // Medium orchid
    { r: 147, g: 112, b: 219 }, // Medium purple
    { r: 138, g: 43, b: 226 },  // Blue violet
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

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
  
  // Calculate angle for tail alignment
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  
  // Make stars less frequent and longer-lived to reduce overall activity
  const duration = randomBetween(2200, 4200); // ms (slower travel)
  const delay = randomBetween(2000, 8000); // ms (less frequent)
  const size = randomBetween(3,5);
  const tailLength = randomBetween(40, 80); // px - length of the trailing tail
  const color = pickRandomColor();
  
  return {
    startX, startY, endX, endY, duration, delay, size, tailLength, angle, color,
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
    // Create DOM nodes with tails
    const nodes = starsRef.current.map((star) => {
      const el = document.createElement('div');
      el.className = classes.star;
      // Elongated shape: tail extends in the direction opposite to motion
      el.style.width = `${star.tailLength}px`;
      el.style.height = `${star.size}px`;
      el.style.borderRadius = `${star.size/2}px`;
      // Linear gradient from bright colored head to transparent tail
      const { r, g, b } = star.color;
      el.style.background = `linear-gradient(to left, 
        rgba(${r},${g},${b},0.95) 0%, 
        rgba(${r},${g},${b},0.85) 10%, 
        rgba(${r},${g},${b},0.5) 30%, 
        rgba(${r},${g},${b},0.2) 60%, 
        transparent 100%)`;
      el.style.filter = `brightness(${star.brightness}) blur(0.5px)`;
      el.style.boxShadow = `0 0 ${star.size*3}px rgba(${r},${g},${b},0.7), 0 0 ${star.size*6}px rgba(${r},${g},${b},0.4)`;
      // Initialize at starting position with rotation, but invisible until animation starts
      el.style.transform = `translate(${star.startX}vw, ${star.startY}vh) rotate(${star.angle}deg)`;
      el.style.opacity = '0';
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
      const { r, g, b } = newStar.color;
      el.style.width = `${newStar.tailLength}px`;
      el.style.height = `${newStar.size}px`;
      el.style.borderRadius = `${newStar.size/2}px`;
      el.style.background = `linear-gradient(to left, 
        rgba(${r},${g},${b},0.95) 0%, 
        rgba(${r},${g},${b},0.85) 10%, 
        rgba(${r},${g},${b},0.5) 30%, 
        rgba(${r},${g},${b},0.2) 60%, 
        transparent 100%)`;
      el.style.filter = `brightness(${newStar.brightness}) blur(0.5px)`;
      el.style.boxShadow = `0 0 ${newStar.size*3}px rgba(${r},${g},${b},0.7), 0 0 ${newStar.size*6}px rgba(${r},${g},${b},0.4)`;
    }
  }, []);

  // Animation loop
  useEffect(() => {
    function animate(ts) {
      starsRef.current.forEach((star, i) => {
        const { startTime, duration, startX, startY, endX, endY, angle } = star;
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
        // Transform includes both translation and rotation for the tail
        el.style.transform = `translate(${curX}vw, ${curY}vh) rotate(${angle}deg)`;
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

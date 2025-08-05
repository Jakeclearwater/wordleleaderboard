import React from "react";
// Inject confetti styles and keyframes directly for component encapsulation
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (!document.head.querySelector('style[data-confetti-styles]')) {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      .confetti {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 9999;
        overflow: hidden;
      }
      .confetti-piece {
        position: absolute;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background-color: #FFD700;
        box-shadow: 0 0 24px 8px rgba(0,0,0,0.12);
        animation: confettiBurst 2.5s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        will-change: transform, opacity;
      }
      @keyframes confettiBurst {
        0% {
          transform: translate(-50%, -50%) scale(0.2) rotateZ(0deg);
          opacity: 1;
          filter: blur(0px);
        }
        10% {
          transform: translate(-50%, -50%) scale(1.2) rotateZ(90deg);
          opacity: 1;
          filter: blur(0px);
        }
        80% {
          filter: blur(0px);
        }
        100% {
          transform: translate(calc(-50% + var(--end-x, 0px)), calc(-50% + var(--end-y, 0px))) scale(2.2) rotateZ(1080deg);
          opacity: 0;
          filter: blur(2px);
        }
      }
    `;
    styleTag.setAttribute('data-confetti-styles', 'true');
    document.head.appendChild(styleTag);
  }
}

export const createConfetti = () => {
  const colors = [
    '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#FFB347', '#B39DDB', '#F06292', '#81C784', '#FF8A65', '#90CAF9'
  ];
  const pieces = [];
  const confettiCount = 120;
  for (let i = 0; i < confettiCount; i++) {
    // Generate random angle and distance for burst effect
    const angle = (Math.PI * 2 * i) / confettiCount + Math.random() * 0.5;
    const distance = 180 + Math.random() * 600;
    const endX = Math.cos(angle) * distance;
    const endY = Math.sin(angle) * distance;
    pieces.push(
      <div
        key={i}
        className="confetti-piece"
        style={{
          left: '50%',
          top: '50%',
          backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          animationDelay: `${Math.random() * 0.7}s`,
          animationDuration: `${2 + Math.random() * 1.5}s`,
          '--end-x': `${endX}px`,
          '--end-y': `${endY}px`,
          boxShadow: `0 0 32px 8px ${colors[Math.floor(Math.random() * colors.length)]}55`,
        }}
      />
    );
  }
  return pieces;
};

export const Confetti = ({ show, classes }) => (
  show ? (
    <div className="confetti">
      {createConfetti()}
    </div>
  ) : null
);

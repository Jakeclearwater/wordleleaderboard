import React from "react";

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
    <div className={classes.confetti}>
      {createConfetti()}
    </div>
  ) : null
);

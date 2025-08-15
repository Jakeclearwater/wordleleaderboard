 import React, { useState, useEffect } from "react";

function getSecondsToNextNZTMidnight() {
  const now = new Date();
  const nztNow = new Date(now.toLocaleString('en-US', { timeZone: 'Pacific/Auckland' }));
  let nextMidnight = new Date(nztNow);
  nextMidnight.setHours(24, 0, 0, 0); // 24:00 is midnight next day
  if (nztNow >= nextMidnight) {
    nextMidnight.setDate(nextMidnight.getDate() + 1);
  }
  return Math.max(0, Math.floor((nextMidnight - nztNow) / 1000));
}

export const CountdownTimer = () => {
  const [secondsLeft, setSecondsLeft] = useState(getSecondsToNextNZTMidnight());
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(getSecondsToNextNZTMidnight());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;
  return (
    <div style={{ 
      display: 'flex', 
      gap: '0.75rem', 
      justifyContent: 'center', 
      alignItems: 'center', 
      fontSize: '1.5rem', 
      fontWeight: 700,
      fontFamily: 'monospace'
    }}>
      <FlippingNumber value={hours} label="H" />
      <span style={{fontSize: '1.5rem', color: '#666', fontWeight: 400, marginTop: '-0.5rem'}}>:</span>
      <FlippingNumber value={minutes} label="M" />
      <span style={{fontSize: '1.5rem', color: '#666', fontWeight: 400, marginTop: '-0.5rem'}}>:</span>
      <FlippingNumber value={seconds} label="S" />
    </div>
  );
};

const FlippingNumber = ({ value, label }) => {
  const padded = value.toString().padStart(2, '0');
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      gap: '0.25rem'
    }}>
      <div style={{ 
        display: 'flex', 
        gap: '0.1rem',
        background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
        padding: '0.25rem',
        borderRadius: '0.375rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
      }}>
        {padded.split('').map((digit, i) => (
          <FlipDigit key={i} digit={digit} />
        ))}
      </div>
      <span style={{ 
        fontSize: '0.6rem', 
        color: '#888', 
        letterSpacing: '0.05em', 
        fontWeight: 600,
        fontFamily: 'sans-serif'
      }}>{label}</span>
    </div>
  );
};

const FlipDigit = ({ digit }) => {
  const [currentDigit, setCurrentDigit] = useState(digit);
  const [nextDigit, setNextDigit] = useState(digit);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (digit !== currentDigit) {
      setNextDigit(digit);
      setIsFlipping(true);
      
      const timeout = setTimeout(() => {
        setCurrentDigit(digit);
        setIsFlipping(false);
      }, 300);
      
      return () => clearTimeout(timeout);
    }
  }, [digit, currentDigit]);

  return (
    <div style={{
      position: 'relative',
      width: '1.5rem',
      height: '2rem',
      perspective: '300px',
      fontFamily: 'monospace',
      fontSize: '1.25rem',
      fontWeight: 'bold'
    }}>
      {/* Top half - shows bottom portion of current digit */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '50%',
        background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
        border: '1px solid #dee2e6',
        borderBottom: 'none',
        borderRadius: '0.25rem 0.25rem 0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#212529',
        overflow: 'hidden',
        zIndex: 3,
        boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.15)'
      }}>
        <div style={{ 
          position: 'absolute',
          top: '0%',
          left: 0,
          width: '100%',
          height: '200%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {currentDigit}
        </div>
      </div>

      {/* Bottom half - shows top portion of current digit */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '50%',
        background: 'linear-gradient(0deg, #f8f9fa 0%, #e9ecef 100%)',
        border: '1px solid #dee2e6',
        borderTop: 'none',
        borderRadius: '0 0 0.25rem 0.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#212529',
        overflow: 'hidden',
        zIndex: 1,
        boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.15)'
      }}>
        <div style={{ 
          position: 'absolute',
          top: '-100%',
          left: 0,
          width: '100%',
          height: '200%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {currentDigit}
        </div>
      </div>

      {/* Center line shadow for depth */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: 0,
        width: '100%',
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
        transform: 'translateY(-0.5px)',
        zIndex: 5
      }}></div>

      {/* Flipping top half - shows bottom portion of next digit */}
      {isFlipping && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '50%',
          background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
          border: '1px solid #dee2e6',
          borderBottom: 'none',
          borderRadius: '0.25rem 0.25rem 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#212529',
          overflow: 'hidden',
          transformOrigin: 'bottom',
          transform: 'rotateX(-90deg)',
          animation: 'flipDown 300ms ease-in-out forwards',
          zIndex: 4,
          boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.15)'
        }}>
          <div style={{ 
            position: 'absolute',
            top: '0%',
            left: 0,
            width: '100%',
            height: '200%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {nextDigit}
          </div>
        </div>
      )}

      {/* Flipping bottom half - shows top portion of next digit */}
      {isFlipping && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '50%',
          background: 'linear-gradient(0deg, #f8f9fa 0%, #e9ecef 100%)',
          border: '1px solid #dee2e6',
          borderTop: 'none',
          borderRadius: '0 0 0.25rem 0.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#212529',
          overflow: 'hidden',
          transformOrigin: 'top',
          transform: 'rotateX(90deg)',
          animation: 'flipUp 300ms ease-in-out forwards',
          animationDelay: '150ms',
          zIndex: 2,
          boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.15)'
        }}>
          <div style={{ 
            position: 'absolute',
            top: '-100%',
            left: 0,
            width: '100%',
            height: '200%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {nextDigit}
          </div>
        </div>
      )}

      {/* Add keyframes for animations */}
      <style>{`
        @keyframes flipDown {
          0% { transform: rotateX(0deg); }
          100% { transform: rotateX(-90deg); }
        }
        @keyframes flipUp {
          0% { transform: rotateX(90deg); }
          100% { transform: rotateX(0deg); }
        }
      `}</style>
    </div>
  );
};

export const FlippingCountdownNZT = ({ children }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '1.5rem 1rem',
    background: 'rgba(255,255,255,0.98)',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid rgba(255,255,255,0.3)',
    fontSize: '1rem',
    color: '#374151',
    fontWeight: '500',
    minHeight: '200px',
    gap: '1rem'
  }}>
    {children}
  </div>
);

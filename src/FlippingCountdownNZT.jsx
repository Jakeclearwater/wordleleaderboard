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
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center', fontSize: '2.5rem', fontWeight: 700 }}>
      <FlippingNumber value={hours} label="HRS" />
      <span style={{fontSize: '2.2rem', color: '#bbb', fontWeight: 400}}>:</span>
      <FlippingNumber value={minutes} label="MIN" />
      <span style={{fontSize: '2.2rem', color: '#bbb', fontWeight: 400}}>:</span>
      <FlippingNumber value={seconds} label="SEC" />
    </div>
  );
};

const FlippingNumber = ({ value, label }) => {
  const padded = value.toString().padStart(2, '0');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '0.1em' }}>
        {padded.split('').map((digit, i) => (
          <FlipDigit key={i} digit={digit} />
        ))}
      </div>
      <span style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.2em', letterSpacing: '0.1em', fontWeight: 500 }}>{label}</span>
    </div>
  );
};

const FlipDigit = ({ digit }) => {
  const [displayDigit, setDisplayDigit] = useState(digit);
  const [flipping, setFlipping] = useState(false);
  const [nextDigit, setNextDigit] = useState(digit);

  useEffect(() => {
    if (digit !== displayDigit) {
      setNextDigit(digit);
      setFlipping(true);
      const timeout = setTimeout(() => {
        setFlipping(false);
        setDisplayDigit(digit);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [digit, displayDigit]);

  return (
    <span style={{
      display: 'flex',
      width: '1.2em',
      height: '1.5em',
      background: '#222',
      color: '#fff',
      borderRadius: '0.25em',
      margin: '0 0.05em',
      fontFamily: 'monospace',
      fontSize: '1em',
      boxShadow: '0 2px 8px #0002, 0 8px 18px 0 #0006', // desk shadow
      position: 'relative',
      perspective: '80px',
      overflow: 'hidden',
      verticalAlign: 'middle',
      transition: 'background 0.2s',
      border: flipping ? '2px solid #3b82f6' : '2px solid #222',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <span style={{
        width: '100%',
        height: '100%',
        fontWeight: 700,
        fontSize: '1.2em',
        textAlign: 'center',
        transform: flipping ? 'rotateX(90deg)' : 'rotateX(0deg)',
        transition: 'transform 0.5s cubic-bezier(.4,2,.6,1)',
        background: flipping ? '#3b82f6' : 'inherit',
        color: flipping ? '#fff' : '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
      }}>{flipping ? displayDigit : nextDigit}</span>
      {flipping && (
        <span style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          fontWeight: 700,
          fontSize: '1.2em',
          textAlign: 'center',
          transform: 'rotateX(0deg)',
          transition: 'none',
          background: '#222',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
        }}>{nextDigit}</span>
      )}
    </span>
  );
};

export const FlippingCountdownNZT = ({ children }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '2rem 1rem',
    background: 'rgba(255,255,255,0.98)',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid rgba(255,255,255,0.3)',
    fontSize: '1.25rem',
    color: '#374151',
    fontWeight: '500',
    minHeight: '340px',
  }}>
    {children}
  </div>
);

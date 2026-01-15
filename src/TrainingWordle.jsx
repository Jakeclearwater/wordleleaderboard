import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { SOLUTION_WORDS, WORD_SET } from './wordlists/wordleWords';
import useStyles from './useStyles';
import { Confetti } from './Confetti';
import { firestore } from './firebase';

const MAX_GUESSES = 6;

const getRandomWord = () => SOLUTION_WORDS[Math.floor(Math.random() * SOLUTION_WORDS.length)];

const TrainingWordle = ({ getCurrentGradient, username, isLoggedIn }) => {
  const classes = useStyles();
  const accentGradient = useMemo(
    () => (typeof getCurrentGradient === 'function' ? getCurrentGradient() : null),
    [getCurrentGradient],
  );
  const helpPortalTarget = typeof document !== 'undefined' ? document.body : null;
  const [solution, setSolution] = useState(() => getRandomWord());
  const [guesses, setGuesses] = useState([]);

  useEffect(() => {
    console.log('Training Wordle Solution:', solution);
  }, [solution]);

  useEffect(() => {
    if (isLoggedIn && username) {
      console.log('Training Wordle User:', username);
      fetchTrainingStats(username);
    }
  }, [isLoggedIn, username]);

  const fetchTrainingStats = async (username) => {
    try {
      const q = query(
        collection(firestore, 'training_scores'),
        where('name', '==', username)
      );
      const snapshot = await getDocs(q);
      const scores = snapshot.docs.map(doc => doc.data());
      
      const wins = scores.filter(s => !s.dnf).length;
      const totalGames = scores.length;
      const avgGuesses = wins > 0 
        ? (scores.filter(s => !s.dnf).reduce((sum, s) => sum + s.guesses, 0) / wins).toFixed(2)
        : 0;
      
      setTrainingStats({ wins, totalGames, avgGuesses });
    } catch (error) {
      console.error('Error fetching training stats:', error);
    }
  };
  const [currentGuess, setCurrentGuess] = useState('');
  const [status, setStatus] = useState('playing');
  const [showHelp, setShowHelp] = useState(false);
  const [keyboardHints, setKeyboardHints] = useState({});
  const [revealIndex, setRevealIndex] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [trainingStats, setTrainingStats] = useState({ wins: 0, totalGames: 0, avgGuesses: 0 });
  const [showStats, setShowStats] = useState(false);
  const feedbackTimers = useRef({ hide: null, remove: null });

  const clearFeedback = useCallback(() => {
    if (feedbackTimers.current.hide) {
      clearTimeout(feedbackTimers.current.hide);
      feedbackTimers.current.hide = null;
    }
    if (feedbackTimers.current.remove) {
      clearTimeout(feedbackTimers.current.remove);
      feedbackTimers.current.remove = null;
    }
    setIsFeedbackVisible(false);
    setFeedback(null);
  }, []);

  const showFeedback = useCallback((type, message) => {
    if (feedbackTimers.current.hide) {
      clearTimeout(feedbackTimers.current.hide);
      feedbackTimers.current.hide = null;
    }
    if (feedbackTimers.current.remove) {
      clearTimeout(feedbackTimers.current.remove);
      feedbackTimers.current.remove = null;
    }
    setFeedback({ type, message });
  }, []);

  const handleNewGame = useCallback(() => {
    setSolution(getRandomWord());
    setGuesses([]);
    setCurrentGuess('');
    setStatus('playing');
    setKeyboardHints({});
    setRevealIndex(null);
    setShowConfetti(false);
    clearFeedback();
  }, [clearFeedback]);

  useEffect(() => {
    handleNewGame();
  }, [handleNewGame]);

  const validateGuess = useCallback((guess) => {
    if (guess.length !== 5) {
      return 'Guesses must be exactly five letters.';
    }
    if (!/^[A-Z]{5}$/.test(guess)) {
      return 'Use only letters A to Z.';
    }
    if (!WORD_SET.has(guess)) {
      return `We don't recognise “${guess}” yet. Try another word!`;
    }
    return null;
  }, []);

  const evaluateGuess = useCallback((guess, target) => {
    const result = Array(5).fill('absent');
    const targetLetters = target.split('');
    const guessLetters = guess.split('');
    const letterCounts = {};

    targetLetters.forEach(letter => {
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    });

    for (let i = 0; i < 5; i += 1) {
      if (guessLetters[i] === targetLetters[i]) {
        result[i] = 'correct';
        letterCounts[guessLetters[i]] -= 1;
      }
    }

    for (let i = 0; i < 5; i += 1) {
      if (result[i] === 'correct') continue;
      const letter = guessLetters[i];
      if (targetLetters.includes(letter) && letterCounts[letter] > 0) {
        result[i] = 'present';
        letterCounts[letter] -= 1;
      }
    }

    return result;
  }, []);

  const handleSubmitGuess = useCallback(async () => {
    if (status !== 'playing') return;
    const guess = currentGuess.toUpperCase();
    const error = validateGuess(guess);
    if (error) {
      showFeedback('error', error);
      return;
    }

    clearFeedback();
    const evaluation = evaluateGuess(guess, solution);
    setRevealIndex(0);

    setGuesses(prev => [...prev, { guess, evaluation }]);
    setCurrentGuess('');

    setKeyboardHints(prev => {
      const next = { ...prev };
      evaluation.forEach((state, idx) => {
        const letter = guess[idx];
        if (state === 'correct') {
          next[letter] = 'correct';
        } else if (state === 'present' && next[letter] !== 'correct') {
          next[letter] = 'present';
        } else if (!next[letter]) {
          next[letter] = 'absent';
        }
      });
      return next;
    });

    if (evaluation.every(state => state === 'correct')) {
      setStatus('won');
      
      // Save training score to Firestore
      if (isLoggedIn && username) {
        try {
          await addDoc(collection(firestore, 'training_scores'), {
            name: username,
            guesses: guesses.length + 1,
            isoDate: new Date().toISOString(),
            dnf: false,
            wordleNumber: null,
            hardMode: false,
            trainingMode: true
          });
          // Refresh stats
          fetchTrainingStats(username);
        } catch (error) {
          console.error('Error saving training score:', error);
        }
      }
      
      setTimeout(() => {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }, 1300);
    } else if (guesses.length + 1 >= MAX_GUESSES) {
      setStatus('lost');
      
      // Save training score as DNF
      if (isLoggedIn && username) {
        try {
          await addDoc(collection(firestore, 'training_scores'), {
            name: username,
            guesses: 7,
            isoDate: new Date().toISOString(),
            dnf: true,
            wordleNumber: null,
            hardMode: false,
            trainingMode: true
          });
          // Refresh stats
          fetchTrainingStats(username);
        } catch (error) {
          console.error('Error saving training score:', error);
        }
      }
    } else {
      setStatus('playing');
    }
  }, [
    status,
    currentGuess,
    validateGuess,
    evaluateGuess,
    solution,
    guesses.length,
    showFeedback,
    clearFeedback,
  ]);

  useEffect(() => {
    if (revealIndex === null) return;
    if (guesses.length === 0) return;
    const lastGuess = guesses[guesses.length - 1];
    if (!lastGuess) return;

    if (revealIndex < lastGuess.evaluation.length) {
      const timeout = setTimeout(() => {
        setRevealIndex(prev => (prev === null ? 0 : prev + 1));
      }, 320);
      return () => clearTimeout(timeout);
    }

    setRevealIndex(null);
  }, [revealIndex, guesses]);

  const handleKeyboardInput = useCallback((letter) => {
    if (status !== 'playing') return;
    if (letter === 'ENTER') {
      handleSubmitGuess();
      return;
    }
    if (letter === 'DELETE') {
      setCurrentGuess(prev => prev.slice(0, -1));
      return;
    }
    if (currentGuess.length >= 5) return;
    setCurrentGuess(prev => `${prev}${letter}`);
  }, [status, currentGuess.length, handleSubmitGuess]);

  useEffect(() => {
    const handler = (event) => {
      if (status !== 'playing') return;
      const { key } = event;
      if (key === 'Enter') {
        event.preventDefault();
        handleSubmitGuess();
      } else if (key === 'Backspace') {
        event.preventDefault();
        setCurrentGuess(prev => prev.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(key)) {
        event.preventDefault();
        if (currentGuess.length < 5) {
          setCurrentGuess(prev => `${prev}${key.toUpperCase()}`);
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSubmitGuess, status, currentGuess.length]);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timers = feedbackTimers.current;
    setIsFeedbackVisible(true);

    if (timers.hide) {
      clearTimeout(timers.hide);
      timers.hide = null;
    }
    if (timers.remove) {
      clearTimeout(timers.remove);
      timers.remove = null;
    }

    timers.hide = setTimeout(() => {
      setIsFeedbackVisible(false);
      timers.hide = null;
    }, 2200);

    timers.remove = setTimeout(() => {
      setFeedback(null);
      timers.remove = null;
    }, 2700);

    return () => {
      if (timers.hide) {
        clearTimeout(timers.hide);
        timers.hide = null;
      }
      if (timers.remove) {
        clearTimeout(timers.remove);
        timers.remove = null;
      }
    };
  }, [feedback]);

  const rows = useMemo(() => {
    const padded = [...guesses];
    if (status === 'playing') {
      padded.push({ guess: currentGuess.toUpperCase(), evaluation: Array(5).fill('pending') });
    }
    while (padded.length < MAX_GUESSES) {
      padded.push({ guess: '', evaluation: Array(5).fill('') });
    }
    return padded.slice(0, MAX_GUESSES);
  }, [guesses, currentGuess, status]);

  const getTileClass = (evaluation, rowIndex, tileIndex) => {
    const lastRowIndex = guesses.length - 1;
    const isRevealing = rowIndex === lastRowIndex && revealIndex !== null && tileIndex <= revealIndex;
    
    let classNames = [classes.trainingTile];
    
    if (evaluation === 'pending') {
      classNames.push(classes.trainingTilePending);
    } else if (!evaluation) {
      classNames.push(classes.trainingTileEmpty);
    } else if (rowIndex === lastRowIndex && revealIndex !== null) {
      if (tileIndex <= revealIndex) {
        classNames.push(classes[`trainingTile${evaluation.charAt(0).toUpperCase() + evaluation.slice(1)}`]);
        classNames.push(classes.trainingTileFlip);
      } else {
        classNames.push(classes.trainingTileHidden);
      }
    } else {
      classNames.push(classes[`trainingTile${evaluation.charAt(0).toUpperCase() + evaluation.slice(1)}`]);
    }
    
    return classNames.join(' ');
  };

  const getKeyboardKeyClass = (state) => {
    if (!state) return classes.trainingKeyboardKey;
    return `${classes.trainingKeyboardKey} ${classes[`trainingKey${state.charAt(0).toUpperCase() + state.slice(1)}`]}`;
  };

  return (
    <div
      className={classes.trainingSurface}
      style={accentGradient ? { '--training-accent': accentGradient } : undefined}
    >
      <Confetti show={showConfetti} />
      <div className={classes.trainingContainer}>
        <div className={classes.trainingControls}>
          <button
            className={classes.trainingPrimaryButton}
            onClick={handleNewGame}
          >
            🔁 New Word
          </button>
          {isLoggedIn && (
            <button
              className={classes.trainingSecondaryButton}
              onClick={() => setShowStats(!showStats)}
            >
              {showStats ? '🎮 Game' : '📊 Stats'}
            </button>
          )}
          <button
            className={classes.trainingSecondaryButton}
            onClick={() => setShowHelp(true)}
          >
            📘 How to play
          </button>
        </div>

        {feedback && (
          <div
            className={`${classes.trainingFeedback} ${isFeedbackVisible ? classes.trainingFeedbackVisible : ''} ${feedback.type === 'error' ? classes.trainingFeedbackError : classes.trainingFeedbackInfo}`}
            role="status"
            aria-live="polite"
          >
            {feedback.message}
          </div>
        )}

        <div className={classes.trainingFlipContainer}>
          <div className={`${classes.trainingFlipCard} ${showStats ? classes.trainingFlipCardFlipped : ''}`}>
            <div className={classes.trainingFlipFront}>
              <div className={classes.trainingBoard}>
                {rows.map((row, rowIndex) => {
            const lastRowIndex = guesses.length - 1;
            const isWinningRow = status === 'won' && rowIndex === lastRowIndex;
            const rowClass = isWinningRow ? `${classes.trainingRow} ${classes.trainingRowWin}` : classes.trainingRow;
            
            return (
              <div key={`row-${rowIndex}`} className={rowClass}>
                {row.guess.padEnd(5).split('').map((letter, tileIndex) => {
                const displayChar = letter === ' ' ? '' : letter;
                const lastRowIndex = guesses.length - 1;
                const isRevealing = rowIndex === lastRowIndex && revealIndex !== null && tileIndex <= revealIndex;
                const animationDelay = isRevealing ? `${tileIndex * 0.15}s` : undefined;
                const isCurrentRow = rowIndex === guesses.length && status === 'playing';
                const shouldPulse = isCurrentRow && tileIndex === currentGuess.length;
                
                return (
                  <div
                    key={`tile-${rowIndex}-${tileIndex}`}
                    className={`${getTileClass(row.evaluation[tileIndex], rowIndex, tileIndex)} ${shouldPulse ? classes.trainingTilePulse : ''}`}
                    style={animationDelay ? { animationDelay } : undefined}
                  >
                    <span style={animationDelay ? { animationDelay } : undefined}>{displayChar}</span>
                  </div>
                );
              })}
            </div>
            );
          })}
        </div>

        <div className={classes.trainingKeyboard}>
          {['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row, idx) => (
            <div key={`kb-row-${idx}`} className={classes.trainingKeyboardRow}>
              {idx === 2 && (
                <button
                  className={`${classes.trainingKeyboardKey} ${classes.trainingKeyAction}`}
                  onClick={() => handleKeyboardInput('ENTER')}
                >
                  Enter
                </button>
              )}
              {row.split('').map(letter => (
                <button
                  key={`kb-${letter}`}
                  className={getKeyboardKeyClass(keyboardHints[letter])}
                  onClick={() => handleKeyboardInput(letter)}
                >
                  {letter}
                </button>
              ))}
              {idx === 2 && (
                <button
                  className={`${classes.trainingKeyboardKey} ${classes.trainingKeyAction}`}
                  onClick={() => handleKeyboardInput('DELETE')}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
            </div>

            <div className={classes.trainingFlipBack}>
              {trainingStats && (
                <div className={classes.trainingStatsCardLarge}>
                  <div className={classes.trainingStatsTitle}>Your Training Stats</div>
                  <div className={classes.trainingStatsGrid}>
                    <div className={classes.trainingStat}>
                      <div className={classes.trainingStatValue}>{trainingStats.wins}</div>
                      <div className={classes.trainingStatLabel}>Wins</div>
                    </div>
                    <div className={classes.trainingStat}>
                      <div className={classes.trainingStatValue}>{trainingStats.totalGames}</div>
                      <div className={classes.trainingStatLabel}>Games</div>
                    </div>
                    <div className={classes.trainingStat}>
                      <div className={classes.trainingStatValue}>{trainingStats.avgGuesses}</div>
                      <div className={classes.trainingStatLabel}>Avg Guesses</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {status !== 'playing' && (
          <div className={classes.trainingResultCard}>
            <div className={classes.trainingResultTitle}>
              {status === 'won' ? '🎉 Great job!' : '🤔 The word was'}
            </div>
            <div className={classes.trainingResultWord}>{solution}</div>
            <button
              className={classes.trainingPrimaryButton}
              onClick={handleNewGame}
            >
              Play again
            </button>
          </div>
        )}

        {showHelp && helpPortalTarget && createPortal(
          (
            <div className={classes.trainingOverlay} role="dialog" aria-modal="true">
              <div className={classes.trainingModal}>
                <h3>How to play</h3>
                <p>Guess the word in six tries. Each guess must be a valid five-letter word.</p>
                <ul>
                  <li><strong>Green tiles</strong> mean the letter is in the correct spot.</li>
                  <li><strong>Yellow tiles</strong> mean the letter is in the word but in a different spot.</li>
                  <li><strong>Gray tiles</strong> mean the letter is not in the word.</li>
                </ul>
                <button className={classes.trainingSecondaryButton} onClick={() => setShowHelp(false)}>
                  Close
                </button>
              </div>
            </div>
          ),
          helpPortalTarget,
        )}
      </div>
    </div>
  );
};

export default TrainingWordle;

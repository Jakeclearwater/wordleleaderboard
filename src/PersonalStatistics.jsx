import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import useStyles from './useStyles';
import wordleLogo from './assets/wordle.png';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from './firebase';
import { FlippingCountdownNZT, CountdownTimer } from './FlippingCountdownNZT';

const useLocalStyles = createUseStyles({
  statisticsContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  
  title: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
    width: '100%',
    maxWidth: '400px',
    '@media (max-width: 480px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.75rem',
    },
  },
  
  statBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1rem 0.5rem',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    '@media (max-width: 480px)': {
      padding: '0.75rem 0.25rem',
    },
  },
  
  statNumber: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: '1',
    marginBottom: '0.25rem',
    '@media (max-width: 480px)': {
      fontSize: '1.25rem',
    },
  },
  
  statLabel: {
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: '1.2',
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
    '@media (max-width: 480px)': {
      fontSize: '0.7rem',
    },
  },
  
  chartContainer: {
    width: '100%',
    maxWidth: '400px',
    marginBottom: '2rem',
  },
  
  chartTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  
  guessDistribution: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  
  guessRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
  },
  
  guessNumber: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    width: '1rem',
    textAlign: 'center',
    flexShrink: 0,
  },
  
  barContainer: {
    flex: 1,
    height: '1.5rem',
    position: 'relative',
    backgroundColor: '#f3f4f6',
    borderRadius: '2px',
  },
  
  guessBar: {
    height: '100%',
    borderRadius: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'white',
    minWidth: '1.5rem',
    transition: 'all 0.2s ease',
  },
  
  guessBarNormal: {
    backgroundColor: '#6b7280',
  },
  
  guessBarToday: {
    backgroundColor: props => props.todayBarColor || '#3b82f6',
    // transform: 'scale(1.05)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    color: 'white',
  },
  
  emptyBar: {
    width: '0',
    height: '1.5rem',
  },
  
  countdownSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  
  countdownText: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '0.5rem',
    textAlign: 'center',
  },
});

const PersonalStatistics = ({ username, todaysScore, getCurrentGradient }) => {
  // Extract a primary color from the gradient for today's bar
  const gradientString = getCurrentGradient ? getCurrentGradient() : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  const colorMatch = gradientString.match(/#[0-9a-fA-F]{6}/);
  const todayBarColor = colorMatch ? colorMatch[0] : '#667eea';
  
  const shared = useStyles();
  const classes = useLocalStyles({ todayBarColor });
  const [statistics, setStatistics] = useState({
    played: 0,
    winPercentage: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStatistics = async () => {
      if (!username) return;
      
      setLoading(true);
      try {
        // Fetch all scores for this user
        const q = query(collection(firestore, "scores"), where("name", "==", username.trim()));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          setLoading(false);
          return;
        }

        const userScores = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          userScores.push(data);
        });

        // Sort scores by effective date
        const getEffectiveDate = (score) => {
          if (score.isoDate) {
            return new Intl.DateTimeFormat('en-CA', {
              timeZone: 'Pacific/Auckland',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).format(new Date(score.isoDate));
          }
          return score.date;
        };

        userScores.sort((a, b) => {
          const dateA = getEffectiveDate(a);
          const dateB = getEffectiveDate(b);
          return dateA.localeCompare(dateB);
        });

        // Calculate statistics
        const played = userScores.length;
        const wins = userScores.filter(score => {
          const guesses = parseFloat(score.guesses);
          return !score.dnf && guesses >= 1 && guesses <= 6;
        }).length;
        const winPercentage = played > 0 ? Math.round((wins / played) * 100) : 0;

        // Calculate guess distribution
        const guessDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
        userScores.forEach(score => {
          let guesses = parseFloat(score.guesses);
          if (isNaN(guesses) || guesses === 0) {
            guesses = 7; // DNF
          }
          if (guesses >= 1 && guesses <= 7) {
            guessDistribution[guesses]++;
          }
        });

        // Calculate streaks
        let currentStreak = 0;
        let maxStreak = 0;
        let tempStreak = 0;
        
        // Work backwards from most recent to find current streak
        for (let i = userScores.length - 1; i >= 0; i--) {
          const score = userScores[i];
          const guesses = parseFloat(score.guesses);
          const isWin = !score.dnf && guesses >= 1 && guesses <= 6;
          
          if (i === userScores.length - 1) {
            // Most recent game
            if (isWin) {
              currentStreak = 1;
              tempStreak = 1;
            }
          } else {
            if (isWin) {
              if (tempStreak > 0) {
                tempStreak++;
                currentStreak = tempStreak;
              }
            } else {
              break; // Current streak is broken
            }
          }
        }

        // Calculate max streak
        tempStreak = 0;
        userScores.forEach(score => {
          const guesses = parseFloat(score.guesses);
          const isWin = !score.dnf && guesses >= 1 && guesses <= 6;
          
          if (isWin) {
            tempStreak++;
            maxStreak = Math.max(maxStreak, tempStreak);
          } else {
            tempStreak = 0;
          }
        });

        setStatistics({
          played,
          winPercentage,
          currentStreak,
          maxStreak,
          guessDistribution
        });

      } catch (error) {
        console.error('Error fetching user statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStatistics();
  }, [username]);

  if (loading) {
    return (
      <div className={classes.statisticsContainer}>
        <img src={wordleLogo} alt="Loading" className={shared.spinningLogo} />
        <div className={shared.loadingText}>Loading statistics...</div>
      </div>
    );
  }

  const maxCount = Math.max(...Object.values(statistics.guessDistribution));

  return (
    <div className={classes.statisticsContainer}>
      <h2 className={classes.title}>Personal Statistics</h2>
      
      <div className={classes.statsGrid}>
        <div className={classes.statBox}>
          <div className={classes.statNumber}>{statistics.played}</div>
          <div className={classes.statLabel}>Played</div>
        </div>
        <div className={classes.statBox}>
          <div className={classes.statNumber}>{statistics.winPercentage}</div>
          <div className={classes.statLabel}>Win %</div>
        </div>
        <div className={classes.statBox}>
          <div className={classes.statNumber}>{statistics.currentStreak}</div>
          <div className={classes.statLabel}>Current Streak</div>
        </div>
        <div className={classes.statBox}>
          <div className={classes.statNumber}>{statistics.maxStreak}</div>
          <div className={classes.statLabel}>Max Streak</div>
        </div>
      </div>

      <div className={classes.chartContainer}>
        <div className={classes.chartTitle}>Guess Distribution</div>
        <div className={classes.guessDistribution}>
          {[1, 2, 3, 4, 5, 6, 7].map(guessNumber => {
            const count = statistics.guessDistribution[guessNumber];
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
            const minWidth = count > 0 ? Math.max(percentage, 10) : 0;
            const isToday = todaysScore && parseInt(todaysScore.guesses) === guessNumber;
            
            return (
              <div key={guessNumber} className={classes.guessRow}>
                <div className={classes.guessNumber}>
                  {guessNumber === 7 ? 'X' : guessNumber}
                </div>
                <div className={classes.barContainer}>
                  {count > 0 ? (
                    <div 
                      className={`${classes.guessBar} ${isToday ? classes.guessBarToday : classes.guessBarNormal}`}
                      style={{ 
                        width: `${minWidth}%`,
                        minWidth: '1.5rem'
                      }}
                    >
                      {count}
                    </div>
                  ) : (
                    <div className={classes.emptyBar}></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={classes.countdownSection}>
        <FlippingCountdownNZT>
          <div className={classes.countdownText}>
            Next Wordle in:
          </div>
          <CountdownTimer />
        </FlippingCountdownNZT>
      </div>
    </div>
  );
};

export default PersonalStatistics;

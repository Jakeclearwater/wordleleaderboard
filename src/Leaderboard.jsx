import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from './firebase';
import { BounceLoader } from 'react-spinners';

const useStyles = createUseStyles({
  leaderboardContainer: {
    padding: '0',
    textAlign: 'center',
    width: '100%',
    maxWidth: '100%',
    margin: '0',
    boxSizing: 'border-box',
  },
  title: {
    fontSize: '18px',
    textAlign: 'center',
    color: '#333',
    marginBottom: '1.5rem',
    marginTop: '0',
    fontWeight: '700',
    lineHeight: '1.2',
  },
  list: {
    listStyleType: 'none',
    padding: '0',
    margin: '0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  listItem: {
    padding: '1rem 1.25rem',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    color: '#333',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    cursor: 'help',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
      background: 'rgba(255, 255, 255, 0.9)',
    },
  },
  listItemLast: {
    // No special styling needed anymore since we removed borders
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    flex: 1,
    minWidth: '280px',
    maxWidth: '400px',
    padding: '1.5rem',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    borderRadius: '16px',
    margin: '0.75rem',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    },
  },
  columns: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    width: '100%',
    maxWidth: '1600px',
    margin: '0 auto',
    '@media (max-width: 1200px)': {
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      maxWidth: '1400px',
    },
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '1rem',
    },
  },
  resultsHeader: {
    color: '#333',
    fontSize: '2rem',
    marginTop: '0',
    marginBottom: '2rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '60vh',
    fontSize: '1.2em',
    color: '#666',
  },
  dancingCat: {
    fontSize: '4rem',
    animation: '$dance 1s ease-in-out infinite alternate',
    marginBottom: '1rem',
  },
  '@keyframes dance': {
    '0%': {
      transform: 'rotate(-10deg) scale(1)',
    },
    '50%': {
      transform: 'rotate(0deg) scale(1.1)',
    },
    '100%': {
      transform: 'rotate(10deg) scale(1)',
    },
  },
  icon: {
    marginRight: '8px',
    fontSize: '16px',
  },
  spoon: {
    marginRight: '8px',
    fontSize: '16px',
    filter: 'sepia(1) saturate(2) hue-rotate(15deg)',
    transform: 'rotate(-8deg)',
  },
  rankNumber: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '24px',
    height: '24px',
    borderRadius: '50%',
    fontSize: '12px',
    fontWeight: '700',
    marginRight: '12px',
    color: 'white',
    flexShrink: 0,
  },
  playerName: {
    fontWeight: '600',
    marginRight: '8px',
    color: '#333',
  },
  playerScore: {
    marginLeft: 'auto',
    fontWeight: '700',
    fontSize: '16px',
  },
  
  // Statistics section styles
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
    margin: '2rem 0',
    padding: '0 1rem',
    maxWidth: '800px',
    marginLeft: 'auto',
    marginRight: 'auto',
    '@media (max-width: 768px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.75rem',
      margin: '1.5rem 0',
    },
  },
  
  statCard: {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    padding: '1.25rem',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
      background: 'rgba(255, 255, 255, 0.95)',
    },
    '@media (max-width: 768px)': {
      padding: '1rem',
    },
  },
  
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#333',
    margin: '0.5rem 0 0.25rem 0',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    '@media (max-width: 768px)': {
      fontSize: '1.75rem',
    },
  },
  
  statLabel: {
    fontSize: '0.875rem',
    color: '#666',
    fontWeight: '500',
    margin: '0',
    lineHeight: '1.2',
  },
  
  statIcon: {
    fontSize: '1.5rem',
    marginBottom: '0.5rem',
    display: 'block',
  },
});

const grayShades = [
  '#8a8a8a', '#949494', '#9e9e9e', '#a8a8a8', '#b2b2b2',
  '#bcbcbc', '#c6c6c6', '#d0d0d0', '#dadada', '#e4e4e4',
  '#eeeeee', '#f2f2f2', '#f6f6f6', '#f9f9f9', '#fcfcfc',
  '#fefefe', '#ffffff',
];

const Leaderboard = () => {
  const classes = useStyles();
  const [dailyLeaderboard, setDailyLeaderboard] = useState([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState([]);
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState([]);
  const [allAttemptsLeaderboard, setAllAttemptsLeaderboard] = useState([]);
  const [woodspoonLeaderboard, setWoodspoonLeaderboard] = useState([]);
  const [stats, setStats] = useState({
    totalPlayers: 0,
    activeCompetitors: 0,
    totalGames: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      setLoading(true);
      try {
        // Get current date in NZ timezone for accurate comparisons
        const now = new Date();
        const nzTime = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Pacific/Auckland',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(now);
        const todayNZ = nzTime; // YYYY-MM-DD format in NZ timezone

        // Calculate NZ timezone boundaries for weekly data
        const weekAgoNZ = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weekAgoNZStr = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Pacific/Auckland',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(weekAgoNZ);

        // Fetch all scores for client-side filtering (more flexible than server-side queries)
        const allScoresQuery = collection(firestore, 'scores');
        const allScoresSnapshot = await getDocs(allScoresQuery);
        const allScores = allScoresSnapshot.docs.map(doc => doc.data());

        // Helper function to get the effective date from a score record
        const getEffectiveDate = (score) => {
          // Only use isoDate - ignore records without it
          if (score.isoDate) {
            // Convert ISO datetime to NZ date
            const isoDate = new Date(score.isoDate);
            return new Intl.DateTimeFormat('en-CA', {
              timeZone: 'Pacific/Auckland',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).format(isoDate);
          } else {
            // No isoDate - ignore this record
            return null;
          }
        };

        // Filter out records without isoDate first, then filter by date range
        const validScores = allScores.filter(score => score.isoDate);

        const dailyScores = validScores.filter(score => {
          const effectiveDate = getEffectiveDate(score);
          return effectiveDate === todayNZ;
        });

        const weeklyScores = validScores.filter(score => {
          const effectiveDate = getEffectiveDate(score);
          return effectiveDate >= weekAgoNZStr;
        });

        // Use only valid scores for all-time leaderboard
        const allTimeScores = validScores;

        // Fetch woodspoon leaderboard with guesses=7 (only from valid scores)
        const woodspoonScores = validScores.filter(score => score.guesses === 7);

        // Also find scores that are 0 or null/undefined to include them as DNFs (only from valid scores)
        const additionalDNFs = validScores.filter(score => 
          score.guesses === 0 || score.guesses === null || score.guesses === undefined
        );

        // Combine both types of DNFs
        const allDNFScores = [...woodspoonScores, ...additionalDNFs];

        console.log('Total scores fetched:', allScores.length);
        console.log('Valid scores (with isoDate):', validScores.length);
        console.log('Daily scores found:', dailyScores.length, dailyScores);
        console.log('Weekly scores found:', weeklyScores.length);
        console.log('All time scores found:', allTimeScores.length);

        // For daily: simple averages - treating 0, null, undefined as 7 (DNF)
        const groupScoresSimple = (scores) => {
          const grouped = scores.reduce((acc, s) => {
            // Extract the guesses value
            let g = parseFloat(s.guesses);
            
            // Convert 0, NaN, null, undefined to 7 (DNF)
            if (isNaN(g) || g === 0) {
              g = 7;  // Treat as DNF
            }
            
            if (!acc[s.name]) {
              acc[s.name] = { totalGuesses: 0, attempts: 0 };
            }
            acc[s.name].totalGuesses += g;
            acc[s.name].attempts += 1;
            return acc;
          }, {});
          
          return Object.keys(grouped).map(name => {
            const { totalGuesses, attempts } = grouped[name];
            return {
              name,
              average: totalGuesses / attempts
            };
          });
        };

        // For weekly: consider missed weekdays as DNFs (score of 7), excluding weekends
        const groupWeeklyScores = (scores) => {
          // Get all weekdays (Monday-Friday) in the past 7 days using NZ timezone
          const weekdays = [];
          const currentNZTime = new Date();
          
          for (let i = 0; i < 7; i++) {
            const checkDate = new Date(currentNZTime.getTime() - i * 24 * 60 * 60 * 1000);
            const nzDateStr = new Intl.DateTimeFormat('en-CA', {
              timeZone: 'Pacific/Auckland',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).format(checkDate);
            
            const dayOfWeek = checkDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            
            // Only include weekdays (Monday=1 to Friday=5)
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
              weekdays.push(nzDateStr);
            }
          }

          const grouped = scores.reduce((acc, s) => {
            // Get effective date using the helper function
            const effectiveDate = getEffectiveDate(s);
            
            // Check if score date is a weekday using the effective date
            const scoreDate = new Date(effectiveDate + 'T00:00:00');
            const dayOfWeek = scoreDate.getDay();
            
            // Skip weekend scores (Sunday=0, Saturday=6)
            if (dayOfWeek === 0 || dayOfWeek === 6) {
              return acc;
            }
            
            // Extract the guesses value
            let g = parseFloat(s.guesses);
            
            // Convert 0, NaN, null, undefined to 7 (DNF)
            if (isNaN(g) || g === 0) {
              g = 7;  // Treat as DNF
            }
            
            if (!acc[s.name]) {
              acc[s.name] = { 
                totalGuesses: 0, 
                playedDays: new Set(),
                scores: {}
              };
            }
            acc[s.name].totalGuesses += g;
            acc[s.name].playedDays.add(effectiveDate);
            acc[s.name].scores[effectiveDate] = g;
            return acc;
          }, {});
          
          return Object.keys(grouped).map(name => {
            const playerData = grouped[name];
            const playedWeekdaysCount = playerData.playedDays.size;
            const totalWeekdays = weekdays.length;
            const missedWeekdaysCount = totalWeekdays - playedWeekdaysCount;
            
            // Add 7 points for each missed weekday
            const totalWithMissedDays = playerData.totalGuesses + (missedWeekdaysCount * 7);
            
            return {
              name,
              average: totalWeekdays > 0 ? totalWithMissedDays / totalWeekdays : 0, // Divide by actual weekdays
              playedDays: playedWeekdaysCount,
              missedDays: missedWeekdaysCount,
              totalWeekdays: totalWeekdays
            };
          });
        };

        const dailyLeaderboardArray = groupScoresSimple(dailyScores)
          .sort((a, b) => a.average - b.average);

        const weeklyLeaderboardArray = groupWeeklyScores(weeklyScores)
          .sort((a, b) => a.average - b.average);

        // Compute global mean for Bayesian prior from allTimeScores
        const allTimeSum = allTimeScores.reduce((acc, score) => {
          let g = parseFloat(score.guesses);
          
          // Convert 0, NaN, null, undefined to 7 (DNF)
          if (isNaN(g) || g === 0) {
            g = 7;  // Treat as DNF
          }
          
          acc.totalGuesses += g;
          acc.totalCount += 1;
          return acc;
        }, { totalGuesses: 0, totalCount: 0 });

        const globalMean = allTimeSum.totalCount > 0 ? (allTimeSum.totalGuesses / allTimeSum.totalCount) : 4.5;
        const alpha = 20;   // Strength of the prior
        const R = 40;       // Recency scaling factor
        const C = 0.2;      // Attempts bonus scaling factor
        const parseDate = (d) => new Date(d);
        const currentTime = new Date();

        // Group for Bayesian leaderboard - now properly handles DNFs
        const groupedAllTime = allTimeScores.reduce((acc, s) => {
          // Extract and normalize guesses
          let g = parseFloat(s.guesses);
          
          // Convert 0, NaN, null, undefined to 7 (DNF)
          if (isNaN(g) || g === 0) {
            g = 7;  // Treat as DNF
          }
          
          // Use effective date for consistency
          const effectiveDate = getEffectiveDate(s);
          if (!effectiveDate) return acc;
          
          if (!acc[s.name]) {
            acc[s.name] = { totalGuesses: 0, attempts: 0, lastAttempt: parseDate(effectiveDate) };
          }
          
          acc[s.name].totalGuesses += g;
          acc[s.name].attempts += 1;
          
          const attemptDate = parseDate(effectiveDate);
          if (attemptDate > acc[s.name].lastAttempt) {
            acc[s.name].lastAttempt = attemptDate;
          }
          
          return acc;
        }, {});

        const computeBayesianFinalScore = (playerData) => {
          const { totalGuesses, attempts, lastAttempt } = playerData;
          const BayesAvg = (totalGuesses + globalMean * alpha) / (attempts + alpha);
          const daysSinceLast = Math.floor((currentTime - lastAttempt) / (24 * 60 * 60 * 1000));
          const RecencyFactor = 1 + (daysSinceLast / R);
          const AttemptsBonus = C * Math.log(attempts + 1);
          const finalScore = (BayesAvg * RecencyFactor) - AttemptsBonus;
          return { finalScore };
        };

        const allTimeLeaderboardArray = Object.keys(groupedAllTime).map(name => {
          const { totalGuesses, attempts, lastAttempt } = groupedAllTime[name];
          const actualAverage = totalGuesses / attempts; // Calculate actual average
          const BayesAvg = (totalGuesses + globalMean * alpha) / (attempts + alpha);
          const daysSinceLast = Math.floor((currentTime - lastAttempt) / (24 * 60 * 60 * 1000));
          const RecencyFactor = 1 + (daysSinceLast / R);
          const AttemptsBonus = C * Math.log(attempts + 1);
          const finalScore = (BayesAvg * RecencyFactor) - AttemptsBonus;

          return {
            name,
            finalScore,
            BayesAvg,
            RecencyFactor,
            AttemptsBonus,
            actualAverage, // Include actual average in the data
          };
        }).sort((a, b) => a.finalScore - b.finalScore);

        // Attempts leaderboard
        const allAttemptsLeaderboardArray = Object.keys(groupedAllTime).map(name => ({
          name,
          attempts: groupedAllTime[name].attempts
        })).sort((a, b) => b.attempts - a.attempts);

        // Woodspoon leaderboard - use the combined DNFs
        const groupedWoodspoonScores = allDNFScores.reduce((acc, score) => {
          if (!acc[score.name]) {
            acc[score.name] = { count: 0, entries: [] };
          }
          acc[score.name].count += 1;
          acc[score.name].entries.push({
            date: getEffectiveDate(score),
            wordleNumber: score.wordleNumber,
            guesses: score.guesses
          });
          return acc;
        }, {});
        
        const woodspoonLeaderboardArray = Object.keys(groupedWoodspoonScores).map(name => ({
          name,
          count: groupedWoodspoonScores[name].count,
          entries: groupedWoodspoonScores[name].entries.sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date descending
        })).sort((a, b) => b.count - a.count);

        // Calculate statistics
        const uniquePlayers = new Set(allScores.map(score => score.name));
        const totalPlayers = uniquePlayers.size;
        
        // Active competitors (players who played in the last 7 days)
        const activeCompetitors = new Set(
          allScores
            .filter(score => {
              const effectiveDate = getEffectiveDate(score);
              return effectiveDate && effectiveDate >= weekAgoNZStr;
            })
            .map(score => score.name)
        ).size;

        const totalGames = allScores.length;
        
        // Calculate average score (treating DNF/invalid as 7)
        const totalScore = allScores.reduce((sum, score) => {
          let g = parseFloat(score.guesses);
          if (isNaN(g) || g === 0) g = 7; // Treat as DNF
          return sum + g;
        }, 0);
        const averageScore = totalGames > 0 ? totalScore / totalGames : 0;

        setStats({
          totalPlayers,
          activeCompetitors,
          totalGames,
          averageScore
        });

        setDailyLeaderboard(dailyLeaderboardArray);
        setWeeklyLeaderboard(weeklyLeaderboardArray);
        setAllTimeLeaderboard(allTimeLeaderboardArray);
        setAllAttemptsLeaderboard(allAttemptsLeaderboardArray);
        setWoodspoonLeaderboard(woodspoonLeaderboardArray);
        setLoading(false);

      } catch (error) {
        console.error('Error fetching leaderboards: ', error);
      }
    };

    fetchLeaderboards();
  }, []);

  return (
    <div className={classes.leaderboardContainer}>
      {loading ? (
        <div className={classes.loading}>
          <div className={classes.dancingCat}>🐱</div>
          <div>Loading Wordle results...</div>
        </div>
      ) : (
        <>
          <h1 className={classes.resultsHeader}>Wordle Results</h1>
          
          {/* Statistics Section */}
          <div className={classes.statsContainer}>
            <div className={classes.statCard}>
              <span className={classes.statIcon}>👥</span>
              <div className={classes.statValue}>{stats.totalPlayers}</div>
              <div className={classes.statLabel}>Total Players</div>
            </div>
            
            <div className={classes.statCard}>
              <span className={classes.statIcon}>🎮</span>
              <div className={classes.statValue}>{stats.activeCompetitors}</div>
              <div className={classes.statLabel}>Active Competitors</div>
            </div>
            
            <div className={classes.statCard}>
              <span className={classes.statIcon}>📊</span>
              <div className={classes.statValue}>{stats.totalGames}</div>
              <div className={classes.statLabel}>Total Games</div>
            </div>
            
            <div className={classes.statCard}>
              <span className={classes.statIcon}>🎯</span>
              <div className={classes.statValue}>{stats.averageScore.toFixed(2)}</div>
              <div className={classes.statLabel}>Average Score</div>
            </div>
          </div>
          
          <div className={classes.columns}>

            <section className={classes.col}>
              <h1 className={classes.title}>🏆 Daily Leaderboard</h1>
              <ul className={classes.list}>
                {dailyLeaderboard && dailyLeaderboard.slice(0, 12).map((entry, index) => {
                  const getRankColor = (position) => {
                    if (position === 0) return 'linear-gradient(135deg, #FFD700, #FFA500)'; // Gold
                    if (position === 1) return 'linear-gradient(135deg, #C0C0C0, #A8A8A8)'; // Silver
                    if (position === 2) return 'linear-gradient(135deg, #CD7F32, #B8860B)'; // Bronze
                    return 'linear-gradient(135deg, #667eea, #764ba2)'; // Default purple gradient
                  };
                  
                  return (
                    <li key={index} className={classes.listItem}>
                      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <span 
                          className={classes.rankNumber}
                          style={{ background: getRankColor(index) }}
                        >
                          {index + 1}
                        </span>
                        {/* {index === 0 && <span className={classes.icon}>👑</span>} */}
                        <span className={classes.playerName}>{entry.name}</span>
                        <span className={classes.playerScore} style={{ color: getRankColor(index).includes('FFD700') ? '#B8860B' : '#667eea' }}>
                          {entry.average.toFixed(2)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className={classes.col}>
              <h1 className={classes.title}>📅 Weekly Average</h1>
              <ul className={classes.list}>
                {weeklyLeaderboard && weeklyLeaderboard.slice(0, 12).map((entry, index) => {
                  const getRankColor = (position) => {
                    if (position === 0) return 'linear-gradient(135deg, #FFD700, #FFA500)'; // Gold
                    if (position === 1) return 'linear-gradient(135deg, #C0C0C0, #A8A8A8)'; // Silver
                    if (position === 2) return 'linear-gradient(135deg, #CD7F32, #B8860B)'; // Bronze
                    return 'linear-gradient(135deg, #667eea, #764ba2)'; // Default purple gradient
                  };
                  
                  return (
                    <li key={index} 
                        className={classes.listItem}
                        title={`Played ${entry.playedDays} out of ${entry.totalWeekdays} weekdays. Missed weekdays count as DNF (7 points).`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <span 
                          className={classes.rankNumber}
                          style={{ background: getRankColor(index) }}
                        >
                          {index + 1}
                        </span>
                        <span className={classes.playerName}>{entry.name}</span>
                        <span className={classes.playerScore} style={{ color: getRankColor(index).includes('FFD700') ? '#B8860B' : '#667eea' }}>
                          {entry.average.toFixed(2)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
            <section className={classes.col}>
              <h1 className={classes.title}>
                <span
                  style={{ cursor: 'help' }}
                  title={`Bayesian Average:
      
      The Bayesian Average adjusts a player's average guesses using a global prior (global mean) for fairness, especially when the number of attempts is low.
      
      Formula:
      BayesAvg = (TotalGuesses + (GlobalMean × Alpha)) / (Attempts + Alpha)
      
      - TotalGuesses: The sum of all guesses by the player.
      - GlobalMean: The average number of guesses across all players (used as a prior).
      - Alpha: The prior strength, which determines how much weight is given to the global mean.

      Rot Factor (RecencyFactor):
      Encourages recent activity and penalizes long periods of inactivity.

      Formula:
      RecencyFactor = 1 + (DaysSinceLast / R)
      
      - DaysSinceLast: The number of days since the player's last recorded attempt.
      - R: A scaling factor to control the penalty for inactivity.

      Attempts Bonus:
      A slight penalty applied for more frequent attempts to balance scores.

      Formula:
      AttemptsBonus = C × log(Attempts + 1)
      
      - C: A scaling factor for the penalty.
      `}
                >
                🧮 Bayesian Average
                </span>
              </h1>
              <ul className={classes.list}>
                {allTimeLeaderboard && allTimeLeaderboard.slice(0, 12).map((entry, index) => {
                  const getRankColor = (position) => {
                    if (position === 0) return 'linear-gradient(135deg, #FFD700, #FFA500)'; // Gold
                    if (position === 1) return 'linear-gradient(135deg, #C0C0C0, #A8A8A8)'; // Silver
                    if (position === 2) return 'linear-gradient(135deg, #CD7F32, #B8860B)'; // Bronze
                    return 'linear-gradient(135deg, #667eea, #764ba2)'; // Default purple gradient
                  };
                  
                  return (
                    <li key={index}
                        className={classes.listItem}
                        title={`FinalScore = (BayesAvg x RecencyFactor) - AttemptsBonus
        
        Your Actual Average: ${entry.actualAverage.toFixed(2)}
        
        Formula:
        FinalScore = (${entry.BayesAvg.toFixed(2)} x ${entry.RecencyFactor.toFixed(2)}) - ${entry.AttemptsBonus.toFixed(2)}

        Explanation:
        - Actual Average (${entry.actualAverage.toFixed(2)}): Your raw average score across all attempts.
        - BayesAvg (${entry.BayesAvg.toFixed(2)}): Your average guesses adjusted with a global prior for fairness.
        - RecencyFactor (${entry.RecencyFactor.toFixed(2)}): Rewards recent activity, penalizes inactivity over time.
        - AttemptsBonus (${entry.AttemptsBonus.toFixed(2)}): A slight penalty for more attempts, balancing frequent guesses.`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <span 
                          className={classes.rankNumber}
                          style={{ background: getRankColor(index) }}
                        >
                          {index + 1}
                        </span>
                        <span className={classes.playerName}>{entry.name}</span>
                        <span className={classes.playerScore} style={{ color: getRankColor(index).includes('FFD700') ? '#B8860B' : '#667eea' }}>
                          {entry.finalScore.toFixed(2)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>


            <section className={classes.col}>
              <h1 className={classes.title}>📊 Attempts Leaderboard</h1>
              <ul className={classes.list}>
                {allAttemptsLeaderboard && allAttemptsLeaderboard.slice(0, 12).map((entry, index) => {
                  const getRankColor = (position) => {
                    if (position === 0) return 'linear-gradient(135deg, #FFD700, #FFA500)'; // Gold
                    if (position === 1) return 'linear-gradient(135deg, #C0C0C0, #A8A8A8)'; // Silver
                    if (position === 2) return 'linear-gradient(135deg, #CD7F32, #B8860B)'; // Bronze
                    return 'linear-gradient(135deg, #667eea, #764ba2)'; // Default purple gradient
                  };
                  
                  return (
                    <li key={index} className={classes.listItem}>
                      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <span 
                          className={classes.rankNumber}
                          style={{ background: getRankColor(index) }}
                        >
                          {index + 1}
                        </span>
                        <span className={classes.playerName}>{entry.name}</span>
                        <span className={classes.playerScore} style={{ color: getRankColor(index).includes('FFD700') ? '#B8860B' : '#667eea' }}>
                          {entry.attempts}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className={classes.col}>
              <h1 className={classes.title}>🥄 Wooden Spoon</h1>
              <ul className={classes.list}>
                {woodspoonLeaderboard && woodspoonLeaderboard.slice(0, 12).map((entry, index) => {
                  const getRankColor = (position) => {
                    if (position === 0) return 'linear-gradient(135deg, #CD7F32, #B8860B)'; // Bronze for worst performance
                    if (position === 1) return 'linear-gradient(135deg, #A0A0A0, #888888)'; // Dark silver
                    if (position === 2) return 'linear-gradient(135deg, #808080, #696969)'; // Gray
                    return 'linear-gradient(135deg, #667eea, #764ba2)'; // Default purple gradient
                  };
                  
                  return (
                    <li key={index}
                        className={classes.listItem}
                        title={`Recent DNFs:\n${entry.entries.slice(0, 5).map(e => 
                          `${e.date}${e.wordleNumber ? ` - Wordle #${e.wordleNumber}` : ''} - DNF`
                        ).join('\n')}${entry.entries.length > 5 ? `\n... and ${entry.entries.length - 5} more` : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <span 
                          className={classes.rankNumber}
                          style={{ background: getRankColor(index) }}
                        >
                          {index + 1}
                        </span>
                        {index === 0 && <span className={classes.spoon}>🥄</span>}
                        <span className={classes.playerName}>{entry.name}</span>
                        <span className={classes.playerScore} style={{ color: getRankColor(index).includes('CD7F32') ? '#8B4513' : '#667eea' }}>
                          {entry.count}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

          </div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;

import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from './firebase';
import { BounceLoader } from 'react-spinners';

const useStyles = createUseStyles({
  leaderboardContainer: {
    padding: '0',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  
  header: {
    textAlign: 'center',
    marginBottom: 'var(--space-12)',
    position: 'relative',
  },
  
  headerTitle: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: '0 0 var(--space-3) 0',
    letterSpacing: '-0.02em',
    background: 'var(--gradient-hero)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textFillColor: 'transparent',
  },
  
  headerSubtitle: {
    fontSize: '1.2rem',
    color: 'var(--text-secondary)',
    fontWeight: '400',
    margin: 0,
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 'var(--space-8)',
    marginBottom: 'var(--space-12)',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: 'var(--space-6)',
    },
  },
  
  statCard: {
    background: 'var(--card-bg)',
    borderRadius: 'var(--radius-2xl)',
    padding: 'var(--space-8)',
    boxShadow: 'var(--shadow-medium)',
    border: '1px solid var(--border-light)',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 'var(--shadow-large)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'var(--gradient-hero)',
    }
  },
  
  statCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    marginBottom: 'var(--space-4)',
  },
  
  statIcon: {
    fontSize: '1.5rem',
    padding: 'var(--space-3)',
    borderRadius: 'var(--radius-lg)',
    background: 'rgba(106, 170, 100, 0.1)',
    color: 'var(--wordle-green)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '48px',
    minHeight: '48px',
  },
  
  statTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0,
  },
  
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--wordle-green)',
    margin: '0 0 var(--space-2) 0',
    lineHeight: 1,
  },
  
  
  leaderboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: 'var(--space-8)',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: 'var(--space-6)',
    },
  },
  
  leaderboardCard: {
    background: 'var(--card-bg)',
    borderRadius: 'var(--radius-2xl)',
    boxShadow: 'var(--shadow-medium)',
    border: '1px solid var(--border-light)',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: 'var(--shadow-large)',
    }
  },
  
  cardHeader: {
    padding: 'var(--space-6) var(--space-6) var(--space-4)',
    borderBottom: '1px solid var(--border-light)',
    background: 'linear-gradient(135deg, rgba(106, 170, 100, 0.05) 0%, rgba(201, 180, 88, 0.05) 100%)',
  },
  
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: '0 0 var(--space-1) 0',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  },
  
  cardSubtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  
  leaderboardList: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    maxHeight: '400px',
    overflowY: 'auto',
  },
  
  leaderboardItem: {
    padding: 'var(--space-4) var(--space-6)',
    borderBottom: '1px solid var(--border-light)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
    transition: 'all 0.2s ease',
    background: 'var(--secondary-bg)',
    '&:hover': {
      background: 'rgba(106, 170, 100, 0.05)',
    },
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  
  rank: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    minWidth: '32px',
    textAlign: 'center',
  },
  
  rankFirst: {
    color: '#FFD700',
    fontSize: '1.3rem',
  },
  
  rankSecond: {
    color: '#C0C0C0',
    fontSize: '1.2rem',
  },
  
  rankThird: {
    color: '#CD7F32',
    fontSize: '1.15rem',
  },
  
  playerInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)',
  },
  
  playerName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0,
  },
  
  playerStats: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  
  scoreDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    fontSize: '1.1rem',
    fontWeight: '600',
  },
  
  scoreIcon: {
    fontSize: '1.2rem',
  },
  
  loading: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    gap: 'var(--space-4)',
  },
  
  loadingText: {
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
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

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  const getRankClass = (index) => {
    switch (index) {
      case 0: return classes.rankFirst;
      case 1: return classes.rankSecond;
      case 2: return classes.rankThird;
      default: return '';
    }
  };

  const getScoreIcon = (average) => {
    if (average <= 2.5) return '🎯';
    if (average <= 3.5) return '🔥';
    if (average <= 4.5) return '⭐';
    if (average <= 5.5) return '👍';
    return '🤔';
  };

  const totalPlayers = allTimeLeaderboard.length;
  const totalGames = allAttemptsLeaderboard.reduce((sum, player) => sum + player.attempts, 0);
  const avgScore = allTimeLeaderboard.length > 0 
    ? allTimeLeaderboard.reduce((sum, player) => sum + player.average, 0) / allTimeLeaderboard.length 
    : 0;

  return (
    <div className={classes.leaderboardContainer}>
      {loading ? (
        <div className={classes.loading}>
          <BounceLoader color="var(--wordle-green)" size={40} />
          <div className={classes.loadingText}>Loading leaderboards...</div>
        </div>
      ) : (
        <>
          <div className={classes.header}>
            <h1 className={classes.headerTitle}>Leaderboard</h1>
            <p className={classes.headerSubtitle}>
              See how you stack up against your fellow Wordle enthusiasts
            </p>
          </div>

          {/* Stats Overview */}
          <div className={classes.statsGrid}>
            <div className={classes.statCard}>
              <div className={classes.statCardHeader}>
                <div className={classes.statIcon}>👥</div>
                <div className={classes.statTitle}>Total Players</div>
              </div>
              <div className={classes.statValue}>{totalPlayers}</div>
              <div className={classes.statSubtitle}>Active competitors</div>
            </div>
            
            <div className={classes.statCard}>
              <div className={classes.statCardHeader}>
                <div className={classes.statIcon}>🎮</div>
                <div className={classes.statTitle}>Total Games</div>
              </div>
              <div className={classes.statValue}>{totalGames}</div>
              <div className={classes.statSubtitle}>Games played</div>
            </div>
            
            <div className={classes.statCard}>
              <div className={classes.statCardHeader}>
                <div className={classes.statIcon}>📊</div>
                <div className={classes.statTitle}>Average Score</div>
              </div>
              <div className={classes.statValue}>{avgScore.toFixed(2)}</div>
              <div className={classes.statSubtitle}>Across all players</div>
            </div>
          </div>

          {/* Leaderboards */}
          <div className={classes.leaderboardGrid}>
            {/* Daily Leaderboard */}
            <div className={classes.leaderboardCard}>
              <div className={classes.cardHeader}>
                <h2 className={classes.cardTitle}>
                  🌅 Today's Leaders
                </h2>
                <p className={classes.cardSubtitle}>Best performers today</p>
              </div>
              <ul className={classes.leaderboardList}>
                {dailyLeaderboard.slice(0, 10).map((entry, index) => (
                  <li key={index} className={classes.leaderboardItem}>
                    <div className={`${classes.rank} ${getRankClass(index)}`}>
                      {getRankIcon(index)}
                    </div>
                    <div className={classes.playerInfo}>
                      <div className={classes.playerName}>{entry.name}</div>
                      <div className={classes.playerStats}>
                        {entry.attempts} game{entry.attempts !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className={classes.scoreDisplay}>
                      <span className={classes.scoreIcon}>{getScoreIcon(entry.average)}</span>
                      <span>{entry.average.toFixed(2)}</span>
                    </div>
                  </li>
                ))}
                {dailyLeaderboard.length === 0 && (
                  <li className={classes.leaderboardItem}>
                    <div style={{textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)'}}>
                      No games played today yet
                    </div>
                  </li>
                )}
              </ul>
            </div>

            {/* Weekly Leaderboard */}
            <div className={classes.leaderboardCard}>
              <div className={classes.cardHeader}>
                <h2 className={classes.cardTitle}>
                  📅 This Week
                </h2>
                <p className={classes.cardSubtitle}>7-day performance</p>
              </div>
              <ul className={classes.leaderboardList}>
                {weeklyLeaderboard.slice(0, 10).map((entry, index) => (
                  <li key={index} className={classes.leaderboardItem}>
                    <div className={`${classes.rank} ${getRankClass(index)}`}>
                      {getRankIcon(index)}
                    </div>
                    <div className={classes.playerInfo}>
                      <div className={classes.playerName}>{entry.name}</div>
                      <div className={classes.playerStats}>
                        {entry.playedDays}/{entry.totalWeekdays} weekdays
                      </div>
                    </div>
                    <div className={classes.scoreDisplay}>
                      <span className={classes.scoreIcon}>{getScoreIcon(entry.average)}</span>
                      <span>{entry.average.toFixed(2)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* All-Time Leaderboard */}
            <div className={classes.leaderboardCard}>
              <div className={classes.cardHeader}>
                <h2 className={classes.cardTitle}>
                  🏆 All-Time Champions
                </h2>
                <p className={classes.cardSubtitle}>Bayesian-adjusted rankings</p>
              </div>
              <ul className={classes.leaderboardList}>
                {allTimeLeaderboard.slice(0, 10).map((entry, index) => (
                  <li key={index} className={classes.leaderboardItem}>
                    <div className={`${classes.rank} ${getRankClass(index)}`}>
                      {getRankIcon(index)}
                    </div>
                    <div className={classes.playerInfo}>
                      <div className={classes.playerName}>{entry.name}</div>
                      <div className={classes.playerStats}>
                        {entry.attempts} games • Rot: {entry.rotFactor.toFixed(2)}
                      </div>
                    </div>
                    <div className={classes.scoreDisplay}>
                      <span className={classes.scoreIcon}>{getScoreIcon(entry.bayesianAverage)}</span>
                      <span>{entry.bayesianAverage.toFixed(2)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Most Active Players */}
            <div className={classes.leaderboardCard}>
              <div className={classes.cardHeader}>
                <h2 className={classes.cardTitle}>
                  🚀 Most Active
                </h2>
                <p className={classes.cardSubtitle}>Players by total games</p>
              </div>
              <ul className={classes.leaderboardList}>
                {allAttemptsLeaderboard.slice(0, 10).map((entry, index) => (
                  <li key={index} className={classes.leaderboardItem}>
                    <div className={`${classes.rank} ${getRankClass(index)}`}>
                      {getRankIcon(index)}
                    </div>
                    <div className={classes.playerInfo}>
                      <div className={classes.playerName}>{entry.name}</div>
                      <div className={classes.playerStats}>
                        Avg: {entry.average.toFixed(2)}
                      </div>
                    </div>
                    <div className={classes.scoreDisplay}>
                      <span className={classes.scoreIcon}>🎯</span>
                      <span>{entry.attempts}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Wooden Spoon */}
            {woodspoonLeaderboard.length > 0 && (
              <div className={classes.leaderboardCard}>
                <div className={classes.cardHeader}>
                  <h2 className={classes.cardTitle}>
                    🥄 Wooden Spoon
                  </h2>
                  <p className={classes.cardSubtitle}>Most DNFs this week</p>
                </div>
                <ul className={classes.leaderboardList}>
                  {woodspoonLeaderboard.slice(0, 5).map((entry, index) => (
                    <li key={index} className={classes.leaderboardItem}>
                      <div className={classes.rank}>
                        🥄
                      </div>
                      <div className={classes.playerInfo}>
                        <div className={classes.playerName}>{entry.name}</div>
                        <div className={classes.playerStats}>
                          {entry.totalDNFs} DNF{entry.totalDNFs !== 1 ? 's' : ''} out of {entry.attempts}
                        </div>
                      </div>
                      <div className={classes.scoreDisplay}>
                        <span className={classes.scoreIcon}>🚫</span>
                        <span>{((entry.totalDNFs / entry.attempts) * 100).toFixed(0)}%</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
                              : 'white',
                    }}
                  >
                    {index === 0 && <span className={classes.icon}>👑</span>}
                    #{index + 1} {entry.name}: {entry.average.toFixed(2)}
                  </li>
                ))}
              </ul>
            </section>

            <section className={classes.col}>
              <h1 className={classes.title}>Weekly Average Leaderboard</h1>
              <ul className={classes.list}>
                {weeklyLeaderboard && weeklyLeaderboard.slice(0, 12).map((entry, index) => (
                  <li key={index}
                    className={`${classes.listItem} ${index === Math.min(weeklyLeaderboard.length - 1, 11) ? classes.listItemLast : ''}`}
                    style={{
                      fontWeight: index < 3 ? 'bold' : 'normal',
                      color: index === 0 ? '#F9A602'
                        : index === 1 ? '#848482'
                          : index === 2 ? '#CD7F32'
                            : index > 2 && index < grayShades.length ? grayShades[index]
                              : 'white',
                    }}
                    title={`Played ${entry.playedDays} out of ${entry.totalWeekdays} weekdays. Missed weekdays count as DNF (7 points).`}
                  >
                    {index === 0 && <span className={classes.icon}>👑</span>}
                    #{index + 1} {entry.name}: {entry.average.toFixed(2)}
                  </li>
                ))}
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
                Bayesian Average Leaderboard
                </span>
              </h1>
              <ul className={classes.list}>
                {allTimeLeaderboard && allTimeLeaderboard.slice(0, 12).map((entry, index) => (
                  <li
                    key={index}
                    className={`${classes.listItem} ${index === Math.min(allTimeLeaderboard.length - 1, 11) ? classes.listItemLast : ''}`}
                    style={{
                      fontWeight: index < 3 ? 'bold' : 'normal',
                      color: index === 0 ? '#F9A602'
                        : index === 1 ? '#848482'
                          : index === 2 ? '#CD7F32'
                            : index > 2 && index < grayShades.length ? grayShades[index]
                              : 'white',
                    }}
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
                    {index === 0 && <span className={classes.icon}>👑</span>}
                    #{index + 1} {entry.name}: {entry.finalScore.toFixed(2)}
                  </li>
                ))}
              </ul>
            </section>


            <section className={classes.col}>
              <h1 className={classes.title}>Attempts Leaderboard</h1>
              <ul className={classes.list}>
                {allAttemptsLeaderboard && allAttemptsLeaderboard.slice(0, 12).map((entry, index) => (
                  <li key={index}
                    className={`${classes.listItem} ${index === Math.min(allAttemptsLeaderboard.length - 1, 11) ? classes.listItemLast : ''}`}
                    style={{
                      fontWeight: index < 3 ? 'bold' : 'normal',
                      color: index === 0 ? '#F9A602'
                        : index === 1 ? '#848482'
                          : index === 2 ? '#CD7F32'
                            : index > 2 && index < grayShades.length ? grayShades[index]
                              : 'white',
                    }}
                  >
                    {index === 0 && <span className={classes.icon}>👑</span>}
                    #{index + 1} {entry.name}: {entry.attempts}
                  </li>
                ))}
              </ul>
            </section>

            <section className={classes.col}>
              <h1 className={classes.title}>Wooden Spoon Leaderboard</h1>
              <ul className={classes.list}>
                {woodspoonLeaderboard && woodspoonLeaderboard.slice(0, 12).map((entry, index) => (
                  <li key={index}
                    className={`${classes.listItem} ${index === Math.min(woodspoonLeaderboard.length - 1, 11) ? classes.listItemLast : ''}`}
                    style={{
                      fontWeight: index < 3 ? 'bold' : 'normal',
                      color: index === 0 ? '#F9A602'
                        : index === 1 ? '#848482'
                          : index === 2 ? '#CD7F32'
                            : index > 2 && index < grayShades.length ? grayShades[index]
                              : 'white',
                    }}
                    title={`Recent DNFs:\n${entry.entries.slice(0, 5).map(e => 
                      `${e.date}${e.wordleNumber ? ` - Wordle #${e.wordleNumber}` : ''} - DNF`
                    ).join('\n')}${entry.entries.length > 5 ? `\n... and ${entry.entries.length - 5} more` : ''}`}
                  >
                    {index === 0 && <span className={classes.spoon}>🥄</span>}
                    #{index + 1} {entry.name}: {entry.count}
                  </li>
                ))}
              </ul>
            </section>

          </div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;

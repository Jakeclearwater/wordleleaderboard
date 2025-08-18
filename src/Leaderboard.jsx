import { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from './firebase';

const useStyles = createUseStyles({
  leaderboardContainer: {
    padding: '0',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-8)',
  },
  
  header: {
    textAlign: 'center',
    marginBottom: 'var(--space-8)',
    position: 'relative',
  },
  
  headerTitle: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: '800',
    color: 'var(--text-primary, #1f2937)',
    margin: '0 0 var(--space-3) 0',
    letterSpacing: '-0.02em',
    // Remove gradient text effect for better visibility
    // background: 'var(--gradient-hero)',
    // backgroundClip: 'text',
    // WebkitBackgroundClip: 'text',
    // WebkitTextFillColor: 'transparent',
    // textFillColor: 'transparent',
  },
  
  headerSubtitle: {
    fontSize: '1.2rem',
    color: 'var(--text-secondary, #6b7280)',
    fontWeight: '400',
    margin: 0,
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 'var(--space-6)',
    marginBottom: 'var(--space-8)',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: 'var(--space-4)',
    },
  },
  
  dancingCat: {
    fontSize: '5rem',
    lineHeight: '1',
    marginBottom: '1rem',
    display: 'inline-block',
    animation: '$catDance 1.2s infinite linear',
    transformOrigin: '50% 60%',
  },
  
  '@keyframes catDance': {
    '0%': { transform: 'rotate(-20deg) scale(1)' },
    '20%': { transform: 'rotate(20deg) scale(1.1)' },
    '40%': { transform: 'rotate(-20deg) scale(1.05)' },
    '60%': { transform: 'rotate(20deg) scale(1.1)' },
    '80%': { transform: 'rotate(-20deg) scale(1)' },
    '100%': { transform: 'rotate(-20deg) scale(1)' },
  },
  
  statCard: {
    background: 'var(--card-bg, #ffffff)',
    borderRadius: 'var(--radius-2xl, 1rem)',
    padding: 'var(--space-8, 2rem)',
    boxShadow: 'var(--shadow-medium, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06))',
    border: '1px solid var(--border-light, #e5e7eb)',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 'var(--shadow-large, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05))',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: props => props.gradient,
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
    padding: 'var(--space-3, 0.75rem)',
    borderRadius: 'var(--radius-lg, 0.5rem)',
    background: 'rgba(106, 170, 100, 0.1)',
    color: 'var(--wordle-green, #6aaa64)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '48px',
    minHeight: '48px',
  },
  
  statTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--text-primary, #1f2937)',
    margin: 0,
  },
  
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--wordle-green, #6aaa64)',
    margin: '0 0 var(--space-2) 0',
    lineHeight: 1,
  },
  
  statSubtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary, #6b7280)',
    margin: 0,
  },
  
  leaderboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 'var(--space-6)',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: 'var(--space-4)',
    },
  },
  
  leaderboardCard: {
    background: 'var(--card-bg, #ffffff)',
    borderRadius: 'var(--radius-2xl, 1rem)',
    boxShadow: 'var(--shadow-medium, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06))',
    border: '1px solid var(--border-light, #e5e7eb)',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: 'var(--shadow-large, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05))',
    }
  },
  
  cardHeader: {
    padding: 'var(--space-6, 1.5rem) var(--space-6, 1.5rem) var(--space-4, 1rem)',
    borderBottom: '1px solid var(--border-light, #e5e7eb)',
    background: 'linear-gradient(135deg, rgba(106, 170, 100, 0.05) 0%, rgba(201, 180, 88, 0.05) 100%)',
  },
  
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--text-primary, #1f2937)',
    margin: '0 0 var(--space-1, 0.25rem) 0',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2, 0.5rem)',
  },
  
  cardSubtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary, #6b7280)',
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
    padding: 'var(--space-4, 1rem) var(--space-6, 1.5rem)',
    borderBottom: '1px solid var(--border-light, #e5e7eb)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4, 1rem)',
    transition: 'all 0.2s ease',
    background: 'transparent',
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
    color: 'var(--text-secondary, #6b7280)',
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
    gap: 'var(--space-1, 0.25rem)',
  },
  
  playerName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--text-primary, #1f2937)',
    margin: 0,
  },
  
  playerStats: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary, #6b7280)',
    margin: 0,
  },
  
  scoreDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2, 0.5rem)',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--text-primary, #1f2937)',
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
    gap: 'var(--space-4, 1rem)',
  },
  
  loadingText: {
    fontSize: '1.1rem',
    color: 'var(--text-secondary, #6b7280)',
    fontWeight: '500',
  },
});

const Leaderboard = ({ getCurrentGradient }) => {
  // Pass dynamic gradient into JSS props
  const classes = useStyles({ gradient: getCurrentGradient() });
  const [dailyLeaderboard, setDailyLeaderboard] = useState([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState([]);
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState([]);
  const [rawAverageLeaderboard, setRawAverageLeaderboard] = useState([]);
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
            return new Intl.DateTimeFormat('en-CA', {
              timeZone: 'Pacific/Auckland',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).format(new Date(score.isoDate));
          }
          return null;
        };

        // Filter scores by time periods
        const dailyScores = allScores.filter(score => {
          const effectiveDate = getEffectiveDate(score);
          return effectiveDate === todayNZ;
        });

        const weeklyScores = allScores.filter(score => {
          const effectiveDate = getEffectiveDate(score);
          return effectiveDate && effectiveDate >= weekAgoNZStr && effectiveDate <= todayNZ;
        });

        const allTimeScores = allScores.filter(score => getEffectiveDate(score)); // Only include scores with valid dates

        // Simple grouping function for daily leaderboards
        const groupScoresSimple = (scores) => {
          const grouped = scores.reduce((acc, score) => {
            if (!acc[score.name]) {
              acc[score.name] = { totalGuesses: 0, attempts: 0, earliest: null };
            }
            let guesses = parseFloat(score.guesses);
            if (isNaN(guesses) || guesses === 0) {
              guesses = 7; // DNF = 7
            }
            acc[score.name].totalGuesses += guesses;
            acc[score.name].attempts += 1;
            // Track earliest submission time
            let dateObj = null;
            if (score.isoDate) {
              dateObj = new Date(score.isoDate);
            } else if (score.timestamp && score.timestamp.toDate) {
              dateObj = score.timestamp.toDate();
            } else if (score.timestamp) {
              dateObj = new Date(score.timestamp);
            }
            if (dateObj && (!acc[score.name].earliest || dateObj < acc[score.name].earliest)) {
              acc[score.name].earliest = dateObj;
            }
            return acc;
          }, {});

          return Object.keys(grouped)
            .map(name => ({
              name,
              average: grouped[name].totalGuesses / grouped[name].attempts,
              attempts: grouped[name].attempts,
              earliest: grouped[name].earliest
            }))
            .filter(player => player.attempts > 0);
        };

        // Weekly grouping - simplified to just average the games played
        const groupWeeklyScores = (scores, weekStart, weekEnd) => {
          // Build set of 5 most recent weekdays (Mon-Fri) up to today
          const daysInWeek = [];
          let d = new Date(weekEnd); // weekEnd is todayNZ
          while (daysInWeek.length < 5) {
            const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
            if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Mon-Fri only
              daysInWeek.unshift(new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Pacific/Auckland',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              }).format(d));
            }
            d.setDate(d.getDate() - 1);
          }

          // Only consider scores from those 5 weekdays
          // For each player, for each day, keep only the best score (lowest guesses)
          const bestScoresByPlayerDay = {};
          scores.forEach(score => {
            const effectiveDate = getEffectiveDate(score);
            if (!effectiveDate || !daysInWeek.includes(effectiveDate)) return;
            const name = score.name;
            let guesses = parseFloat(score.guesses);
            if (isNaN(guesses) || guesses === 0) {
              guesses = 7; // DNF = 7
            }
            if (!bestScoresByPlayerDay[name]) bestScoresByPlayerDay[name] = {};
            // If multiple scores for the same day, keep the lowest
            if (
              bestScoresByPlayerDay[name][effectiveDate] === undefined ||
              guesses < bestScoresByPlayerDay[name][effectiveDate]
            ) {
              bestScoresByPlayerDay[name][effectiveDate] = guesses;
            }
          });

          // Now build grouped data
          const grouped = {};
          Object.keys(bestScoresByPlayerDay).forEach(name => {
            const scoresObj = bestScoresByPlayerDay[name];
            const playedDaysArr = Object.keys(scoresObj);
            const playedDays = new Set(playedDaysArr);
            let totalGuesses = 0;
            // Sum best scores for played days
            playedDaysArr.forEach(day => {
              totalGuesses += scoresObj[day];
            });
            // Add DNF (7) for each missing day
            const missingDays = daysInWeek.filter(day => !playedDays.has(day));
            totalGuesses += missingDays.length * 7;
            // Total games is always 5
            grouped[name] = {
              totalGuesses,
              playedDays: playedDays.size,
              attempts: 5 // always 5 (played + DNF)
            };
          });

          return Object.keys(grouped)
            .map(name => {
              const player = grouped[name];
              return {
                name,
                average: player.totalGuesses / player.attempts,
                attempts: player.playedDays, // only count played days for games
                playedDays: player.playedDays,
                totalGames: player.playedDays // only count played days for games
              };
            })
            .filter(player => player.playedDays > 0);
        };

        const dailyLeaderboardArray = groupScoresSimple(dailyScores)
          .sort((a, b) => {
            if (a.average !== b.average) return a.average - b.average;
            if (a.earliest && b.earliest) return a.earliest - b.earliest;
            return 0;
          });

        const weeklyLeaderboardArray = groupWeeklyScores(weeklyScores, weekAgoNZStr, todayNZ)
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
        const currentTime = new Date();

        // Group for all-time leaderboard - simplified approach
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
            acc[s.name] = { totalGuesses: 0, attempts: 0, lastAttempt: new Date(effectiveDate) };
          }
          
          acc[s.name].totalGuesses += g;
          acc[s.name].attempts += 1;
          
          const attemptDate = new Date(effectiveDate);
          if (attemptDate > acc[s.name].lastAttempt) {
            acc[s.name].lastAttempt = attemptDate;
          }
          
          return acc;
        }, {});

        // Calculate Bayesian averages with proper sorting
        const allTimeLeaderboardArray = Object.keys(groupedAllTime)
          .map(name => {
            const player = groupedAllTime[name];
            const rawAverage = player.totalGuesses / player.attempts;

            // Make alpha (global mean weight) more sensitive to attempts
            // const alpha = Math.min(20, Math.max(5, player.attempts * 0.3)); // Stronger effect: more games, less prior
            const alpha = 20;
            const bayesianAverage = (player.totalGuesses + (globalMean * alpha)) / (player.attempts + alpha);

            // Recency factor: decay over 15 days (was 30)
            const daysSinceLastAttempt = Math.max(0, (currentTime - player.lastAttempt) / (1000 * 60 * 60 * 24));
            // const recencyFactor = Math.exp(-daysSinceLastAttempt / 15); // Faster decay
            const R = 30;
            const C = 0.2;
            const recencyFactor = 1 + (daysSinceLastAttempt / R);
            const AttemptsBonus = C * Math.log(player.attempts + 1);
            // const confidenceFactor = Math.min(1, player.attempts / R);
            const adjustedScore = (bayesianAverage * recencyFactor) - AttemptsBonus;

            return {
              name,
              bayesianAverage,
              rawAverage,
              recencyFactor,
              adjustedScore,
              attempts: player.attempts,
              average: rawAverage,
              lastAttempt: player.lastAttempt
            };
          })
          .filter(player => player.attempts >= 3) // Minimum 3 games to qualify
          .sort((a, b) => a.adjustedScore - b.adjustedScore); // Sort by adjusted score (lower is better)

        // Simple raw average leaderboard (minimum 5 games)
        const rawAverageLeaderboard = Object.keys(groupedAllTime)
          .map(name => {
            const player = groupedAllTime[name];
            return {
              name,
              attempts: player.attempts,
              average: player.totalGuesses / player.attempts
            };
          })
          .filter(player => player.attempts >= 5) // Minimum 5 games for raw average
          .sort((a, b) => a.average - b.average); // Sort by raw average (lower is better)

        const allAttemptsLeaderboardArray = Object.keys(groupedAllTime).map(name => {
          const player = groupedAllTime[name];
          return {
            name,
            attempts: player.attempts,
            average: player.totalGuesses / player.attempts
          };
        }).sort((a, b) => b.attempts - a.attempts);

        // Wooden spoon leaderboard (most DNFs this week)
        const woodspoonData = weeklyScores.reduce((acc, score) => {
          if (!acc[score.name]) {
            acc[score.name] = { totalDNFs: 0, attempts: 0 };
          }
          const guesses = parseFloat(score.guesses);
          if (isNaN(guesses) || guesses === 0 || guesses === 7 || score.dnf) {
            acc[score.name].totalDNFs += 1;
          }
          acc[score.name].attempts += 1;
          return acc;
        }, {});

        const woodspoonLeaderboardArray = Object.keys(woodspoonData)
          .map(name => ({
            name,
            totalDNFs: woodspoonData[name].totalDNFs,
            attempts: woodspoonData[name].attempts
          }))
          .filter(entry => entry.totalDNFs > 0)
          .sort((a, b) => b.totalDNFs - a.totalDNFs);

        setDailyLeaderboard(dailyLeaderboardArray);
        setWeeklyLeaderboard(weeklyLeaderboardArray);
        setAllTimeLeaderboard(allTimeLeaderboardArray);
        setRawAverageLeaderboard(rawAverageLeaderboard);
        setAllAttemptsLeaderboard(allAttemptsLeaderboardArray);
        setWoodspoonLeaderboard(woodspoonLeaderboardArray);
      } catch (error) {
        console.error('Error fetching leaderboards:', error);
      } finally {
        setLoading(false);
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
          <div className={classes.dancingCat} style={{ fontSize: '5rem', lineHeight: '1', marginBottom: '1rem' }}>🐱</div>
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
                  <span title="Shows the best average score for each player for today&apos;s Wordle. Only games played today are counted. DNF (Did Not Finish) is scored as 7. If a player submits multiple scores, all are averaged.">
                    🛈
                  </span>
                </h2>
                <p className={classes.cardSubtitle}>Best performers today</p>
              </div>
              <ul className={classes.leaderboardList}>
                {dailyLeaderboard.slice(0, 20).map((entry, index) => (
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
                    <div style={{textAlign: 'center', padding: 'var(--space-8, 2rem)', color: 'var(--text-muted, #9ca3af)', width: '100%'}}>
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
                  <span title="Shows the best average score for each player over the 5 most recent weekdays (Mon-Fri). For each day, only the best score is counted. Missing days are scored as DNF (7). Only played days are shown as games.">
                    🛈
                  </span>
                </h2>
                <p className={classes.cardSubtitle}>5-day performance (Mon-Fri)</p>
              </div>
              <ul className={classes.leaderboardList}>
                {weeklyLeaderboard.slice(0, 20).map((entry, index) => (
                  <li key={index} className={classes.leaderboardItem}>
                    <div className={`${classes.rank} ${getRankClass(index)}`}>
                      {getRankIcon(index)}
                    </div>
                    <div className={classes.playerInfo}>
                      <div className={classes.playerName}>{entry.name}</div>
                      <div className={classes.playerStats}>
                        {entry.playedDays} day{entry.playedDays !== 1 ? 's' : ''} • {entry.totalGames} game{entry.totalGames !== 1 ? 's' : ''}
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
                  <span title="Ranks players by Bayesian average: combines your actual average, a global average prior, and a recency penalty (scores 'rot' if you are inactive). Minimum 3 games required. Lower scores are better.">
                    🛈
                  </span>
                </h2>
                <p className={classes.cardSubtitle}>Bayesian-adjusted rankings</p>
              </div>
              <ul className={classes.leaderboardList}>
                {allTimeLeaderboard.slice(0, 20).map((entry, index) => (
                  <li key={index} className={classes.leaderboardItem}>
                    <div className={`${classes.rank} ${getRankClass(index)}`}>
                      {getRankIcon(index)}
                    </div>
                    <div className={classes.playerInfo}>
                      <div className={classes.playerName}>{entry.name}</div>
                      <div className={classes.playerStats}>
                        {entry.attempts} games • Raw: {entry.rawAverage.toFixed(2)}
                      </div>
                    </div>
                    <div className={classes.scoreDisplay}>
                      <span className={classes.scoreIcon}>{getScoreIcon(entry.adjustedScore)}</span>
                      <span>{entry.adjustedScore.toFixed(2)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Raw Average Leaderboard */}
            <div className={classes.leaderboardCard}>
              <div className={classes.cardHeader}>
                <h2 className={classes.cardTitle}>
                  📈 Pure Averages
                  <span title="Shows the raw average score for each player with at least 5 games. No Bayesian adjustment or recency penalty. DNF (Did Not Finish) is scored as 7.">
                    🛈
                  </span>
                </h2>
                <p className={classes.cardSubtitle}>Raw averages (5+ games)</p>
              </div>
              <ul className={classes.leaderboardList}>
                {rawAverageLeaderboard.slice(0, 20).map((entry, index) => (
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
              </ul>
            </div>

            {/* Most Active Players */}
            <div className={classes.leaderboardCard}>
              <div className={classes.cardHeader}>
                <h2 className={classes.cardTitle}>
                  🚀 Most Active
                  <span title="Lists players by total games played. Shows their average score. All games count, including DNFs (scored as 7).">
                    🛈
                  </span>
                </h2>
                <p className={classes.cardSubtitle}>Players by total games</p>
              </div>
              <ul className={classes.leaderboardList}>
                {allAttemptsLeaderboard.slice(0, 20).map((entry, index) => (
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
                    <span title="Shows players with the most DNFs (Did Not Finish, scored as 7) this week. Only games from the 5 most recent weekdays are counted.">
                      🛈
                    </span>
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
};

export default Leaderboard;

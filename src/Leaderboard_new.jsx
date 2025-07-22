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
  
  statSubtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    margin: 0,
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

        // Simple grouping function for daily and weekly leaderboards
        const groupScoresSimple = (scores) => {
          const grouped = scores.reduce((acc, score) => {
            if (!acc[score.name]) {
              acc[score.name] = { totalGuesses: 0, attempts: 0 };
            }
            acc[score.name].totalGuesses += parseFloat(score.guesses) || 7; // DNF = 7
            acc[score.name].attempts += 1;
            return acc;
          }, {});

          return Object.keys(grouped).map(name => ({
            name,
            average: grouped[name].totalGuesses / grouped[name].attempts,
            attempts: grouped[name].attempts
          }));
        };

        // Weekly grouping that counts missing weekdays as DNF
        const groupWeeklyScores = (scores) => {
          const grouped = scores.reduce((acc, score) => {
            if (!acc[score.name]) {
              acc[score.name] = { totalGuesses: 0, attempts: 0, playedDays: new Set() };
            }
            acc[score.name].totalGuesses += parseFloat(score.guesses) || 7;
            acc[score.name].attempts += 1;
            
            const effectiveDate = getEffectiveDate(score);
            if (effectiveDate) {
              acc[score.name].playedDays.add(effectiveDate);
            }
            return acc;
          }, {});

          // Count weekdays in the period
          const startDate = new Date(weekAgoNZStr);
          const endDate = new Date(todayNZ);
          let weekdays = 0;
          for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
              weekdays++;
            }
          }

          return Object.keys(grouped).map(name => {
            const player = grouped[name];
            const playedDays = player.playedDays.size;
            const missedDays = weekdays - playedDays;
            const totalScore = player.totalGuesses + (missedDays * 7); // Add 7 for each missed day
            const totalAttempts = weekdays; // Total possible attempts

            return {
              name,
              average: totalScore / totalAttempts,
              attempts: player.attempts,
              playedDays,
              totalWeekdays: weekdays
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

        const allTimeLeaderboardArray = Object.keys(groupedAllTime).map(name => {
          const player = groupedAllTime[name];
          const daysSinceLastAttempt = Math.max(0, (currentTime - player.lastAttempt) / (1000 * 60 * 60 * 24));
          const rotFactor = Math.exp(-daysSinceLastAttempt / R);
          const attemptsBonus = Math.log(1 + C * player.attempts);
          const bayesianAverage = (player.totalGuesses + (globalMean * alpha)) / (player.attempts + alpha);
          const adjustedScore = bayesianAverage * rotFactor + attemptsBonus;

          return {
            name,
            bayesianAverage,
            rotFactor,
            attemptsBonus,
            adjustedScore,
            attempts: player.attempts,
            average: player.totalGuesses / player.attempts
          };
        }).sort((a, b) => a.adjustedScore - b.adjustedScore);

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
};

export default Leaderboard;

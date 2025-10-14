import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from './firebase';
import useStyles from "./useStyles";
import wordleLogo from './assets/wordle.png';

const Leaderboard = ({ getCurrentGradient }) => {
  const classes = useStyles();
  
  // Set the gradient as a CSS custom property
  useEffect(() => {
    document.documentElement.style.setProperty('--dynamic-gradient', getCurrentGradient());
  }, [getCurrentGradient]);

  const [dailyLeaderboard, setDailyLeaderboard] = useState([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState([]);
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState([]);
  const [rawAverageLeaderboard, setRawAverageLeaderboard] = useState([]);
  const [allAttemptsLeaderboard, setAllAttemptsLeaderboard] = useState([]);
  const [woodspoonLeaderboard, setWoodspoonLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState(null);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      // Cache for 5 minutes
      const now = Date.now();
      if (lastFetch && (now - lastFetch) < 5 * 60 * 1000) {
        setLoading(false);
        return;
      }
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
        console.log('📊 Fetching leaderboard data...');
        const allScoresQuery = collection(firestore, 'scores');
        const allScoresSnapshot = await getDocs(allScoresQuery);
        const allScores = allScoresSnapshot.docs.map(doc => doc.data());
        console.log(`📊 Loaded ${allScores.length} scores, processing leaderboards...`);

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

        // Wooden spoon leaderboard (most DNFs all time)
        const woodspoonData = allTimeScores.reduce((acc, score) => {
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
            attempts: woodspoonData[name].attempts,
            percentage: (woodspoonData[name].totalDNFs / woodspoonData[name].attempts) * 100
          }))
          .filter(entry => entry.totalDNFs > 0)
          .sort((a, b) => b.percentage - a.percentage);

        setDailyLeaderboard(dailyLeaderboardArray);
        setWeeklyLeaderboard(weeklyLeaderboardArray);
        setAllTimeLeaderboard(allTimeLeaderboardArray);
        setRawAverageLeaderboard(rawAverageLeaderboard);
        setAllAttemptsLeaderboard(allAttemptsLeaderboardArray);
        setWoodspoonLeaderboard(woodspoonLeaderboardArray);
        setLastFetch(Date.now());
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
          <img src={wordleLogo} alt="Wordle" className={classes.spinningLogo} />
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
                <h2 className={classes.cardTitle} title={"Shows the best average score for each player for today&apos;s Wordle. Only games played today are counted. DNF (Did Not Finish) is scored as 7. If a player submits multiple scores, all are averaged."}>
                  🌅 Today&apos;s Leaders
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
                <h2 className={classes.cardTitle} title={"Shows the best average score for each player over the 5 most recent weekdays (Mon-Fri). For each day, only the best score is counted. Missing days are scored as DNF (7). Only played days are shown as games."}>
                  📅 This Week
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
                <h2 className={classes.cardTitle} title={"Ranks players by Bayesian average: combines your actual average, a global average prior, and a recency penalty (scores 'rot' if you are inactive). Minimum 3 games required. Lower scores are better."}>
                  🏆 All-Time Champions
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
                <h2 className={classes.cardTitle} title={"Shows the raw average score for each player with at least 5 games. No Bayesian adjustment or recency penalty. DNF (Did Not Finish) is scored as 7."}>
                  📈 Pure Averages
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
                <h2 className={classes.cardTitle} title={"Lists players by total games played. Shows their average score. All games count, including DNFs (scored as 7)."}>
                  🚀 Most Active
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
                  <h2 className={classes.cardTitle} title={"Shows players with the most DNFs (Did Not Finish, scored as 7) of all time. All games ever played are counted."}>
                    🥄 Wooden Spoon
                  </h2>
                  <p className={classes.cardSubtitle}>Most DNFs all time</p>
                </div>
                <ul className={classes.leaderboardList}>
                  {woodspoonLeaderboard.slice(0, 20).map((entry, index) => (
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
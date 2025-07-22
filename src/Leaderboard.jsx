import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from './firebase';
import { BounceLoader } from 'react-spinners';

const useStyles = createUseStyles({
  leaderboardContainer: {
    padding: '1rem',
    textAlign: 'center',
    width: '100%',
    maxWidth: 'calc(100vw - 2rem)',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '1rem',
    marginBottom: '1rem',
    boxSizing: 'border-box',
    '@media (min-width: 768px)': {
      maxWidth: '1400px',
      padding: '1.5rem',
    },
    '@media (min-width: 1200px)': {
      maxWidth: '1600px',
    },
  },
  title: {
    fontSize: '20px',
    textAlign: 'center',
    color: '#333',
    marginBottom: '1rem',
    marginTop: '0',
    fontWeight: '500',
    height: '3rem',
    margin: '0 auto 1rem auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: '1.2',
  },
  list: {
    listStyleType: 'none',
    padding: '0',
    margin: '0 auto 0 auto',
  },
  listItem: {
    padding: '10px',
    borderBottom: '1px solid #ccc',
    color: '#555',
    marginLeft: '10px',
  },
  listItemLast: {
    borderBottom: 'none',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '40%',
    padding: '1.5rem',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    margin: '0.5rem',
    textAlign: 'left',
    border: '1px solid #e0e0e0',
  },
  columns: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    '@media (max-width: 1000px)': {
      flexDirection: 'column',
      alignItems: 'center',
    },
  },
  resultsHeader: {
    color: '#333',
    fontSize: '2.5em',
    marginTop: '0',
    marginBottom: '1rem',
    fontWeight: '500',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.5em',
    color: '#555',
  },
  icon: {
    marginLeft: '-24px',
    paddingRight: '5px',
  },
  spoon: {
    marginLeft: '-24px',
    paddingRight: '5px',
    filter: 'invert(0.6) sepia(1) saturate(3) hue-rotate(-15deg)',
    transform: 'rotate(-8deg)',
  }
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

  return (
    <div className={classes.leaderboardContainer}>
      {loading ? (
        <div className={classes.loading}>
          <BounceLoader color="#555" />
        </div>
      ) : (
        <>
          <h1 className={classes.resultsHeader}>Wordle Results</h1>
          <div className={classes.columns}>

            <section className={classes.col}>
              <h1 className={classes.title}>Daily Leaderboard</h1>
              <ul className={classes.list}>
                {dailyLeaderboard && dailyLeaderboard.slice(0, 12).map((entry, index) => (
                  <li key={index}
                    className={`${classes.listItem} ${index === Math.min(dailyLeaderboard.length - 1, 11) ? classes.listItemLast : ''}`}
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

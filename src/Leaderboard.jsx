import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from './firebase';
import { BounceLoader } from 'react-spinners';

const useStyles = createUseStyles({
  leaderboardContainer: {
    padding: '20px',
    textAlign: 'center',
    margin: '20px 0',
  },
  title: {
    fontSize: '24px',
    textAlign: 'center',
    color: 'rgba(83, 73, 73, 0.87)',
    marginBottom: '15px',
    marginTop: '10px',
    height: '55px',
    margin: 'auto',
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
    padding: '1rem',
    backgroundColor: '#fff',
    boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
    borderRadius: '5px',
    margin: '1rem',
    textAlign: 'left',
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
    color: 'rgba(83, 73, 73, 0.87)',
    fontSize: '3em',
    marginTop: '-10px'
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
  '#bebebe', '#c4c4c4', '#c9c9c9', '#d0d0d0', '#d5d5d5',
  '#dadada', '#dfdfdf', '#e4e4e4', '#e8e8e8', '#ededed',
  '#f2f2f2', '#f6f6f6', '#f9f9f9', '#fcfcfc', '#fdfdfd',
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
        const today1 = new Date();
        today1.setHours(0, 0, 0, 0);
        const today = today1.toISOString().split('T')[0];
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoDate = weekAgo.toISOString().split('T')[0];

        // Fetch daily scores
        const dailyScoresQuery = query(
          collection(firestore, 'scores'),
          where('date', '==', today)
        );
        const dailySnapshot = await getDocs(dailyScoresQuery);

        // Fetch weekly scores
        const weeklyScoresQuery = query(
          collection(firestore, 'scores'),
          where('date', '>=', weekAgoDate)
        );
        const weeklySnapshot = await getDocs(weeklyScoresQuery);

        // Fetch all time scores
        const allTimeScoresQuery = collection(firestore, 'scores');
        const allTimeSnapshot = await getDocs(allTimeScoresQuery);

        // Fetch woodspoon leaderboard
        const woodspoonScoresQuery = query(
          collection(firestore, 'scores'),
          where('guesses', '==', 0)
        );
        const woodspoonSnapshot = await getDocs(woodspoonScoresQuery);

        const dailyScores = dailySnapshot.docs.map(doc => doc.data());
        const weeklyScores = weeklySnapshot.docs.map(doc => doc.data());
        const allTimeScores = allTimeSnapshot.docs.map(doc => doc.data());
        const woodspoonScores = woodspoonSnapshot.docs.map(doc => doc.data());

        // For daily & weekly: simple averages
        const groupScoresSimple = (scores) => {
          const grouped = scores.reduce((acc, s) => {
            const g = parseFloat(s.guesses);
            if (isNaN(g) || g <= 0) return acc;
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

        const dailyLeaderboardArray = groupScoresSimple(dailyScores)
          .sort((a, b) => a.average - b.average);

        const weeklyLeaderboardArray = groupScoresSimple(weeklyScores)
          .sort((a, b) => a.average - b.average);

        // Compute global mean for Bayesian prior from allTimeScores
        const allTimeSum = allTimeScores.reduce((acc, score) => {
          const g = parseFloat(score.guesses);
          if (!isNaN(g) && g > 0) {
            acc.totalGuesses += g;
            acc.totalCount += 1;
          }
          return acc;
        }, { totalGuesses: 0, totalCount: 0 });

        const globalMean = allTimeSum.totalCount > 0 ? (allTimeSum.totalGuesses / allTimeSum.totalCount) : 4.5;
        const alpha = 20;   // Strength of the prior
        const R = 40;       // Recency scaling factor
        const C = 0.2;      // Attempts bonus scaling factor
        const parseDate = (d) => new Date(d);
        const now = new Date();

        // Group for Bayesian leaderboard
        const groupedAllTime = allTimeScores.reduce((acc, s) => {
          const g = parseFloat(s.guesses);
          if (isNaN(g) || g <= 0 || !s.date) return acc;
          if (!acc[s.name]) {
            acc[s.name] = { totalGuesses: 0, attempts: 0, lastAttempt: parseDate(s.date) };
          }
          acc[s.name].totalGuesses += g;
          acc[s.name].attempts += 1;
          const attemptDate = parseDate(s.date);
          if (attemptDate > acc[s.name].lastAttempt) {
            acc[s.name].lastAttempt = attemptDate;
          }
          return acc;
        }, {});

        const computeBayesianFinalScore = (playerData) => {
          const { totalGuesses, attempts, lastAttempt } = playerData;
          const BayesAvg = (totalGuesses + globalMean * alpha) / (attempts + alpha);
          const daysSinceLast = Math.floor((now - lastAttempt) / (24 * 60 * 60 * 1000));
          const RecencyFactor = 1 + (daysSinceLast / R);
          const AttemptsBonus = C * Math.log(attempts + 1);
          const finalScore = (BayesAvg * RecencyFactor) - AttemptsBonus;
          return { finalScore };
        };

        const allTimeLeaderboardArray = Object.keys(groupedAllTime).map(name => {
          const { totalGuesses, attempts, lastAttempt } = groupedAllTime[name];
          const BayesAvg = (totalGuesses + globalMean * alpha) / (attempts + alpha);
          const daysSinceLast = Math.floor((now - lastAttempt) / (24 * 60 * 60 * 1000));
          const RecencyFactor = 1 + (daysSinceLast / R);
          const AttemptsBonus = C * Math.log(attempts + 1);
          const finalScore = (BayesAvg * RecencyFactor) - AttemptsBonus;

          return {
            name,
            finalScore,
            BayesAvg,
            RecencyFactor,
            AttemptsBonus,
          };
        }).sort((a, b) => a.finalScore - b.finalScore);

        // Attempts leaderboard
        const allAttemptsLeaderboardArray = Object.keys(groupedAllTime).map(name => ({
          name,
          attempts: groupedAllTime[name].attempts
        })).sort((a, b) => b.attempts - a.attempts);

        // Woodspoon leaderboard
        const groupedWoodspoonScores = woodspoonScores.reduce((acc, score) => {
          if (!acc[score.name]) {
            acc[score.name] = { count: 0 };
          }
          acc[score.name].count += 1;
          return acc;
        }, {});
        const woodspoonLeaderboardArray = Object.keys(groupedWoodspoonScores).map(name => ({
          name,
          count: groupedWoodspoonScores[name].count
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
                {dailyLeaderboard && dailyLeaderboard.map((entry, index) => (
                  <li key={index}
                    className={`${classes.listItem} ${index === dailyLeaderboard.length - 1 ? classes.listItemLast : ''}`}
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
              <h1 className={classes.title}>Seven-day Running Leaderboard</h1>
              <ul className={classes.list}>
                {weeklyLeaderboard && weeklyLeaderboard.map((entry, index) => (
                  <li key={index}
                    className={`${classes.listItem} ${index === weeklyLeaderboard.length - 1 ? classes.listItemLast : ''}`}
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
                {allTimeLeaderboard && allTimeLeaderboard.map((entry, index) => (
                  <li
                    key={index}
                    className={`${classes.listItem} ${index === allTimeLeaderboard.length - 1 ? classes.listItemLast : ''}`}
                    style={{
                      fontWeight: index < 3 ? 'bold' : 'normal',
                      color: index === 0 ? '#F9A602'
                        : index === 1 ? '#848482'
                          : index === 2 ? '#CD7F32'
                            : index > 2 && index < grayShades.length ? grayShades[index]
                              : 'white',
                    }}
                    title={`FinalScore = (BayesAvg x RecencyFactor) - AttemptsBonus
        
        Formula:
        FinalScore = (${entry.BayesAvg.toFixed(2)} x ${entry.RecencyFactor.toFixed(2)}) - ${entry.AttemptsBonus.toFixed(2)}

        Explanation:
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
                {allAttemptsLeaderboard && allAttemptsLeaderboard.map((entry, index) => (
                  <li key={index}
                    className={`${classes.listItem} ${index === allAttemptsLeaderboard.length - 1 ? classes.listItemLast : ''}`}
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
                    #{index + 1} {entry.name}: {entry.attempts} attempts
                  </li>
                ))}
              </ul>
            </section>

            <section className={classes.col}>
              <h1 className={classes.title}>Wooden Spoon Leaderboard</h1>
              <ul className={classes.list}>
                {woodspoonLeaderboard && woodspoonLeaderboard.map((entry, index) => (
                  <li key={index}
                    className={`${classes.listItem} ${index === woodspoonLeaderboard.length - 1 ? classes.listItemLast : ''}`}
                    style={{
                      fontWeight: index < 3 ? 'bold' : 'normal',
                      color: index === 0 ? '#F9A602'
                        : index === 1 ? '#848482'
                          : index === 2 ? '#CD7F32'
                            : index > 2 && index < grayShades.length ? grayShades[index]
                              : 'white',
                    }}
                  >
                    {index === 0 && <span className={classes.spoon}>🥄</span>}
                    #{index + 1} {entry.name}: {entry.count} {entry.count === 1 ? 'dnf' : 'dnfs'}
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

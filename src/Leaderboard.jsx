import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { firestore } from './firebase'; // Adjust the import path as necessary

const useStyles = createUseStyles({
  leaderboardContainer: {
    padding: '20px',
    textAlign: 'center',
    margin: '20px 0',
  },
  title: {
    fontSize: '24px',
    textAlign: 'center',
    color: '#333',
    marginBottom: '20px',
  },
  list: {
    listStyleType: 'none',
    padding: '0',
  },
  listItem: {
    padding: '10px',
    borderBottom: '1px solid #ccc',
    color: '#555',
  },
  listItemLast: {
    borderBottom: 'none',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start', // Align content to the top
    alignItems: 'flex-start', // Align items to the start of the column (left side)
    width: '40%',
    padding: '1rem',
    backgroundColor: '#fff',
    boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
    borderRadius: '5px',
    margin: '1rem',
    textAlign: 'left', // Align text to the left inside the column
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
});

const Leaderboard = () => {
  const classes = useStyles();
  const [dailyLeaderboard, setDailyLeaderboard] = useState([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState([]);
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState([]);
  const [allAttemptsLeaderboard, setAllAttemptsLeaderboard] = useState([]);
  const [woodspoonLeaderboard, setWoodspoonLeaderboard] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, 'scores'), (snapshot) => {
      console.log('Scores collection updated');
      fetchLeaderboards();
    });

    const fetchLeaderboards = async () => {
      try {
        const today1 = new Date();
        today1.setHours(0, 0, 0, 0); // Set time to 00:00:00.000
        const today = today1.toISOString().split('T')[0];
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoDate = weekAgo.toISOString().split('T')[0];

        console.log('Fetching scores for date:', today); // Debug log
        console.log('Fetching scores for week starting from:', weekAgoDate); // Debug log

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
        const allTimeScoresQuery = query(
          collection(firestore, 'scores')
        );
        const allTimeSnapshot = await getDocs(allTimeScoresQuery);

        // Fetch woodspoon leaderboard
        const woodspoonScoresQuery = query(
          collection(firestore, 'scores'),
          where('guesses', '==', 0)
        );
        const woodspoonSnapshot = await getDocs(woodspoonScoresQuery);

        // Process daily scores
        const dailyScores = dailySnapshot.docs.map(doc => doc.data());
        console.log('Fetched daily scores:', dailyScores); // Debug log

        const groupedDailyScores = dailyScores.reduce((acc, score) => {
          if (score.guesses === 0) return acc; // Exclude zero guesses
          if (!acc[score.name]) {
            acc[score.name] = { totalGuesses: 0, count: 0 };
          }
          acc[score.name].totalGuesses += score.guesses;
          acc[score.name].count += 1;
          return acc;
        }, {});

        const dailyLeaderboardArray = Object.keys(groupedDailyScores).map(name => ({
          name,
          averageGuesses: groupedDailyScores[name].totalGuesses / groupedDailyScores[name].count,
        })).sort((a, b) => a.averageGuesses - b.averageGuesses); // Sort by score

        // Process weekly scores
        const weeklyScores = weeklySnapshot.docs.map(doc => doc.data());
        console.log('Fetched weekly scores:', weeklyScores); // Debug log

        const groupedWeeklyScores = weeklyScores.reduce((acc, score) => {
          if (score.guesses === 0) return acc; // Exclude zero guesses
          if (!acc[score.name]) {
            acc[score.name] = { totalGuesses: 0, count: 0 };
          }
          acc[score.name].totalGuesses += score.guesses;
          acc[score.name].count += 1;
          return acc;
        }, {});

        const weeklyLeaderboardArray = Object.keys(groupedWeeklyScores).map(name => ({
          name,
          averageGuesses: groupedWeeklyScores[name].totalGuesses / groupedWeeklyScores[name].count,
        })).sort((a, b) => a.averageGuesses - b.averageGuesses); // Sort by score

        // Process all-time scores
        const allTimeScores = allTimeSnapshot.docs.map(doc => doc.data());
        console.log('Fetched all-time scores:', allTimeScores); // Debug log

        const groupedAllTimeScores = allTimeScores.reduce((acc, score) => {
          if (score.guesses === 0) return acc; // Exclude zero guesses
          if (!acc[score.name]) {
            acc[score.name] = { totalGuesses: 0, count: 0 };
          }
          acc[score.name].totalGuesses += score.guesses;
          acc[score.name].count += 1;
          return acc;
        }, {});

        const allTimeLeaderboardArray = Object.keys(groupedAllTimeScores).map(name => ({
          name,
          averageGuesses: groupedAllTimeScores[name].totalGuesses / groupedAllTimeScores[name].count,
        })).sort((a, b) => a.averageGuesses - b.averageGuesses); // Sort by score

        const allAttemptsLeaderboardArray = Object.keys(groupedAllTimeScores).map(name => ({
          name,
          averageGuesses: groupedAllTimeScores[name].count,
        })).sort((a, b) => b.averageGuesses - a.averageGuesses); // Sort by count

        // Process woodspoon scores
        const woodspoonScores = woodspoonSnapshot.docs.map(doc => doc.data());
        console.log('Fetched woodspoon scores:', woodspoonScores); // Debug log

        const groupedWoodspoonScores = woodspoonScores.reduce((acc, score) => {
          if (!acc[score.name]) {
            acc[score.name] = { count: 0 };
          }
          acc[score.name].count += 1;
          return acc;
        }, {});

        const woodspoonLeaderboardArray = Object.keys(groupedWoodspoonScores).map(name => ({
          name,
          count: groupedWoodspoonScores[name].count,
        })).sort((a, b) => b.count - a.count); // Sort by count of zeros

        console.log('Daily Leaderboard:', dailyLeaderboardArray); // Debug log
        console.log('Weekly Leaderboard:', weeklyLeaderboardArray); // Debug log
        console.log('All-time Leaderboard:', allTimeLeaderboardArray); // Debug log
        console.log('All Attempts Leaderboard:', allAttemptsLeaderboardArray); // Debug log
        console.log('Woodspoon Leaderboard:', woodspoonLeaderboardArray); // Debug log

        setDailyLeaderboard(dailyLeaderboardArray);
        setWeeklyLeaderboard(weeklyLeaderboardArray);
        setAllTimeLeaderboard(allTimeLeaderboardArray);
        setAllAttemptsLeaderboard(allAttemptsLeaderboardArray);
        setWoodspoonLeaderboard(woodspoonLeaderboardArray);
      } catch (error) {
        console.error('Error fetching leaderboards: ', error);
      }
    };

    fetchLeaderboards();
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className={classes.leaderboardContainer}>
      <h1>Average Results</h1>
      <div className={classes.columns}>
        <section className={classes.col}>
          <h1 className={classes.title}>Daily</h1>
          <ul className={classes.list}>
            {dailyLeaderboard && dailyLeaderboard.map((entry, index) => (
              <li key={index} className={`${classes.listItem} ${index === dailyLeaderboard.length - 1 ? classes.listItemLast : ''}`}
                style={{
                  fontWeight: index < 3 ? 'bold' : 'normal', // Apply bold font weight to top 3 entries
                  color: index === 0 ? '#F9A602' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : index > 2 ? 'black' : 'inherit', // Apply #F9A602, #C0C0C0, #CD7F32 colors
                }}
              >
                {index === 0 ? '👑 ' : ''} {/* Add crown emoji to first place */}
                {entry.name}: {parseFloat(entry.averageGuesses).toFixed(0)} {parseFloat(entry.averageGuesses).toFixed(0) === 1 ? 'guess' : 'guesses'}
              </li>
            ))}
          </ul>
        </section>
        <section className={classes.col}>
          <h1 className={classes.title}>Weekly</h1>
          <ul className={classes.list}>
            {weeklyLeaderboard && weeklyLeaderboard.map((entry, index) => (
              <li key={index} className={`${classes.listItem} ${index === weeklyLeaderboard.length - 1 ? classes.listItemLast : ''}`}
                style={{
                  fontWeight: index < 3 ? 'bold' : 'normal', // Apply bold font weight to top 3 entries
                  color: index === 0 ? '#F9A602' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : index > 2 ? 'black' : 'inherit', // Apply #F9A602, #C0C0C0, #CD7F32 colors
                }}
              >
                {index === 0 ? '👑 ' : ''} {/* Add crown emoji to first place */}
                {entry.name}: {parseFloat(entry.averageGuesses).toFixed(2)} guesses
              </li>
            ))}
          </ul>
        </section>
        <section className={classes.col}>
          <h1 className={classes.title}>All Time Leaderboard</h1>
          <ul className={classes.list}>
            {allTimeLeaderboard && allTimeLeaderboard.map((entry, index) => (
              <li key={index} className={`${classes.listItem} ${index === allTimeLeaderboard.length - 1 ? classes.listItemLast : ''}`}
                style={{
                  fontWeight: index < 3 ? 'bold' : 'normal', // Apply bold font weight to top 3 entries
                  color: index === 0 ? '#F9A602' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : index > 2 ? 'black' : 'inherit', // Apply #F9A602, #C0C0C0, #CD7F32 colors
                }}
              >
                {index === 0 ? '👑 ' : ''} {/* Add crown emoji to first place */}
                #{index + 1} {entry.name}: {parseFloat(entry.averageGuesses).toFixed(2)} guesses
              </li>
            ))}
          </ul>
        </section>
        <section className={classes.col}>
          <h1 className={classes.title}>Attempts Leaderboard</h1>
          <ul className={classes.list}>
            {allAttemptsLeaderboard && allAttemptsLeaderboard.map((entry, index) => (
              <li key={index} className={`${classes.listItem} ${index === allAttemptsLeaderboard.length - 1 ? classes.listItemLast : ''}`}
                style={{
                  fontWeight: index < 3 ? 'bold' : 'normal', // Apply bold font weight to top 3 entries
                  color: index === 0 ? '#F9A602' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : index > 2 ? 'black' : 'inherit', // Apply #F9A602, #C0C0C0, #CD7F32 colors
                }}
              >
                {index === 0 ? '👑 ' : ''} {/* Add crown emoji to first place */}
                #{index + 1} {entry.name}: {parseFloat(entry.averageGuesses).toFixed(0)} {parseFloat(entry.averageGuesses).toFixed(0) === 1 ? 'attempt' : 'attempts'}
              </li>
            ))}
          </ul>
        </section>
        <section className={classes.col}>
          <h1 className={classes.title}>Woodspoon Leaderboard</h1>
          <ul className={classes.list}>
            {woodspoonLeaderboard && woodspoonLeaderboard.map((entry, index) => (
              <li key={index} className={`${classes.listItem} ${index === woodspoonLeaderboard.length - 1 ? classes.listItemLast : ''}`}
                style={{
                  fontWeight: index < 3 ? 'bold' : 'normal', // Apply bold font weight to top 3 entries
                  color: index === 0 ? '#F9A602' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : index > 2 ? 'black' : 'inherit', // Apply #F9A602, #C0C0C0, #CD7F32 colors
                }}
              >
                {index === 0 ? '🥄 ' : ''} {/* Add crown emoji to first place */}
                #{index + 1} {entry.name}: {entry.count} {entry.count === 1 ? 'dnf' : 'dnfs'}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Leaderboard;

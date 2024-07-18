import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from './firebase'; // Adjust the import path as necessary

const useStyles = createUseStyles({
  leaderboardContainer: {
    padding: '20px',
    backgroundColor: '#fff',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
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
});

const Leaderboard = () => {
  const classes = useStyles();
  const [dailyLeaderboard, setDailyLeaderboard] = useState([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
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

        // Process daily scores
        const dailyScores = dailySnapshot.docs.map(doc => doc.data());
        console.log('Fetched daily scores:', dailyScores); // Debug log

        const groupedDailyScores = dailyScores.reduce((acc, score) => {
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
        }));

        // Process weekly scores
        const weeklyScores = weeklySnapshot.docs.map(doc => doc.data());
        console.log('Fetched weekly scores:', weeklyScores); // Debug log

        const groupedWeeklyScores = weeklyScores.reduce((acc, score) => {
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
        }));

        console.log('Daily Leaderboard:', dailyLeaderboardArray); // Debug log
        console.log('Weekly Leaderboard:', weeklyLeaderboardArray); // Debug log

        setDailyLeaderboard(dailyLeaderboardArray);
        setWeeklyLeaderboard(weeklyLeaderboardArray);
      } catch (error) {
        console.error('Error fetching leaderboards: ', error);
      }
    };

    fetchLeaderboards();
  }, []);
  

  return (
    <div className={classes.leaderboardContainer}>
      <h1 className={classes.title}>Daily Results</h1>
      <ul className={classes.list}>
        {dailyLeaderboard.map((entry, index) => (
          <li key={index} className={`${classes.listItem} ${index === dailyLeaderboard.length - 1 ? classes.listItemLast : ''}`}>
            {entry.name}: {entry.averageGuesses.toFixed(2)} guesses
          </li>
        ))}
      </ul>
      <h1 className={classes.title}>Weekly Results</h1>
      <ul className={classes.list}>
        {weeklyLeaderboard.map((entry, index) => (
          <li key={index} className={`${classes.listItem} ${index === weeklyLeaderboard.length - 1 ? classes.listItemLast : ''}`}>
            {entry.name}: {entry.averageGuesses.toFixed(2)} guesses
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;

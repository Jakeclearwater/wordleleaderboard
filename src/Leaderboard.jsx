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
    justifyContent: 'center',
    alignItems: 'center',
    width: '33%',
    padding: "1rem",
    backgroundColor: '#fff',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    margin: '1rem',
  },
  columns: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    '@media (max-width: 1000px)': {
      flexDirection: 'column',
      alignItems: 'center',
    }
  },
});

const Leaderboard = () => {
  const classes = useStyles();
  const [dailyLeaderboard, setDailyLeaderboard] = useState([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState([]);
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState([]);
  const [allAttemptsLeaderboard, setAllAttemptsLeaderboard] = useState([]);

  useEffect(() => {

    const unsubscribe = onSnapshot(collection(firestore, 'scores'), (snapshot) => {
      console.log('Scores collection updated');
      fetchLeaderboards();
    }
    );

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

        // fetch all time scores
        const allTimeScoresQuery = query(
          collection(firestore, 'scores')
        );

        const allTimeSnapshot = await getDocs(allTimeScoresQuery);

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
        })).sort((a, b) => a.averageGuesses - b.averageGuesses); // Sort by score

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
        })).sort((a, b) => a.averageGuesses - b.averageGuesses); // Sort by score;

        // Process all time scores
        const allTimeScores = allTimeSnapshot.docs.map(doc => doc.data());
        console.log('Fetched all time scores:', allTimeScores); // Debug log

        const groupedAllTimeScores = allTimeScores.reduce((acc, score) => {
          if (!acc[score.name]) {
            acc[score.name] = { totalGuesses: 0, count: 0 };
          }
          acc[score.name].totalGuesses += score.guesses;
          acc[score.name].count += 1;
          return acc;
        }
        , {});

        const allTimeLeaderboardArray = Object.keys(groupedAllTimeScores).map(name => ({
          name,
          averageGuesses: groupedAllTimeScores[name].totalGuesses / groupedAllTimeScores[name].count,
        })).sort((a, b) => a.averageGuesses - b.averageGuesses); // Sort by score;
        
        const allAttemptsLeaderboardArray = Object.keys(groupedAllTimeScores).map(name => ({
          name,
          averageGuesses: groupedAllTimeScores[name].count,
        })).sort((a, b) => b.averageGuesses - a.averageGuesses); // Sort by score;
        


        console.log('Daily Leaderboard:', dailyLeaderboardArray); // Debug log
        console.log('Weekly Leaderboard:', weeklyLeaderboardArray); // Debug log
        console.log('All time Leaderboard:', allTimeLeaderboardArray); // Debug
        console.log('All time Leaderboard:', allAttemptsLeaderboardArray); // Debug

        setDailyLeaderboard(dailyLeaderboardArray);
        setWeeklyLeaderboard(weeklyLeaderboardArray);
        setAllTimeLeaderboard(allTimeLeaderboardArray);
        setAllAttemptsLeaderboard(allAttemptsLeaderboardArray);
      } catch (error) {
        console.error('Error fetching leaderboards: ', error);
      }
    };

    // 
    fetchLeaderboards();
    return () => {
      unsubscribe
    }
    
  }, []);
  

  return (
    <div className={classes.leaderboardContainer}>
      <h1>Average results</h1>
      <div className={classes.columns}>
      <section className={classes.col}>
      <h1 className={classes.title}>Daily</h1>
      <ul className={classes.list}>
        {dailyLeaderboard && dailyLeaderboard.map((entry, index) => (
          <li key={index} className={`${classes.listItem} ${index === dailyLeaderboard.length - 1 ? classes.listItemLast : ''}`}
          style={{
            fontWeight: index < 3 ? 'bold' : 'normal', // Apply bold font weight to top 3 entries
            color: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : index > 2 ? 'black' : 'inherit', // Apply gold, silver, bronze colors
          }}
          >
            {index === 0 ? '👑 ' : ''} {/* Add crown emoji to first place */} 
            {entry.name}: {parseFloat(entry.averageGuesses).toFixed(0)} {parseFloat(entry.averageGuesses).toFixed(0) == 1 ? ( 'guess' ) : ('guesses') }
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
            color: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : index > 2 ? 'black' : 'inherit', // Apply gold, silver, bronze colors
          }}
          >
            {index === 0 ? '👑 ' : ''} {/* Add crown emoji to first place */}
            {entry.name}: {parseFloat(entry.averageGuesses).toFixed(2)} guesses
          </li>
        ))}
      </ul>
      </section>
      <section className={classes.col}>
      <h1 className={classes.title}>All time Leaderboard</h1>
      <ul className={classes.list}>
        {allTimeLeaderboard && allTimeLeaderboard.map((entry, index) => (
          <li key={index} className={`${classes.listItem} ${index === allTimeLeaderboard.length - 1 ? classes.listItemLast : ''}`}
          style={{
            fontWeight: index < 3 ? 'bold' : 'normal', // Apply bold font weight to top 3 entries
            color: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : index > 2 ? 'black' : 'inherit', // Apply gold, silver, bronze colors
          }}
          >
            {index === 0 ? '👑 ' : ''} {/* Add crown emoji to first place */}
            #{index + 1} {entry.name}: {parseFloat(entry.averageGuesses).toFixed(2)} guesses
          </li>

        ))}
      </ul>
      </section>
      <section className={classes.col}>
      <h1 className={classes.title}>Total Days Played Leaderboard</h1>
      <ul className={classes.list}>
        {allAttemptsLeaderboard && allAttemptsLeaderboard.map((entry, index) => (
          <li key={index} className={`${classes.listItem} ${index === allAttemptsLeaderboard.length - 1 ? classes.listItemLast : ''}`}
          style={{
            fontWeight: index < 3 ? 'bold' : 'normal', // Apply bold font weight to top 3 entries
            color: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : index > 2 ? 'black' : 'inherit', // Apply gold, silver, bronze colors
          }}
          >
            {index === 0 ? '👑 ' : ''} {/* Add crown emoji to first place */}
            #{index + 1} {entry.name}: {parseFloat(entry.averageGuesses).toFixed(0)} {parseFloat(entry.averageGuesses).toFixed(0) == 1 ? ( 'attempt' ) : ('attempts') }
          </li>

        ))}
      </ul>
      </section>
    </div>
    </div>
  );
};

export default Leaderboard;
// 👑
import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
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
    color: 'rgba(83, 73, 73, 0.87);',
    marginBottom: '15px',
    marginTop: '10px',
    height: '55px',
  },
  list: {
    listStyleType: 'none',
    padding: '0',
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
  }
});

const grayShades = [
  '#bebebe', // Step 0
  '#c4c4c4', // Step 1
  '#c9c9c9', // Step 2
  '#d0d0d0', // Step 3
  '#d5d5d5', // Step 4
  '#dadada', // Step 5
  '#dfdfdf', // Step 6
  '#e4e4e4', // Step 7
  '#e8e8e8', // Step 8
  '#ededed', // Step 9
  '#f2f2f2', // Step 10
  '#f6f6f6', // Step 11
  '#f9f9f9', // Step 12
  '#fcfcfc', // Step 13
  '#fdfdfd', // Step 14
  '#fefefe', // Step 15
  '#ffffff', // Step 16
  '#ffffff', // Step 17
  '#ffffff', // Step 18
  '#ffffff', // Step 19
];

const calculateGradientColor = (index) => {
  const baseColor = '#bebebe'; // Base color for the gradient
  const endColor = '#d3d3d3'; // End color for the gradient
  const fadeFactor = Math.min((index - 3) / 5, 1); // Calculate fade factor, adjust the denominator to control fading speed
  const r = Math.round(parseInt(baseColor.slice(1, 3), 16) * (1 - fadeFactor) + parseInt(endColor.slice(1, 3), 16) * fadeFactor);
  const g = Math.round(parseInt(baseColor.slice(3, 5), 16) * (1 - fadeFactor) + parseInt(endColor.slice(3, 5), 16) * fadeFactor);
  const b = Math.round(parseInt(baseColor.slice(5, 7), 16) * (1 - fadeFactor) + parseInt(endColor.slice(5, 7), 16) * fadeFactor);
  return `rgb(${r}, ${g}, ${b})`;
};

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

        console.log('Fetching scores for date:', today);
        console.log('Fetching scores for week starting from:', weekAgoDate);

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
        console.log('Fetched daily scores:', dailyScores);

        const groupedDailyScores = dailyScores.reduce((acc, score) => {
          const guesses = parseFloat(score.guesses); // Ensure guesses are integers
          if (isNaN(guesses)) return acc;
          if (guesses === 0) return acc; // Exclude zero guesses
          if (!acc[score.name]) {
            acc[score.name] = { totalGuesses: 0, count: 0 };
          }
          acc[score.name].totalGuesses += guesses;
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
          const guesses = parseFloat(score.guesses); // Ensure guesses are integers
          if (isNaN(guesses)) return acc;
          if (guesses === 0) return acc; // Exclude zero guesses
          if (!acc[score.name]) {
            acc[score.name] = { totalGuesses: 0, count: 0 };
          }
          acc[score.name].totalGuesses += guesses;
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
          const guesses = parseFloat(score.guesses); // Ensure guesses are integers
          if (isNaN(guesses)) return acc;
          if (guesses === 0) return acc; // Exclude zero guesses
          if (!acc[score.name]) {
            acc[score.name] = { totalGuesses: 0, count: 0 };
          }
          acc[score.name].totalGuesses += guesses;
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
        console.log('Fetched wooden spoon scores:', woodspoonScores); // Debug log

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
        console.log('Wooden spoon Leaderboard:', woodspoonLeaderboardArray); // Debug lo


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
              
              <li key={index} className={`${classes.listItem} ${index === dailyLeaderboard.length - 1 ? classes.listItemLast : ''}`}
                style={{
                  fontWeight: index < 3 ? 'bold' : 'normal',
                  color: index === 0 ? '#F9A602' : index === 1 ? '#848482' : index === 2 ? '#CD7F32' : index > 2 ? grayShades[index] : 'inherit',
                }}
              >
                {index === 0 && <span className={classes.icon}>👑</span>}
                #{index + 1} {entry.name}: {parseFloat(entry.averageGuesses).toFixed(0)} {parseFloat(entry.averageGuesses).toFixed(0) === 1 ? 'guess' : 'guesses'}
              </li>
            ))}
          </ul>
        </section>
        <section className={classes.col}>
          <h1 className={classes.title}>Seven-day Running Leaderboard</h1>
          <ul className={classes.list}>
            {weeklyLeaderboard && weeklyLeaderboard.map((entry, index) => (
              <li key={index} className={`${classes.listItem} ${index === weeklyLeaderboard.length - 1 ? classes.listItemLast : ''}`}
                style={{
                  fontWeight: index < 3 ? 'bold' : 'normal', 
                  color: index === 0 ? '#F9A602' : index === 1 ? '#848482' : index === 2 ? '#CD7F32' : index > 2 ? grayShades[index] : 'inherit',
                }}
              >
                {index === 0 && <span className={classes.icon}>👑</span>}
                #{index + 1} {entry.name}: {parseFloat(entry.averageGuesses).toFixed(2)} guesses
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
                  fontWeight: index < 3 ? 'bold' : 'normal', 
                  color: index === 0 ? '#F9A602' : index === 1 ? '#848482' : index === 2 ? '#CD7F32' : index > 2 ? grayShades[index] : 'inherit',
                }}
              >
                {index === 0 && <span className={classes.icon}>👑</span>}
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
                  fontWeight: index < 3 ? 'bold' : 'normal', 
                  color: index === 0 ? '#F9A602' : index === 1 ? '#848482' : index === 2 ? '#CD7F32' : index > 2 ? grayShades[index] : 'inherit',
                }}
              >
                {index === 0 && <span className={classes.icon}>👑</span>}
                #{index + 1} {entry.name}: {parseFloat(entry.averageGuesses).toFixed(0)} {parseFloat(entry.averageGuesses).toFixed(0) === 1 ? 'attempt' : 'attempts'}
              </li>
            ))}
          </ul>
        </section>
        <section className={classes.col}>
          <h1 className={classes.title}>Wooden Spoon Leaderboard</h1>
          <ul className={classes.list}>
            {woodspoonLeaderboard && woodspoonLeaderboard.map((entry, index) => (
              <li key={index} className={`${classes.listItem} ${index === woodspoonLeaderboard.length - 1 ? classes.listItemLast : ''}`}
                style={{
                  fontWeight: index < 3 ? 'bold' : 'normal',
                  color: index === 0 ? '#F9A602' : index === 1 ? '#848482' : index === 2 ? '#CD7F32' : index > 2 ? grayShades[index] : 'inherit',
                }}
              >
                {index === 0 && <span className={classes.icon}>🥄</span>}
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

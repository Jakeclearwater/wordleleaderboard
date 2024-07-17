// src/components/Leaderboard.js
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from './firebase'; // Adjust the import path as necessary

const Leaderboard = () => {
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
    <div>
      <h1>Daily Leaderboard</h1>
      <ul>
        {dailyLeaderboard.map((entry, index) => (
          <li key={index}>
            {entry.name}: {entry.averageGuesses.toFixed(2)} guesses
          </li>
        ))}
      </ul>
      <h1>Weekly Leaderboard</h1>
      <ul>
        {weeklyLeaderboard.map((entry, index) => (
          <li key={index}>
            {entry.name}: {entry.averageGuesses.toFixed(2)} guesses
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
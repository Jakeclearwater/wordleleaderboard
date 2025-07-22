import React, { useState, useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { firestore } from './firebase';

const useStyles = createUseStyles({
  chartContainer: {
    padding: '2rem',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    margin: '0',
    maxWidth: '100%',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    },
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '2rem',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  controls: {
    marginBottom: '1.5rem',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    alignItems: 'center',
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  userSelector: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  userCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    border: '1px solid #e0e4e7',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.95)',
      transform: 'translateY(-1px)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
  },
  selectedUser: {
    background: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.98)',
    },
  },
  loading: {
    textAlign: 'center',
    padding: '4rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    minHeight: '60vh',
    justifyContent: 'center',
  },
  loadingSpinner: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    animation: '$spin 1.5s linear infinite',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '6px',
      left: '6px',
      right: '6px',
      bottom: '6px',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.95)',
    },
    '&::after': {
      content: '"📊"',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: '20px',
      zIndex: 1,
    },
  },
  loadingText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  loadingSubtext: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '400',
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
});

// Color palette for different users
const userColors = [
  '#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0',
  '#00BCD4', '#FFEB3B', '#795548', '#607D8B', '#E91E63',
  '#3F51B5', '#8BC34A', '#FFC107', '#FF5722', '#673AB7',
];

// Cookie helper functions
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const setCookie = (name, value, days = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const BayesianChart = () => {
  const classes = useStyles();
  const [chartData, setChartData] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateData, setDateData] = useState({}); // Store dateData for tooltip access
  
  // Load preferences from cookies
  const [timeRange, setTimeRange] = useState(() => getCookie('bayesian-time-range') || '1month');
  const [connectLines, setConnectLines] = useState(() => getCookie('bayesian-connect-lines') === 'true');
  const [allScoresData, setAllScoresData] = useState([]); // Store all scores for filtering

  // Save preferences to cookies when they change
  useEffect(() => {
    setCookie('bayesian-time-range', timeRange);
  }, [timeRange]);

  useEffect(() => {
    setCookie('bayesian-connect-lines', connectLines.toString());
  }, [connectLines]);

  useEffect(() => {
    fetchAllDataAndProcess();
  }, []);

  useEffect(() => {
    // Reprocess data when time range changes
    if (allScoresData.length > 0) {
      processDataForTimeRange();
    }
  }, [timeRange]);

  useEffect(() => {
    // Reprocess data when connectLines setting changes
    if (allScoresData.length > 0) {
      processDataForTimeRange();
    }
  }, [connectLines]);

  const fetchAllDataAndProcess = async () => {
    setLoading(true);
    try {
      // Fetch all scores (we'll sort and filter on client side for better timezone handling)
      const scoresQuery = collection(firestore, 'scores');
      const snapshot = await getDocs(scoresQuery);
      const allScores = snapshot.docs.map(doc => doc.data());

      setAllScoresData(allScores);
      
      // Process data for default time range
      processDataWithScores(allScores);
    } catch (error) {
      console.error('Error fetching data for chart:', error);
    } finally {
      setLoading(false);
    }
  };

  const processDataForTimeRange = () => {
    processDataWithScores(allScoresData);
  };

  const getFilteredScoresByTimeRange = (scores) => {
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

    // Filter out scores without isoDate first
    const validScores = scores.filter(score => score.isoDate);

    const now = new Date();
    let startDate;

    switch (timeRange) {
      case '1week':
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
        break;
      case '2weeks':
        startDate = new Date();
        startDate.setDate(now.getDate() - 14);
        break;
      case '1month':
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        startDate = new Date();
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
      default:
        return validScores.sort((a, b) => {
          const dateA = getEffectiveDate(a);
          const dateB = getEffectiveDate(b);
          return dateA.localeCompare(dateB);
        }); // Return all valid scores sorted by effective date
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    return validScores
      .filter(score => {
        const effectiveDate = getEffectiveDate(score);
        return effectiveDate >= startDateStr;
      })
      .sort((a, b) => {
        const dateA = getEffectiveDate(a);
        const dateB = getEffectiveDate(b);
        return dateA.localeCompare(dateB);
      });
  };

  const processDataWithScores = (allScores) => {
    // Filter scores by selected time range
    const filteredScores = getFilteredScoresByTimeRange(allScores);
    
    // Calculate Bayesian data over time
    const processedData = calculateBayesianOverTime(filteredScores, connectLines);
    
    setChartData(processedData.chartData);
    setAllUsers(processedData.users);
    setDateData(processedData.dateData); // Store dateData for tooltip access
    
    // Update selected users if needed (maintain selection if users still exist)
    setSelectedUsers(prev => {
      const availableUsers = processedData.users.map(u => u.name);
      const validSelection = prev.filter(name => availableUsers.includes(name));
      
      // If no valid selection or empty, select top 5 by default
      if (validSelection.length === 0) {
        return processedData.users
          .sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate))
          .slice(0, 5)
          .map(user => user.name);
      }
      
      return validSelection;
    });
  };

  const calculateBayesianOverTime = (scores, shouldConnectLines = false) => {
    // Helper function to get the effective date (same as in getFilteredScoresByTimeRange)
    const getEffectiveDate = (score) => {
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
        // Fallback - this shouldn't happen since we filter out non-isoDate records
        return score.date;
      }
    };

    // Sort scores by effective date
    const sortedScores = scores.sort((a, b) => {
      const dateA = getEffectiveDate(a);
      const dateB = getEffectiveDate(b);
      return new Date(dateA) - new Date(dateB);
    });
    
    if (sortedScores.length === 0) return { chartData: [], users: [] };
    
    // Get date range using effective dates
    const firstDate = new Date(getEffectiveDate(sortedScores[0]));
    const lastDate = new Date(getEffectiveDate(sortedScores[sortedScores.length - 1]));
    
    // Create complete date range
    const allDates = [];
    const currentDate = new Date(firstDate);
    while (currentDate <= lastDate) {
      allDates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Calculate the final global mean from ALL scores (for Bayesian prior consistency)
    const allTimeSum = sortedScores.reduce((acc, score) => {
      let g = parseFloat(score.guesses);
      if (isNaN(g) || g === 0) {
        g = 7;  // Treat as DNF
      }
      acc.totalGuesses += g;
      acc.totalCount += 1;
      return acc;
    }, { totalGuesses: 0, totalCount: 0 });

    const globalMeanForPrior = allTimeSum.totalCount > 0 ? (allTimeSum.totalGuesses / allTimeSum.totalCount) : 4.5;

    // Group by date and calculate cumulative user stats
    const userStats = {};
    const dateData = {};
    const users = new Set();
    let cumulativeGlobalSum = { totalGuesses: 0, totalCount: 0 };

    // Bayesian parameters
    const alpha = 20;
    const R = 40;
    const C = 0.2;

    // Initialize dateData for all dates
    allDates.forEach(date => {
      dateData[date] = { 
        date,
        globalAverage: 4.5 // Will be updated as we process scores
      };
    });

    // First pass: collect all user attempts and update cumulative global average
    sortedScores.forEach(score => {
      const date = getEffectiveDate(score); // Use effective date instead of score.date
      const name = score.name;
      let guesses = parseFloat(score.guesses);
      
      // Convert invalid scores to 7 (DNF)
      if (isNaN(guesses) || guesses === 0) {
        guesses = 7;
      }

      // Update cumulative global average for chart display
      cumulativeGlobalSum.totalGuesses += guesses;
      cumulativeGlobalSum.totalCount += 1;
      const currentGlobalAvg = cumulativeGlobalSum.totalGuesses / cumulativeGlobalSum.totalCount;
      
      // Update global average for this date and all future dates
      const currentDateIndex = allDates.indexOf(date);
      for (let i = currentDateIndex; i < allDates.length; i++) {
        dateData[allDates[i]].globalAverage = currentGlobalAvg;
      }

      users.add(name);

      if (!userStats[name]) {
        userStats[name] = {
          totalGuesses: 0,
          attempts: 0,
          lastDate: date,
        };
      }

      userStats[name].totalGuesses += guesses;
      userStats[name].attempts += 1;
      userStats[name].lastDate = date;

      // Calculate Bayesian average using consistent prior
      const BayesAvg = (userStats[name].totalGuesses + globalMeanForPrior * alpha) / (userStats[name].attempts + alpha);
      
      // Calculate attempts bonus
      const attemptsBonus = C * Math.log(userStats[name].attempts + 1);
      
      // Store the base data (we'll calculate recency factor in second pass)
      dateData[date][name] = {
        bayesAvg: BayesAvg,
        actualAverage: userStats[name].totalGuesses / userStats[name].attempts,
        attempts: userStats[name].attempts,
        attemptsBonus,
        lastPlayedDate: date, // Mark this as the date they actually played
      };
    });

    // Second pass: calculate final scores with proper recency factors for all dates
    allDates.forEach(currentDateStr => {
      Array.from(users).forEach(userName => {
        // Find this user's most recent play date up to the current date
        let mostRecentPlayDate = null;
        let mostRecentData = null;
        
        for (let i = 0; i < allDates.length; i++) {
          const checkDate = allDates[i];
          if (checkDate > currentDateStr) break; // Don't look into the future
          
          if (dateData[checkDate][userName]) {
            mostRecentPlayDate = checkDate;
            mostRecentData = dateData[checkDate][userName];
          }
        }
        
        if (mostRecentData) {
          // Calculate recency factor from current date perspective
          const currentDate = new Date(currentDateStr);
          const lastPlayDate = new Date(mostRecentPlayDate);
          const daysSinceLastPlay = Math.floor((currentDate - lastPlayDate) / (24 * 60 * 60 * 1000));
          const recencyFactor = 1 + (daysSinceLastPlay / R);
          
          // Calculate final score
          const finalScore = (mostRecentData.bayesAvg * recencyFactor) - mostRecentData.attemptsBonus;
          
          // Update or create entry for this date
          if (!dateData[currentDateStr][userName]) {
            dateData[currentDateStr][userName] = {};
          }
          
          // Merge the data
          dateData[currentDateStr][userName] = {
            ...mostRecentData,
            finalScore,
            recencyFactor,
            daysSinceLastPlay,
          };
        }
      });
    });

    // Convert to chart format - handle both contiguous and broken line modes
    const chartData = [];
    
    allDates.forEach((date, dateIndex) => {
      const dayData = dateData[date];
      
      // Calculate average of all users' Bayesian scores for this date
      const userBayesianScores = [];
      Array.from(users).forEach(userName => {
        if (dayData[userName] && dayData[userName].finalScore) {
          userBayesianScores.push(dayData[userName].finalScore);
        }
      });
      
      const bayesianGlobalAvg = userBayesianScores.length > 0 
        ? userBayesianScores.reduce((sum, score) => sum + score, 0) / userBayesianScores.length
        : dayData.globalAverage; // Fallback to raw average if no Bayesian scores
      
      const result = { 
        date: dayData.date,
        globalAverage: bayesianGlobalAvg
      };
      
      if (shouldConnectLines) {
        // Contiguous mode: Show recency decay for all users on all dates
        Array.from(users).forEach(userName => {
          if (dayData[userName]) {
            result[userName] = dayData[userName].finalScore;
            result[`${userName}_actual`] = dayData[userName].actualAverage;
            result[`${userName}_attempts`] = dayData[userName].attempts;
          }
        });
      } else {
        // Broken mode: Only add user data for dates where they actually played
        Array.from(users).forEach(userName => {
          if (dayData[userName] && dayData[userName].lastPlayedDate === date) {
            // Only show on days they actually played
            result[userName] = dayData[userName].finalScore;
            result[`${userName}_actual`] = dayData[userName].actualAverage;
            result[`${userName}_attempts`] = dayData[userName].attempts;
          }
          // Don't add anything if they didn't play - this creates gaps/breaks in the lines
        });
      }
      
      chartData.push(result);
    });

    // Get user info for selection
    const userList = Array.from(users).map(name => ({
      name,
      lastDate: userStats[name].lastDate,
      attempts: userStats[name].attempts,
    }));

    return { chartData, users: userList, dateData };
  };

  const toggleUser = (userName) => {
    setSelectedUsers(prev => 
      prev.includes(userName) 
        ? prev.filter(name => name !== userName)
        : [...prev, userName]
    );
  };

  const selectTopUsers = (count) => {
    const topUsers = allUsers
      .sort((a, b) => b.attempts - a.attempts)
      .slice(0, count)
      .map(user => user.name);
    setSelectedUsers(topUsers);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '12px', 
          border: '1px solid #ccc',
          borderRadius: '6px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          fontSize: '13px',
          minWidth: '200px',
          zIndex: 9999,
          position: 'relative'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '14px' }}>
            📅 {formatDate(label)}
          </p>
          {payload.map((entry, index) => {
            if (entry.dataKey === 'globalAverage') {
              return (
                <p key={index} style={{ 
                  margin: '2px 0', 
                  color: entry.color,
                  fontSize: '13px'
                }}>
                  🌍 Bayesian Global Avg: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
                  <br />
                  <span style={{ fontSize: '11px', color: '#888' }}>
                    (Average of all players' Bayesian scores)
                  </span>
                </p>
              );
            } else {
              // Find the user data for this entry
              const userData = chartData.find(d => d.date === label);
              const userName = entry.dataKey;
              const actualAvg = userData ? userData[`${userName}_actual`] : null;
              const attempts = userData ? userData[`${userName}_attempts`] : null;
              
              // Get additional recency info from dateData
              const dateInfo = dateData[label] && dateData[label][userName];
              const daysSincePlay = dateInfo ? dateInfo.daysSinceLastPlay : null;
              const recencyFactor = dateInfo ? dateInfo.recencyFactor : null;
              
              return (
                <div key={index} style={{ margin: '4px 0', padding: '4px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                  <p style={{ 
                    margin: '0', 
                    color: entry.color,
                    fontSize: '13px',
                    fontWeight: '500'
                  }}>
                    👤 {userName}
                  </p>
                  <p style={{ margin: '1px 0', fontSize: '12px', color: '#666' }}>
                    📊 Bayesian: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
                  </p>
                  {actualAvg && (
                    <p style={{ margin: '1px 0', fontSize: '12px', color: '#666' }}>
                      📈 Actual Avg: {actualAvg.toFixed(2)}
                    </p>
                  )}
                  {attempts && (
                    <p style={{ margin: '1px 0', fontSize: '12px', color: '#666' }}>
                      🎯 Attempts: {attempts}
                    </p>
                  )}
                  {daysSincePlay !== null && (
                    <p style={{ margin: '1px 0', fontSize: '12px', color: '#666' }}>
                      ⏱️ Days since last: {daysSincePlay}
                    </p>
                  )}
                  {recencyFactor && (
                    <p style={{ margin: '1px 0', fontSize: '12px', color: '#666' }}>
                      📉 Recency factor: {recencyFactor.toFixed(2)}
                    </p>
                  )}
                </div>
              );
            }
          })}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={classes.chartContainer}>
        <h2 className={classes.title}>Bayesian Chart</h2>
        <div className={classes.loading}>
          <div className={classes.loadingSpinner}></div>
          <div className={classes.loadingText}>Loading chart data...</div>
          <div className={classes.loadingSubtext}>Analyzing player performance</div>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.chartContainer}>
      <h2 className={classes.title}>
        Bayesian Performance Analysis
      </h2>
      
      {/* Control Row */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '15px',
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        {/* Quick Select Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            fontSize: '14px', 
            color: '#495057',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            👥 Quick Select:
          </span>
          <button 
            onClick={() => selectTopUsers(3)} 
            style={{ 
              padding: '4px 8px',
              fontSize: '13px',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontWeight: '400',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#e9ecef';
              e.target.style.borderColor = '#adb5bd';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.borderColor = '#dee2e6';
            }}
          >
            Top 3
          </button>
          <button 
            onClick={() => selectTopUsers(5)} 
            style={{ 
              padding: '4px 8px',
              fontSize: '13px',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontWeight: '400',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#e9ecef';
              e.target.style.borderColor = '#adb5bd';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.borderColor = '#dee2e6';
            }}
          >
            Top 5
          </button>
          <button 
            onClick={() => selectTopUsers(10)} 
            style={{ 
              padding: '4px 8px',
              fontSize: '13px',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontWeight: '400',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#e9ecef';
              e.target.style.borderColor = '#adb5bd';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.borderColor = '#dee2e6';
            }}
          >
            Top 10
          </button>
          <button 
            onClick={() => setSelectedUsers([])}
            style={{ 
              padding: '4px 8px',
              fontSize: '13px',
              border: '1px solid #dc3545',
              borderRadius: '4px',
              backgroundColor: '#fff5f5',
              color: '#dc3545',
              cursor: 'pointer',
              fontWeight: '400',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f8d7da';
              e.target.style.borderColor = '#b02a37';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#fff5f5';
              e.target.style.borderColor = '#dc3545';
            }}
          >
            🗑️ Clear
          </button>
        </div>

        {/* Data Options */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Time Range Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ 
              fontSize: '13px',
              color: '#495057',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              📅 Time:
            </label>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              style={{ 
                padding: '4px 6px', 
                fontSize: '13px', 
                borderRadius: '4px', 
                border: '1px solid #dee2e6',
                backgroundColor: 'white',
                fontWeight: '400',
                cursor: 'pointer'
              }}
            >
              <option value="1week">Last Week</option>
              <option value="2weeks">Last 2 Weeks</option>
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Connect Lines Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ 
              fontSize: '13px',
              color: '#495057',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <input
                type="checkbox"
                checked={connectLines}
                onChange={(e) => setConnectLines(e.target.checked)}
                style={{ marginRight: '4px' }}
              />
              🔗 Contiguous
            </label>
          </div>
        </div>
      </div>
      
      <div className={classes.controls}>
        <div style={{ 
          marginBottom: '8px',
          fontSize: '14px',
          color: '#495057',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          🎯 Select Players:
        </div>
        <div className={classes.userSelector}>
          {allUsers
            .sort((a, b) => b.attempts - a.attempts)
            .map((user, index) => {
              const userColor = userColors[index % userColors.length];
              const isSelected = selectedUsers.includes(user.name);
              return (
                <label
                  key={user.name}
                  className={`${classes.userCheckbox} ${isSelected ? classes.selectedUser : ''}`}
                  style={{
                    borderColor: isSelected ? userColor : '#e0e4e7',
                    borderWidth: isSelected ? '2px' : '1px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleUser(user.name)}
                    style={{ 
                      margin: 0,
                      accentColor: userColor
                    }}
                  />
                  <span style={{ 
                    color: isSelected ? userColor : '#374151',
                    fontWeight: isSelected ? '600' : '500',
                    fontSize: '13px'
                  }}>
                    {user.name} ({user.attempts})
                  </span>
                </label>
              );
            })}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            interval="preserveStartEnd"
            minTickGap={30}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            domain={[3, 7]}
            label={{ value: 'Bayesian Score', angle: -90, position: 'insideLeft' }}
            tickFormatter={(value) => value.toFixed(1)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ position: 'relative', zIndex: 1 }} />
          
          {/* Bayesian Global Average Line - dashed */}
          <Line
            type="monotone"
            dataKey="globalAverage"
            stroke="#666666"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Bayesian Global Average"
          />
          
          {/* Individual User Lines */}
          {selectedUsers.map((userName, index) => (
            <Line
              key={userName}
              type="monotone"
              dataKey={userName}
              stroke={userColors[allUsers.findIndex(u => u.name === userName) % userColors.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls={false}
              name={userName}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      
      <div style={{ 
        marginTop: '20px', 
        marginBottom: '0', // Remove bottom margin for cleaner spacing
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <div style={{ 
          fontSize: '14px', 
          color: '#495057',
          fontWeight: '500',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          ℹ️ About this chart:
        </div>
        <ul style={{ 
          fontSize: '13px', 
          color: '#6c757d',
          margin: '0',
          paddingLeft: '16px',
          lineHeight: '1.5'
        }}>
          <li>📈 Shows how each player's Bayesian score evolves over time</li>
          <li>🎯 Lower scores are better (representing fewer average guesses)</li>
          <li>🧮 All lines use Bayesian scoring with recency penalty and attempts bonus</li>
          <li>🌍 Dashed line: Average of all players' Bayesian scores for each date</li>
          <li>🔗 Toggle "Contiguous" to connect/break lines on missing days</li>
          <li>⏰ Use time range selector to focus on specific periods</li>
        </ul>
      </div>
    </div>
  );
};

export default BayesianChart;

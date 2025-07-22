import React, { useState, useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { firestore } from './firebase';

const useStyles = createUseStyles({
  chartContainer: {
    background: 'var(--card-bg)',
    borderRadius: 'var(--radius-2xl)',
    boxShadow: 'var(--shadow-medium)',
    border: '1px solid var(--border-light)',
    margin: '0 auto',
    maxWidth: '1200px',
    width: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    position: 'relative',
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
  
  header: {
    padding: 'var(--space-8) var(--space-8) var(--space-6)',
    borderBottom: '1px solid var(--border-light)',
    background: 'linear-gradient(135deg, rgba(106, 170, 100, 0.03) 0%, rgba(201, 180, 88, 0.03) 100%)',
  },
  
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: '0 0 var(--space-2) 0',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    letterSpacing: '-0.01em',
  },
  
  subtitle: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  
  controls: {
    padding: 'var(--space-6) var(--space-8)',
    borderBottom: '1px solid var(--border-light)',
    background: 'var(--secondary-bg)',
  },
  
  controlGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-4)',
    alignItems: 'center',
    marginBottom: 'var(--space-4)',
    '&:last-child': {
      marginBottom: 0,
    },
  },
  
  controlLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginRight: 'var(--space-2)',
  },
  
  select: {
    padding: 'var(--space-2) var(--space-3)',
    borderRadius: 'var(--radius-md)',
    border: '2px solid var(--border-light)',
    fontSize: '0.9rem',
    background: 'var(--card-bg)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease',
    '&:focus': {
      outline: 'none',
      borderColor: 'var(--wordle-green)',
    },
  },
  
  userSelector: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-2)',
  },
  
  userCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-2) var(--space-3)',
    borderRadius: 'var(--radius-md)',
    border: '2px solid var(--border-light)',
    background: 'var(--card-bg)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: 'var(--wordle-green)',
      background: 'rgba(106, 170, 100, 0.05)',
    },
    '&.checked': {
      borderColor: 'var(--wordle-green)',
      background: 'rgba(106, 170, 100, 0.1)',
    },
  },
  
  checkbox: {
    accentColor: 'var(--wordle-green)',
  },
  
  checkboxLabel: {
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
    fontWeight: '500',
    cursor: 'pointer',
    userSelect: 'none',
  },
  
  chartArea: {
    padding: 'var(--space-8)',
    minHeight: '400px',
  },
  
  noDataMessage: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '1.1rem',
    padding: 'var(--space-16)',
  },
  
  loading: {
    textAlign: 'center',
    padding: '3rem 2rem',
    fontSize: '16px',
    color: '#666',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
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
        <div className={classes.loading}>
          <div style={{ fontSize: '24px' }}>📊</div>
          <div>Loading Bayesian chart data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.chartContainer}>
      <div className={classes.header}>
        <h2 className={classes.title}>
          📊 Bayesian Performance Analysis
        </h2>
        <p className={classes.subtitle}>
          Track player performance evolution with Bayesian scoring methodology
        </p>
      </div>
      
      <div className={classes.controls}>
        <div className={classes.controlGroup}>
          <span className={classes.controlLabel}>Time Range:</span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={classes.select}
          >
            <option value="1week">Past Week</option>
            <option value="2weeks">Past 2 Weeks</option>
            <option value="1month">Past Month</option>
            <option value="3months">Past 3 Months</option>
            <option value="6months">Past 6 Months</option>
            <option value="1year">Past Year</option>
            <option value="all">All Time</option>
          </select>
          
          <span className={classes.controlLabel} style={{ marginLeft: 'var(--space-4)' }}>
            Chart Style:
          </span>
          <label className={classes.userCheckbox}>
            <input
              type="checkbox"
              className={classes.checkbox}
              checked={connectLines}
              onChange={(e) => setConnectLines(e.target.checked)}
            />
            <span className={classes.checkboxLabel}>Contiguous Lines</span>
          </label>
        </div>
        
        <div className={classes.controlGroup}>
          <span className={classes.controlLabel}>Quick Select:</span>
          <button 
            onClick={() => selectTopUsers(3)} 
            className={classes.select}
          >
            Top 3
          </button>
          <button 
            onClick={() => selectTopUsers(5)} 
            className={classes.select}
          >
            Top 5
          </button>
          <button 
            onClick={() => setSelectedUsers([])} 
            className={classes.select}
            style={{ background: 'var(--wordle-yellow)', color: 'var(--text-primary)' }}
          >
            Clear All
          </button>
        </div>
        
        <div className={classes.userSelector}>
          {allUsers.map((user, index) => (
            <label
              key={user.name}
              className={`${classes.userCheckbox} ${selectedUsers.includes(user.name) ? 'checked' : ''}`}
            >
              <input
                type="checkbox"
                className={classes.checkbox}
                checked={selectedUsers.includes(user.name)}
                onChange={() => toggleUser(user.name)}
                style={{ 
                  accentColor: userColors[index % userColors.length]
                }}
              />
              <span 
                className={classes.checkboxLabel}
                style={{ 
                  color: selectedUsers.includes(user.name) ? userColors[index % userColors.length] : 'var(--text-primary)'
                }}
              >
                {user.name} ({user.attempts})
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className={classes.chartArea}>
        {chartData.length === 0 ? (
          <div className={classes.noDataMessage}>
            📈 No data available for the selected time range
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  interval="preserveStartEnd"
                  minTickGap={30}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  stroke="var(--text-secondary)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  domain={[3, 7]}
                  label={{ 
                    value: 'Bayesian Score', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: 'var(--text-secondary)' }
                  }}
                  tickFormatter={(value) => value.toFixed(1)}
                  stroke="var(--text-secondary)"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ position: 'relative', zIndex: 1 }} />
                
                {/* Bayesian Global Average Line - dashed */}
                <Line
                  type="monotone"
                  dataKey="globalAverage"
                  stroke="var(--text-muted)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Global Average"
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
              marginTop: 'var(--space-6)', 
              padding: 'var(--space-4)',
              background: 'var(--secondary-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ 
                fontSize: '0.9rem', 
                color: 'var(--text-primary)',
                fontWeight: '600',
                marginBottom: 'var(--space-2)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}>
                ℹ️ About this chart:
              </div>
              <ul style={{ 
                fontSize: '0.8rem', 
                color: 'var(--text-secondary)',
                margin: '0',
                paddingLeft: 'var(--space-4)',
                lineHeight: '1.5'
              }}>
                <li>📈 Shows how each player's Bayesian score evolves over time</li>
                <li>🎯 Lower scores are better (representing fewer average guesses)</li>
                <li>🧮 Uses Bayesian scoring with recency penalty and attempts bonus</li>
                <li>🌍 Dashed line shows the global average for reference</li>
                <li>🔗 Toggle "Contiguous" to connect/break lines on missing days</li>
                <li>⏰ Use time range selector to focus on specific periods</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BayesianChart;

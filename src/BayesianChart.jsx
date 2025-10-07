import { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import useStyles from './useStyles';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from './firebase';
import PropTypes from 'prop-types';
import wordleLogo from './assets/wordle.png';
import dropdownArrow from './assets/dropdown-arrow.svg';

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

const BayesianChart = ({ getCurrentGradient }) => {
  const classes = useStyles({ gradient: getCurrentGradient() });
  const [chartData, setChartData] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPlayerMenuOpen, setIsPlayerMenuOpen] = useState(false);
  
  // Load preferences from cookies
  const [timeRange, setTimeRange] = useState(() => getCookie('bayesian-time-range') || '1month');
  const [connectLines, setConnectLines] = useState(() => getCookie('bayesian-connect-lines') === 'true');
  const [dataType, setDataType] = useState(() => getCookie('bayesian-data-type') || 'bayesian');
  const [allScoresData, setAllScoresData] = useState([]); // Store all scores for filtering

  // Close player menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isPlayerMenuOpen && !event.target.closest(`.${classes.bayesianPlayerMenuContainer}`)) {
        setIsPlayerMenuOpen(false);
      }
    };

    if (isPlayerMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isPlayerMenuOpen, classes.bayesianPlayerMenuContainer]);

  // Save preferences to cookies when they change
  useEffect(() => {
    setCookie('bayesian-time-range', timeRange);
  }, [timeRange]);

  useEffect(() => {
    setCookie('bayesian-connect-lines', connectLines.toString());
  }, [connectLines]);

  useEffect(() => {
    setCookie('bayesian-data-type', dataType);
  }, [dataType]);

  // Memoized function to fetch all data - only defined once
  const fetchAllDataAndProcess = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all scores (we'll sort and filter on client side for better timezone handling)
      const scoresQuery = collection(firestore, 'scores');
      const snapshot = await getDocs(scoresQuery);
      const allScores = snapshot.docs.map(doc => doc.data());

      setAllScoresData(allScores);
      
      // Process data for default time range - will be handled by separate useEffect
      // Don't call processDataWithScores here to avoid race conditions
    } catch (error) {
      console.error('Error fetching data for chart:', error);
    } finally {
      setLoading(false);
    }
  }, []); // Empty deps - this function doesn't depend on any state/props

  // Fetch data only once on mount
  useEffect(() => {
    fetchAllDataAndProcess();
  }, [fetchAllDataAndProcess]);

  // Reprocess data when timeRange, connectLines, dataType, or allScoresData changes
  useEffect(() => {
    // Only process if we have data
    if (allScoresData.length > 0) {
      processDataWithScores(allScoresData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, connectLines, dataType, allScoresData]);

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
      }
      // No isoDate - ignore this record
      return null;
    };

    // Filter out scores without isoDate first
    const validScores = scores.filter(score => score.isoDate);

    // Get current date in NZ timezone for consistent comparison
    const now = new Date();
    const nzNow = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Pacific/Auckland',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);
    
    let startDateStr;

    switch (timeRange) {
      case '1week': {
        const date = new Date(nzNow);
        date.setDate(date.getDate() - 7);
        startDateStr = date.toISOString().split('T')[0];
        break;
      }
      case '2weeks': {
        const date = new Date(nzNow);
        date.setDate(date.getDate() - 14);
        startDateStr = date.toISOString().split('T')[0];
        break;
      }
      case '1month': {
        const date = new Date(nzNow);
        date.setMonth(date.getMonth() - 1);
        startDateStr = date.toISOString().split('T')[0];
        break;
      }
      case '3months': {
        const date = new Date(nzNow);
        date.setMonth(date.getMonth() - 3);
        startDateStr = date.toISOString().split('T')[0];
        break;
      }
      case '6months': {
        const date = new Date(nzNow);
        date.setMonth(date.getMonth() - 6);
        startDateStr = date.toISOString().split('T')[0];
        break;
      }
      case '1year': {
        const date = new Date(nzNow);
        date.setFullYear(date.getFullYear() - 1);
        startDateStr = date.toISOString().split('T')[0];
        break;
      }
      case 'all':
      default:
        return validScores.sort((a, b) => {
          const dateA = getEffectiveDate(a);
          const dateB = getEffectiveDate(b);
          return dateA.localeCompare(dateB);
        }); // Return all valid scores sorted by effective date
    }

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
    const processedData = calculateBayesianOverTime(filteredScores, connectLines, dataType);
    
    setChartData(processedData.chartData);
    setAllUsers(processedData.users);
    
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

  const calculateBayesianOverTime = (scores, shouldConnectLines = false, useDataType = 'bayesian') => {
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
      }
      // No isoDate - skip this record
      return null;
    };

    // Sort scores by effective date
    const sortedScores = scores.sort((a, b) => {
      const dateA = getEffectiveDate(a);
      const dateB = getEffectiveDate(b);
      return new Date(dateA) - new Date(dateB);
    });
    
    if (sortedScores.length === 0) return { chartData: [], users: [] };
    
    // Get date range using effective dates
    const firstDateStr = getEffectiveDate(sortedScores[0]);
    const lastDateStr = getEffectiveDate(sortedScores[sortedScores.length - 1]);
    
    // Create complete date range - use Date.UTC to avoid timezone issues
    const allDates = [];
    const [firstYear, firstMonth, firstDay] = firstDateStr.split('-').map(Number);
    const [lastYear, lastMonth, lastDay] = lastDateStr.split('-').map(Number);
    const firstDate = new Date(Date.UTC(firstYear, firstMonth - 1, firstDay));
    const lastDate = new Date(Date.UTC(lastYear, lastMonth - 1, lastDay));
    
    const currentDate = new Date(firstDate);
    while (currentDate <= lastDate) {
      allDates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
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
      // If the effective date doesn't exist in the generated range, skip safely
      if (currentDateIndex === -1) return; // skip this score
      for (let i = currentDateIndex; i < allDates.length; i++) {
        const key = allDates[i];
        if (!dateData[key]) continue;
        dateData[key].globalAverage = currentGlobalAvg;
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
          // guard against missing dateData entries
          if (!dateData[checkDate]) continue;
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
          
          // Calculate final score based on data type
          let finalScore;
          if (useDataType === 'raw') {
            finalScore = mostRecentData.actualAverage; // Use raw average directly
          } else {
            // Use Bayesian calculation
            finalScore = (mostRecentData.bayesAvg * recencyFactor) - mostRecentData.attemptsBonus;
          }
          
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
    
    allDates.forEach((date) => {
      const dayData = dateData[date];
      
      // Calculate average of all users' scores for this date
      const userScores = [];
      const userRawScores = [];
      Array.from(users).forEach(userName => {
        if (dayData[userName] && dayData[userName].finalScore) {
          userScores.push(dayData[userName].finalScore);
          userRawScores.push(dayData[userName].actualAverage);
        }
      });
      
      let calculatedGlobalAvg;
      if (userScores.length > 0) {
        calculatedGlobalAvg = userScores.reduce((sum, score) => sum + score, 0) / userScores.length;
      } else {
        // Fallback based on data type
        calculatedGlobalAvg = useDataType === 'raw' 
          ? dayData.globalAverage // Raw global average
          : dayData.globalAverage; // For now, same fallback - could be enhanced
      }
      
      const result = { 
        date: dayData.date,
        globalAverage: calculatedGlobalAvg
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

  // Track mouse position for portal tooltip
  const chartRef = useRef();

  // CustomTooltip using React portal
  const CustomTooltip = ({ active, payload, label, coordinate }) => {
    if (!(active && payload && payload.length && coordinate)) return null;

    // Calculate position directly without using state to avoid re-renders
    const chartRect = chartRef.current?.getBoundingClientRect();
    if (!chartRect) return null;

    const tooltipX = chartRect.left + coordinate.x - 140; // Position to left of cursor
    const tooltipY = chartRect.top + coordinate.y; // 10px offset up

    const tooltipContent = (
      <div style={{
        backgroundColor: '#fff',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        fontSize: '12px',
        color: '#333',
        fontFamily: 'inherit',
        minWidth: '155px',
        position: 'fixed',
        left: tooltipX,
        top: tooltipY,
        zIndex: 2147483647,
        pointerEvents: 'auto',
        maxWidth: '170px',
      }}>
        {/* Date Header */}
        <div style={{
          fontWeight: '700',
          marginBottom: '8px',
          color: '#333',
          fontSize: '13px',
          borderBottom: '1px solid #eee',
          paddingBottom: '4px'
        }}>
          📅 {formatDate(label)}
        </div>

        {/* Global Average Section */}
        {payload.find(entry => entry.dataKey === 'globalAverage') && (
          <div style={{
            marginBottom: '8px',
            padding: '6px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            borderLeft: '3px solid #666'
          }}>
            <div style={{
              color: '#666',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              🌍 Global {dataType === 'bayesian' ? 'Bayesian' : 'Raw'} Average
            </div>
            <div style={{
              color: '#333',
              fontSize: '12px',
              fontWeight: '500',
              marginTop: '2px'
            }}>
              {typeof payload.find(entry => entry.dataKey === 'globalAverage').value === 'number'
                ? payload.find(entry => entry.dataKey === 'globalAverage').value.toFixed(2)
                : payload.find(entry => entry.dataKey === 'globalAverage').value}
            </div>
          </div>
        )}

        {/* User Data Sections */}
        {payload.filter(entry => entry.dataKey !== 'globalAverage').map((entry, index) => {
          // Find the user data for this entry
          const userData = chartData.find(d => d.date === label);
          const userName = entry.dataKey;
          const actualAvg = userData ? userData[`${userName}_actual`] : null;
          const attempts = userData ? userData[`${userName}_attempts`] : null;

          return (
            <div key={index} style={{
              marginBottom: index < payload.filter(e => e.dataKey !== 'globalAverage').length - 1 ? '10px' : '0',
              padding: '8px',
              backgroundColor: '#fafafa',
              borderRadius: '4px',
              borderLeft: `3px solid ${entry.color || '#333'}`
            }}>
              {/* User Name */}
              <div style={{
                fontWeight: '700',
                color: entry.color || '#333',
                marginBottom: '4px',
                fontSize: '13px'
              }}>
                👤 {userName}
              </div>

              {/* Bayesian Score */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2px'
              }}>
                <span style={{ color: '#666', fontSize: '11px' }}>
                  📊 {dataType === 'bayesian' ? 'Bayesian Score' : 'Raw Average'}:
                </span>
                <span style={{ color: '#333', fontSize: '11px', fontWeight: '600' }}>
                  {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
                </span>
              </div>

              {/* Actual Average */}
              {actualAvg && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2px'
                }}>
                  <span style={{ color: '#666', fontSize: '11px' }}>📈 Actual Average:</span>
                  <span style={{ color: '#333', fontSize: '11px', fontWeight: '500' }}>
                    {actualAvg.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Total Attempts */}
              {attempts && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#666', fontSize: '11px' }}>🎯 Total Attempts:</span>
                  <span style={{ color: '#333', fontSize: '11px', fontWeight: '500' }}>
                    {attempts}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );

    return ReactDOM.createPortal(tooltipContent, document.body);
  };

  if (loading) {
    return (
      <div className={classes.bayesianChartContainer}>
        <div className={classes.bayesianLoading}>
          <img src={wordleLogo} alt="Wordle" className={classes.bayesianSpinningLogo} />
          <div className={classes.bayesianLoadingText}>Loading chart data...</div>
          <div className={classes.bayesianLoadingSubtext}>Analyzing player performance</div>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.bayesianChartContainer}>
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
          {(() => {
            const isSelected3 = selectedUsers.length === 3;
            const isSelected5 = selectedUsers.length === 5;
            const isSelected10 = selectedUsers.length === 10;
            const isClearSelected = selectedUsers.length === 0;
            
            const baseButtonStyle = {
              padding: '4px 8px',
              fontSize: '13px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '400',
              transition: 'all 0.2s ease'
            };
            
            const selectedStyle = {
              backgroundColor: '#6aaa64',
              color: 'white',
              border: '1px solid #6aaa64'
            };
            
            const defaultStyle = {
              backgroundColor: 'white',
              color: 'black',
              border: '1px solid #dee2e6'
            };
            
            const clearSelectedStyle = {
              backgroundColor: '#6aaa64',
              color: 'white',
              border: '1px solid #6aaa64'
            };
            
            const clearDefaultStyle = {
              backgroundColor: 'white',
              color: 'black',
              border: '1px solid #dee2e6'
            };
            
            return (
              <>
                <button 
                  onClick={() => selectTopUsers(3)} 
                  style={{ 
                    ...baseButtonStyle,
                    ...(isSelected3 ? selectedStyle : defaultStyle)
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected3) {
                      e.target.style.backgroundColor = '#e9ecef';
                      e.target.style.borderColor = '#adb5bd';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected3) {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = '#dee2e6';
                    }
                  }}
                >
                  Top 3
                </button>
                <button 
                  onClick={() => selectTopUsers(5)} 
                  style={{ 
                    ...baseButtonStyle,
                    ...(isSelected5 ? selectedStyle : defaultStyle)
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected5) {
                      e.target.style.backgroundColor = '#e9ecef';
                      e.target.style.borderColor = '#adb5bd';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected5) {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = '#dee2e6';
                    }
                  }}
                >
                  Top 5
                </button>
                <button 
                  onClick={() => selectTopUsers(10)} 
                  style={{ 
                    ...baseButtonStyle,
                    ...(isSelected10 ? selectedStyle : defaultStyle)
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected10) {
                      e.target.style.backgroundColor = '#e9ecef';
                      e.target.style.borderColor = '#adb5bd';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected10) {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = '#dee2e6';
                    }
                  }}
                >
                  Top 10
                </button>
                <button 
                  onClick={() => setSelectedUsers([])}
                  style={{ 
                    ...baseButtonStyle,
                    ...(isClearSelected ? clearSelectedStyle : clearDefaultStyle)
                  }}
                  onMouseEnter={(e) => {
                    if (!isClearSelected) {
                      e.target.style.backgroundColor = '#e9ecef';
                      e.target.style.borderColor = '#adb5bd';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isClearSelected) {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = '#dee2e6';
                    }
                  }}
                >
                  🗑️ Clear
                </button>
              </>
            );
          })()}
        </div>

        {/* Data Options */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
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
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url('${dropdownArrow}')`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 6px center',
                backgroundSize: '12px'
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

          {/* Data Type Selector */}
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
              📊 Data:
            </label>
            <select 
              value={dataType} 
              onChange={(e) => setDataType(e.target.value)}
              style={{ 
                padding: '4px 6px', 
                fontSize: '13px', 
                borderRadius: '4px', 
                border: '1px solid #dee2e6',
                backgroundColor: 'white',
                fontWeight: '400',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url('${dropdownArrow}')`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 6px center',
                backgroundSize: '12px'
              }}
            >
              <option value="bayesian">Bayesian Average</option>
              <option value="raw">Raw Average</option>
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

          {/* Player Selection */}
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
              🎯 Players:
            </label>
            <div className={classes.bayesianPlayerMenuContainer}>
              <div 
                className={classes.bayesianPlayerMenuButton}
                onClick={() => setIsPlayerMenuOpen(!isPlayerMenuOpen)}
              >
                <span>
                  {selectedUsers.length === 0 
                    ? 'None' 
                    : `${selectedUsers.length} selected`}
                </span>
                <span style={{ 
                  transform: isPlayerMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}>
                  ▼
                </span>
              </div>
              
              {isPlayerMenuOpen && (
                <div className={classes.bayesianPlayerMenuDropdown}>
                  {allUsers
                    .sort((a, b) => b.attempts - a.attempts)
                    .map((user, index) => {
                      const userColor = userColors[index % userColors.length];
                      const isSelected = selectedUsers.includes(user.name);
                      return (
                        <label
                          key={user.name}
                          className={`${classes.bayesianUserCheckbox} ${isSelected ? classes.bayesianSelectedUser : ''}`}
                          style={{
                            borderColor: isSelected ? userColor : '#e0e4e7',
                            borderWidth: isSelected ? '2px' : '1px',
                            margin: 0,
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
              )}
            </div>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
          ref={chartRef}
        >
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
            label={{ value: dataType === 'bayesian' ? 'Bayesian Score' : 'Raw Average', angle: -90, position: 'insideLeft' }}
            tickFormatter={(value) => value.toFixed(1)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ position: 'relative', zIndex: 1 }} />
          {/* Global Average Line - dashed */}
          <Line
            type="monotone"
            dataKey="globalAverage"
            stroke="#666666"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name={`${dataType === 'bayesian' ? 'Bayesian' : 'Raw'} Global Average`}
          />
          {/* Individual User Lines */}
          {selectedUsers.map((userName) => (
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
          <li>📈 Shows how each player&apos;s {dataType === 'bayesian' ? 'Bayesian score' : 'raw average'} evolves over time</li>
          <li>🎯 Lower scores are better (representing fewer average guesses)</li>
          <li>🧮 {dataType === 'bayesian' ? 'All lines use Bayesian scoring with recency penalty and attempts bonus' : 'All lines show simple averages of actual scores'}</li>
          <li>🌍 Dashed line: Average of all players&apos; {dataType === 'bayesian' ? 'Bayesian scores' : 'raw averages'} for each date</li>
          <li>🔗 Toggle &quot;Contiguous&quot; to connect/break lines on missing days</li>
          <li>⏰ Use time range selector to focus on specific periods</li>
        </ul>
      </div>
    </div>
  );
};

BayesianChart.propTypes = {
  getCurrentGradient: PropTypes.func.isRequired,
};

export default BayesianChart;

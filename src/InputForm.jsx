import { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { firestore } from "./firebase"; // Adjust the import path as necessary
import { sendResultToTeams } from "./sendResultToTeams";
import Leaderboard from "./Leaderboard";
import BayesianChart from "./BayesianChart";
import TopRightLogin from "./TopRightLogin";
import { Confetti } from "./Confetti";
import TabBar from "./TabBar";
import PersonalStatistics from "./PersonalStatistics";
import useStyles from "./useStyles";
import wordleLogo from './assets/wordle.png';
import TrainingWordle from "./TrainingWordle";

// Cookie helpers
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

// Restore TABS for tab navigation
const TABS = ["Wordle Game", "Training", "Score Entry", "Leaderboard", "Chart"];

const InputForm = ({
  backgroundThemes,
  selectedTheme,
  setSelectedTheme,
  customColors,
  setCustomColors,
  getCurrentGradient
}) => {
  const classes = useStyles();
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [guesses, setGuesses] = useState("");
  const [didNotFinish, setDidNotFinish] = useState(false);
  const [wordleResult, setWordleResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [pasteWordle, setPasteWordle] = useState(() => {
    const mode = getCookie("wordle-entry-mode");
    return mode === "paste";
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [alreadySubmittedToday, setAlreadySubmittedToday] = useState(false);
  const [todaysScore, setTodaysScore] = useState(null);

  useEffect(() => {
    const cookieUser = getCookie("wordle-username");
    if (cookieUser) {
      setUsername(cookieUser);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    const checkAlreadySubmitted = async () => {
      // Only check if user is logged in (not during typing in login form)
      if (!username || !isLoggedIn) {
        setAlreadySubmittedToday(false);
        setTodaysScore(null);
        return;
      }
      // Get current date in NZT
      const nzFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Pacific/Auckland',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      const formattedNZDate = nzFormatter.format(new Date());

      // Query Firestore for scores by this user (client-side filter by derived date)
      try {
        const { getDocs, query, where, collection } = await import('firebase/firestore');
        const q = query(collection(firestore, "scores"), where("name", "==", username.trim()));
        const snapshot = await getDocs(q);
        
        // Filter to today's submissions by deriving date from isoDate
        const todayScores = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.isoDate) {
            const derivedDate = nzFormatter.format(new Date(data.isoDate));
            if (derivedDate === formattedNZDate) {
              todayScores.push(data);
            }
          }
        });
        
        if (todayScores.length > 0) {
          setAlreadySubmittedToday(true);
          // Get the best score for today (lowest guesses)
          let bestScore = todayScores[0];
          todayScores.forEach(score => {
            if (score.guesses < bestScore.guesses) {
              bestScore = score;
            }
          });
          setTodaysScore(bestScore);
        } else {
          setAlreadySubmittedToday(false);
          setTodaysScore(null);
        }
      } catch (err) {
        setAlreadySubmittedToday(false);
        setTodaysScore(null);
      }
    };
    checkAlreadySubmitted();
  }, [username, activeTab, isLoggedIn]);

  const handleLogin = (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    // Only allow a-z, A-Z, and spaces, 3-20 chars
    const valid = /^[a-zA-Z ]{3,20}$/.test(trimmed);
    if (!valid) {
      alert("Name must be 3-20 letters or spaces (a-z, A-Z, spaces) only.");
      return;
    }
    // Auto-capitalize each word (e.g., "john do" becomes "John Do")
    const capitalizedName = trimmed
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    setCookie("wordle-username", capitalizedName);
    setUsername(capitalizedName);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setCookie("wordle-username", "", -1);
    setIsLoggedIn(false);
    setUsername("");
  };


  const parseWordleResult = (result) => {
    const lines = result.toString().trim().split("\n");
    const metadataLine = lines[0].trim();

    // Check for hard mode asterisk
    const hardMode = metadataLine.endsWith("*");
    // Remove asterisk for parsing
    const cleanMetadataLine = hardMode ? metadataLine.slice(0, -1).trim() : metadataLine;

    // Regular expressions to match different formats
    const metadataMatch = cleanMetadataLine.charAt(cleanMetadataLine.length - 3);
    const wordleNumber = cleanMetadataLine.split(" ")[1];
    let numberOfGuesses = 0;
    let isDNF = false;
    if (!(parseInt(metadataMatch, 10) > 0 && parseInt(metadataMatch, 10) < 7)) {
      isDNF = true;
    } else {
      numberOfGuesses = parseInt(metadataMatch, 10);
    }

    // Extract the result blocks (lines) from the remaining part
    const resultBlocks = lines.slice(2, lines.length);

    return [numberOfGuesses, wordleNumber, resultBlocks, isDNF, hardMode]; // Add hardMode to tuple
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowOverlay(true);

    // Get the final name to use
    const finalName = username.trim();

    if (!finalName) {
      alert("Please provide your name.");
      setLoading(false);
      setShowOverlay(false);
      return;
    }

    // Validate custom name length (3-12 characters)
    if (finalName.length < 3 || finalName.length > 12) {
      alert("Name must be between 3 and 12 characters long.");
      setLoading(false);
      setShowOverlay(false);
      return;
    }

    let finalGuesses = 0;
    let wordleNumber = '';
    let resultBlocks = [];
    let isDNF = didNotFinish; // Start with the checkbox value
    let hardMode = false; // Default hard mode to false
    let parsedWordleGuesses = null;

    if (pasteWordle && wordleResult.trim().length > 0) {
      // Parse the pasted result
      const [parsedGuesses, parsedWordleNumber, parsedResultBlocks, parsedIsDNF, parsedHardMode] =
        parseWordleResult(wordleResult);
      parsedWordleGuesses = parsedGuesses;

      // Check for conflict between pasted result and DNF checkbox
      if (didNotFinish && !parsedIsDNF && parsedWordleGuesses > 0 && parsedWordleGuesses <= 6) {
        // User checked DNF but pasted a successful result - show confirmation
        const confirmOverride = window.confirm(
          `Conflict detected: You checked "Did Not Finish" but your pasted result shows you completed it in ${parsedGuesses} guesses.\n\n` +
          `Click OK to use your actual score (${parsedGuesses}) or Cancel to cancel submission.`
        );

        if (confirmOverride) {
          // Use the pasted result and uncheck DNF
          isDNF = false;
          setDidNotFinish(false);
          finalGuesses = parsedGuesses;
        } else {
          // Cancel the submission entirely
          setLoading(false);
          setShowOverlay(false);
          return;
        }
      } else {
        // No conflict - use parsed result or update DNF status if detected
        isDNF = isDNF || parsedIsDNF;
        finalGuesses = isDNF ? 7 : parsedGuesses;
      }

      // Set the values from parsing
      wordleNumber = parsedWordleNumber;
      resultBlocks = parsedResultBlocks;
      // Add hardMode
      hardMode = parsedHardMode;
    } else {
      // Manual entry - if DNF, set to 7, otherwise use the entered guesses
      finalGuesses = isDNF ? 7 : parseInt(guesses, 10) || 0;

      // Estimate current Wordle number for manual entries
      // Wordle started on June 19, 2021 (Wordle #1 was June 19, 2021)
      const startDate = new Date('2021-06-19');
      const today = new Date();
      const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
      wordleNumber = (daysDiff + 1).toString();
    }

    // Additional validation
    const isWordleResultPasted = wordleResult.trim().length > 0;
    const isNumGuessesProvided = parseInt(guesses, 10) > 0;

    if (!finalName) {
      alert("Please provide your name.");
      setLoading(false);
      setShowOverlay(false);
      return;
    }

    // Check for conflict between manual score entry and DNF checkbox
    if (!pasteWordle && didNotFinish && isNumGuessesProvided && parseInt(guesses, 10) >= 1 && parseInt(guesses, 10) <= 6) {
      const confirmDNF = window.confirm(
        `Conflict detected: You checked "Did Not Finish" but entered a valid score of ${guesses} guesses.\n\n` +
        `Click OK to use your actual score (${guesses}) or Cancel to cancel submission.`
      );

      if (confirmDNF) {
        // Use the entered score and uncheck DNF
        isDNF = false;
        setDidNotFinish(false);
        finalGuesses = parseInt(guesses, 10);
      } else {
        // Cancel the submission entirely
        setLoading(false);
        setShowOverlay(false);
        return;
      }
    }

    if (pasteWordle) {
      if (!isWordleResultPasted) {
        alert("Please provide the Wordle result.");
        setLoading(false);
        setShowOverlay(false);
        return;
      }
      if (isDNF) {
        if (!didNotFinish) {
          // Automatically check the DNF box when detected from pasted result
          setDidNotFinish(true);
        }
      } else if (parsedWordleGuesses !== null && isNumGuessesProvided && parseInt(guesses, 10) !== parsedWordleGuesses) {
        alert(
          `Mismatch detected: Number of guesses (${parseInt(guesses, 10)}) does not match the pasted result (${parsedWordleGuesses}).`
        );
        setLoading(false);
        setShowOverlay(false);
        return;
      }
    } else if (!pasteWordle && !isNumGuessesProvided && !didNotFinish) {
      alert("Please provide the number of guesses or select 'Did Not Finish'.");
      setLoading(false);
      setShowOverlay(false);
      return;
    }

    // Make sure we always have a valid guesses value (should be 1-6 or 7 for DNF)
    if (finalGuesses <= 0 || finalGuesses > 7) {
      finalGuesses = isDNF ? 7 : 0;
    }

    // Proceed only if we have valid guesses
    if (finalGuesses === 0 && !isDNF) {
      alert("Please provide the number of guesses or select 'Did Not Finish'.");
      setLoading(false);
      setShowOverlay(false);
      return;
    }

    // Create ISO datetime with the current actual time
    // Save the exact time when the score was submitted
    const isoDateTime = new Date().toISOString();

    try {
      // Store in Firestore - ensure guesses is 7 for DNF and include dnf flag
      await addDoc(collection(firestore, "scores"), {
        name: finalName,
        guesses: isDNF ? 7 : finalGuesses,
        isoDate: isoDateTime,
        dnf: isDNF,
        wordleNumber: wordleNumber || null,
        hardMode: hardMode, // Save hardMode boolean
      });

      // Update state to show personal statistics immediately
      setAlreadySubmittedToday(true);
      setTodaysScore({
        name: finalName,
        guesses: isDNF ? 7 : finalGuesses,
        isoDate: isoDateTime,
        dnf: isDNF,
        wordleNumber: wordleNumber || null,
        hardMode: hardMode
      });

      // Reset form
      setGuesses("");
      setDidNotFinish(false);
      setWordleResult("");
      setPasteWordle(false);

      // Show confetti for excellent scores (1 to 3 guesses)
      if (!isDNF && finalGuesses <= 3) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000); // Hide after 4 seconds
      }

      // Send to Teams webhook
      if (pasteWordle && isWordleResultPasted) {
        await sendResultToTeams(
          finalGuesses,  // Use the calculated final guesses
          wordleNumber,
          finalName,
          isDNF,        // Use the calculated isDNF
          resultBlocks,
          hardMode      // Pass hardMode to webhook
        );
      } else if (!pasteWordle && (isNumGuessesProvided || isDNF)) {
        // Send webhook for manual entries (both scored and DNF)
        await sendResultToTeams(
          finalGuesses,
          wordleNumber || "Unknown",
          finalName,
          isDNF,
          [],
          hardMode      // Pass hardMode to webhook (will be false)
        );
      }
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setShowOverlay(false);
        // Keep user on Score Entry tab to see their personal statistics
      }, 3000);
    }
  };

  // Check if form is valid for submit button state
  const isFormValid = () => {
    const finalName = username.trim();

    // Must have a name
    if (!finalName) return false;

    // Custom name must be 3-12 characters
    if (finalName.length < 3 || finalName.length > 12) return false;

    // Must have either guesses, DNF, or paste wordle with content
    if (pasteWordle) {
      return wordleResult.trim().length > 0;
    } else {
      return didNotFinish || (guesses && parseInt(guesses, 10) >= 1 && parseInt(guesses, 10) <= 6);
    }
  };

  // Login screen
  if (!isLoggedIn) {
    return (
      <div className={classes.loginContainer}>
        <h2 className={classes.loginTitle}>Wordle Leaderboard</h2>
        <p className={classes.loginSubtitle}>Track your Wordle progress and compete with friends</p>
        <form onSubmit={handleLogin}>
          <label htmlFor="username" className={classes.loginLabel}>Choose Your Name:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            minLength={3}
            maxLength={20}
            required
            className={classes.loginInput}
            placeholder="Enter your name"
          />
          <button type="submit" className={classes.loginButton}>
            Submit Your Name
          </button>
        </form>
      </div>
    );
  }

  // Main app with tabs and content
  return (
    <>
      <TopRightLogin
        isLoggedIn={isLoggedIn}
        username={username}
        getCurrentGradient={getCurrentGradient}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        backgroundThemes={backgroundThemes}
        selectedTheme={selectedTheme}
        setSelectedTheme={setSelectedTheme}
        customColors={customColors}
        setCustomColors={setCustomColors}
        handleLogout={handleLogout}
      />
      <div className={classes.mainResponsiveMargin}>
        <div style={{
          textAlign: "center",
          marginBottom: "1rem",
          width: "100%"
        }}>
        </div>
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className={classes.contentCard}>

          {activeTab === "Score Entry" && (
            <div className={classes.activeTab}>
              <div className={classes.header}>
                <h1 className={classes.headerTitle}>Score Entry</h1>
                <p className={classes.headerSubtitle}>
                  Submit your daily Wordle results and track your progress
                </p>
              </div>
              <div className={classes.innerContentCard}>
                {alreadySubmittedToday ? (
                  <PersonalStatistics 
                    username={username}
                    todaysScore={todaysScore}
                    getCurrentGradient={getCurrentGradient}
                  />
                ) : (
                  <form onSubmit={handleSubmit} className={classes.form}>
                    <div className={classes.toggleContainer}>
                      <div className={classes.modeSelector}>
                        <button
                          type="button"
                          onClick={() => {
                            setPasteWordle(false);
                            setCookie("wordle-entry-mode", "manual");
                          }}
                          className={`${classes.modeOption} ${!pasteWordle ? classes.activeMode : ''}`}
                        >
                          ✏️ Manual Entry
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPasteWordle(true);
                            setCookie("wordle-entry-mode", "paste");
                          }}
                          className={`${classes.modeOption} ${pasteWordle ? classes.activeMode : ''}`}
                        >
                          📋 Paste Result
                        </button>
                      </div>
                    </div>
                    <div className={classes.formContentArea}>
                      {!pasteWordle && (
                        <>
                          <div className={classes.formGroup}>
                            <label htmlFor="guesses">Enter your guesses (1-6):</label>
                            <input
                              id="guesses"
                              type="number"
                              value={guesses}
                              onChange={e => setGuesses(e.target.value)}
                              min="1"
                              max="6"
                              required={!didNotFinish}
                              className={classes.input}
                            />
                          </div>
                          <div className={classes.checkboxGroup}>
                            <label className={classes.checkboxWrapper}>
                              <input
                                type="checkbox"
                                checked={didNotFinish}
                                onChange={e => setDidNotFinish(e.target.checked)}
                                className={classes.checkbox}
                              />
                              <span style={{ marginLeft: "8px" }}>Did Not Finish (DNF)</span>
                            </label>
                          </div>
                        </>
                      )}
                      {pasteWordle && (
                        <>
                          <div className={classes.formGroup}>
                            <label htmlFor="wordleResult">Paste your Wordle result:</label>
                            <textarea
                              id="wordleResult"
                              value={wordleResult}
                              onChange={e => setWordleResult(e.target.value)}
                              className={classes.textarea}
                              placeholder={`Paste your Wordle result here:

Wordle 1,234 4/6

⬛🟨🟨🟨⬛
🟨⬛🟨⬛🟨
⬛🟩🟩🟩⬛
🟩🟩🟩🟩🟩`}
                            style={{
                              backgroundColor: "white",
                              cursor: "text"
                            }}
                          />
                        </div>
                      </>
                    )}
                    </div>
                    <button
                      type="submit"
                      className={classes.button}
                      style={{ background: getCurrentGradient(), transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
                      disabled={loading || !isFormValid()}
                      onMouseOver={e => {
                        e.target.style.filter = 'brightness(1.1)';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
                      }}
                      onMouseOut={e => {
                        e.target.style.filter = 'brightness(1)';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '';
                      }}
                    >
                      {loading ? (
                        <>
                          <img src={wordleLogo} alt="Submitting" className={classes.spinningLogo ? classes.spinningLogo : ''} style={{ width: 28, height: 'auto' }} />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        "Submit Score"
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
          {activeTab === "Leaderboard" && (
            <div style={{ padding: "2rem", width: "100%", minHeight: "60vh" }}>
              <Leaderboard getCurrentGradient={getCurrentGradient} />
            </div>
          )}
          {activeTab === "Chart" && (
            <div style={{ padding: "2rem", width: "100%", minHeight: "60vh" }}>
              <div className={classes.header}>
                <h1 className={classes.headerTitle}>Performance Charts</h1>
                <p className={classes.headerSubtitle}>
                  Analyze your Wordle performance trends over time
                </p>
              </div>
              <BayesianChart getCurrentGradient={getCurrentGradient} />
            </div>
          )}
          {activeTab === "Training" && (
            <div style={{ padding: "2rem", width: "100%", minHeight: "60vh" }}>
              <div className={classes.header}>
                <h1 className={classes.headerTitle}>Training Mode</h1>
                <p className={classes.headerSubtitle}>
                  Practice Wordle locally with instant feedback before submitting your real score
                </p>
              </div>
              <TrainingWordle getCurrentGradient={getCurrentGradient} />
            </div>
          )}
          {activeTab === "Wordle Game" && (
            <div style={{ padding: "2rem", width: "100%", minHeight: "60vh" }}>
              <div className={classes.header}>
                <h1 className={classes.headerTitle}>Today&apos;s Wordle</h1>
                <p className={classes.headerSubtitle}>
                  Play the official New York Times Wordle game
                </p>
              </div>
              <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                justifyContent: "center",
                textAlign: "center",
                gap: "2rem",
                flexGrow: 1
              }}>
                <div className={classes.innerContentCard}>
                  <div style={{
                    fontSize: "3rem",
                    marginBottom: "1rem"
                  }}>
                    🎯
                  </div>
                <p className={classes.greyParagraph}>
                  The New York Times Wordle game cannot be embedded directly. Click the button below to open Wordle in a new tab.
                </p>
                <br />
                <button
                  onClick={() => {
                    window.open('https://www.nytimes.com/games/wordle', '_blank', 'noopener,noreferrer');
                    setActiveTab('Score Entry');
                  }}
                  className={classes.playButtonStyle}
                  style={{
                    background: getCurrentGradient ? getCurrentGradient() : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.4)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.3)";
                  }}
                  onMouseDown={(e) => {
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onMouseUp={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                  }}
                >
                  <span>🔗</span>
                  Open Wordle Game
                </button>
                <div className={classes.greyParagraphSubText}>
                  After playing, come back here to submit your score!
                </div>
              </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {showOverlay && (
        <div className={`${classes.overlay} ${showOverlay ? '' : classes.hidden}`}>
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            color: "#333",
            padding: "2rem 3rem",
            borderRadius: "16px",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            fontWeight: "600"
          }}>Score submitted successfully! 🎉</div>
        </div>
      )}
  <Confetti show={showConfetti} />
    </>
  );
};

export default InputForm;
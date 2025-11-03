import { useState, useEffect } from "react";

const TopRightLogin = ({
  isLoggedIn,
  username,
  getCurrentGradient,
  getAccentGradient,
  showSettings,
  setShowSettings,
  backgroundThemes,
  selectedTheme,
  setSelectedTheme,
  customColors,
  setCustomColors,
  handleLogout,
  darkMode,
  setDarkMode
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 480);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the settings container
      const settingsContainer = event.target.closest('[data-settings-container]');
      if (showSettings && !settingsContainer) {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      // Add a small delay to prevent immediate closing when opening
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSettings, setShowSettings]);

  return (
  <div style={{
    position: "fixed",
    top: "0.75rem",
    right: "0.75rem",
    display: "flex",
    alignItems: "center",
    gap: isMobile ? "0.4rem" : "0.6rem",
    background: "var(--card-bg, rgba(255, 255, 255, 0.98))",
    backdropFilter: "blur(8px)",
    padding: isMobile ? "0.4rem 0.6rem" : "0.6rem 0.8rem",
    borderRadius: "50px",
    boxShadow: "var(--shadow-medium, 0 2px 12px rgba(0,0,0,0.08))",
    fontSize: isMobile ? "11px" : "13px",
    fontWeight: "500",
    zIndex: 200,
    border: "1px solid var(--border-light, rgba(255, 255, 255, 0.3))",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  }}>
    {isLoggedIn && (
      <>
        <span style={{ color: "var(--text-primary, #374151)" }}>
          {isMobile ? username : `Welcome, ${username}`}
        </span>
        {/* Settings Button */}
        <div style={{ position: "relative" }} data-settings-container>
          <button
            style={{
              width: isMobile ? "24px" : "28px",
              height: isMobile ? "24px" : "28px",
              borderRadius: "50%",
              border: "none",
              background: getAccentGradient ? getAccentGradient() : getCurrentGradient ? getCurrentGradient() : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
              transition: "all 0.2s ease",
              position: "relative"
            }}
            onMouseOver={e => {
              e.target.style.transform = "scale(1.1)";
              e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.25)";
            }}
            onMouseOut={e => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.15)";
            }}
            onClick={() => setShowSettings(!showSettings)}
            title="Settings & Options"
          >
            <span style={{
              color: "white",
              fontSize: isMobile ? "12px" : "14px",
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.6)"
            }}>
              ⚙️
            </span>
          </button>
          {/* Settings Dropdown */}
          {showSettings && (
            <div style={{
              position: 'absolute',
              top: '35px',
              right: '0',
              width: isMobile ? '280px' : '320px',
              maxWidth: 'calc(100vw - 2rem)',
              backgroundColor: 'var(--card-bg, rgba(255, 255, 255, 0.95))',
              backdropFilter: 'blur(15px)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-large, 0 8px 32px rgba(0, 0, 0, 0.2))',
              border: '1px solid var(--border-light, rgba(255, 255, 255, 0.3))',
              padding: '0',
              zIndex: 1000
            }}>
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-light, rgba(0, 0, 0, 0.1))',
                backgroundColor: 'var(--secondary-bg, rgba(255, 255, 255, 0.8))',
                borderRadius: '12px 12px 0 0'
              }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--text-primary, #333)'
                }}>
                  🎨 Background Themes
                </span>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '14px',
                    cursor: 'pointer',
                    color: 'var(--text-secondary, #666)',
                    padding: '4px'
                  }}
                  onClick={() => setShowSettings(false)}
                >
                  ✕
                </button>
              </div>
              {/* Theme Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '8px',
                padding: '12px'
              }}>
                {backgroundThemes && Object.entries(backgroundThemes).filter(([key]) => key !== 'custom').map(([key, theme]) => (
                  <button
                    key={key}
                    style={{
                      height: isMobile ? '40px' : '50px',
                      border: selectedTheme === key ? '3px solid rgba(255, 255, 255, 0.8)' : 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease',
                      boxShadow: selectedTheme === key ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                      background: theme.gradient,
                      transform: selectedTheme === key ? 'translateY(-2px)' : 'translateY(0)'
                    }}
                    onClick={() => setSelectedTheme(key)}
                    title={theme.name}
                    onMouseOver={e => {
                      if (selectedTheme !== key) {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                      }
                    }}
                    onMouseOut={e => {
                      if (selectedTheme !== key) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                      }
                    }}
                  >
                    <span style={{
                      position: 'absolute',
                      bottom: '4px',
                      left: '8px',
                      right: '8px',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: '600',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.7)',
                      textAlign: 'center',
                      lineHeight: '1.2'
                    }}>
                      {theme.name}
                    </span>
                  </button>
                ))}
              </div>
              {/* Custom Colors Section */}
              <div style={{
                borderTop: '1px solid var(--border-light, rgba(0, 0, 0, 0.1))',
                padding: '12px',
                backgroundColor: 'var(--secondary-bg, rgba(248, 249, 250, 0.8))'
              }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-primary, #333)',
                  marginBottom: '8px'
                }}>
                  🎨 Custom Colors
                </div>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <div style={{ flex: 1 }}>
                    <label style={{
                      fontSize: '10px',
                      color: 'var(--text-secondary, #666)',
                      fontWeight: '500',
                      display: 'block',
                      marginBottom: '2px'
                    }}>
                      Color 1:
                    </label>
                    <input
                      type="color"
                      value={customColors ? customColors.color1 : '#667eea'}
                      onChange={e => setCustomColors && setCustomColors(prev => ({ ...prev, color1: e.target.value }))}
                      style={{
                        width: '100%',
                        height: isMobile ? '28px' : '32px',
                        border: '1px solid var(--input-border, #ddd)',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{
                      fontSize: '10px',
                      color: 'var(--text-secondary, #666)',
                      fontWeight: '500',
                      display: 'block',
                      marginBottom: '2px'
                    }}>
                      Color 2:
                    </label>
                    <input
                      type="color"
                      value={customColors ? customColors.color2 : '#764ba2'}
                      onChange={e => setCustomColors && setCustomColors(prev => ({ ...prev, color2: e.target.value }))}
                      style={{
                        width: '100%',
                        height: isMobile ? '28px' : '32px',
                        border: '1px solid var(--input-border, #ddd)',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </div>
                <button
                  style={{
                    width: '100%',
                    height: isMobile ? '36px' : '40px',
                    border: selectedTheme === 'custom' ? '3px solid rgba(255, 255, 255, 0.8)' : 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: customColors ? `linear-gradient(135deg, ${customColors.color1} 0%, ${customColors.color2} 100%)` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '600',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.7)',
                    transition: 'all 0.2s ease',
                    boxShadow: selectedTheme === 'custom' ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                  onClick={() => setSelectedTheme('custom')}
                >
                  Use Custom
                </button>
              </div>
              {/* Dark Mode Toggle Section */}
              <div style={{
                borderTop: '1px solid var(--border-light, rgba(0, 0, 0, 0.1))',
                padding: '12px',
                backgroundColor: 'var(--secondary-bg, rgba(248, 249, 250, 0.8))'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '16px' }}>{darkMode ? '🌙' : '☀️'}</span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'var(--text-primary, #333)'
                    }}>
                      Dark Mode
                    </span>
                  </div>
                  <button
                    style={{
                      width: '50px',
                      height: '26px',
                      borderRadius: '13px',
                      border: 'none',
                      background: darkMode ? '#3b82f6' : '#d1d5db',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'background 0.3s ease',
                      padding: 0
                    }}
                    onClick={() => setDarkMode(!darkMode)}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'white',
                      position: 'absolute',
                      top: '3px',
                      left: darkMode ? '27px' : '3px',
                      transition: 'left 0.3s ease',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                    }} />
                  </button>
                </div>
              </div>
              {/* Clear Cache Section */}
              <div style={{
                borderTop: '1px solid var(--border-light, rgba(0, 0, 0, 0.1))',
                padding: '12px',
                backgroundColor: 'var(--secondary-bg, rgba(248, 249, 250, 0.8))'
              }}>
                <button
                  style={{
                    width: '100%',
                    fontSize: "13px",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-light, #ddd)",
                    background: "var(--card-bg, white)",
                    color: "var(--text-primary, #333)",
                    cursor: "pointer",
                    fontWeight: "600",
                    transition: "all 0.2s ease",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                  onMouseOver={e => {
                    e.target.style.background = '#f59e0b';
                    e.target.style.color = 'white';
                    e.target.style.borderColor = '#f59e0b';
                  }}
                  onMouseOut={e => {
                    e.target.style.background = 'var(--card-bg, white)';
                    e.target.style.color = 'var(--text-primary, #333)';
                    e.target.style.borderColor = 'var(--border-light, #ddd)';
                  }}
                  onClick={() => {
                    localStorage.removeItem('leaderboard-cache');
                    localStorage.removeItem('leaderboard-cache-timestamp');
                    localStorage.removeItem('bayesian-chart-cache');
                    localStorage.removeItem('bayesian-chart-cache-timestamp');
                    console.log('🗑️ Cache manually cleared');
                    alert('Cache cleared! The page will reload to fetch fresh data.');
                    window.location.reload();
                  }}
                >
                  🗑️ Clear Cache & Reload
                </button>
              </div>
              {/* Logout Section */}
              <div style={{
                borderTop: '1px solid var(--border-light, rgba(0, 0, 0, 0.1))',
                padding: '12px',
                backgroundColor: 'var(--secondary-bg, rgba(248, 249, 250, 0.8))'
              }}>
                <button
                  style={{
                    width: '100%',
                    fontSize: "14px",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#b91c1c",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: "600",
                    transition: "all 0.2s ease",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                  onMouseOver={e => e.target.style.background = "#b91c1c"}
                  onMouseOut={e => e.target.style.background = "#dc2626"}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </>
    )}
  </div>
  );
};

export default TopRightLogin;

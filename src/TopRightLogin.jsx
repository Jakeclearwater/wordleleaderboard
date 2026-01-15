import { useState, useEffect } from "react";
import PatchNotesModal from "./PatchNotesModal";
import versionInfo from './version.json';

// Import custom notifications
const customNotifications = import.meta.glob('../notifications/*.json', { eager: true });

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
  const [showPatchNotes, setShowPatchNotes] = useState(false);
  const [hasUnreadPatchNotes, setHasUnreadPatchNotes] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showCustomColors, setShowCustomColors] = useState(selectedTheme === 'custom');

  // Check if patch notes should be shown
  useEffect(() => {
    const checkPatchNotesStatus = () => {
      // Load all custom notifications
      const customNotificationsList = Object.values(customNotifications)
        .map(module => module.default)
        .filter(notification => notification && notification.type === 'custom');
      
      // Build list of all PR notifications
      const prNotifications = [];
      
      if (versionInfo.pr) {
        prNotifications.push({ id: `pr-${versionInfo.pr.prNumber}` });
      }
      
      if (versionInfo.recentPRs && Array.isArray(versionInfo.recentPRs)) {
        versionInfo.recentPRs.forEach(pr => {
          const isDuplicate = versionInfo.pr && pr.prNumber === versionInfo.pr.prNumber;
          if (!isDuplicate) {
            prNotifications.push({ id: `pr-${pr.prNumber}` });
          }
        });
      }
      
      const allNotifications = [...prNotifications, ...customNotificationsList];
      
      // Get list of dismissed versions
      const dismissedVersionsStr = getCookie('patch-notes-dismissed-versions');
      const dismissedVersions = dismissedVersionsStr ? dismissedVersionsStr.split(',').filter(v => v) : [];
      
      // Count unread notifications
      const unreadNotifications = allNotifications.filter(notification => {
        return !dismissedVersions.includes(notification.id);
      });
      
      const count = unreadNotifications.length;
      setHasUnreadPatchNotes(count > 0);
      setUnreadCount(count);
    };
    
    checkPatchNotesStatus();
  }, []);

  useEffect(() => {
    if (selectedTheme === 'custom') {
      setShowCustomColors(true);
    }
  }, [selectedTheme]);

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

  const handleDismissVersion = (versionId) => {
    // Get existing dismissed versions
    const dismissedVersionsStr = getCookie('patch-notes-dismissed-versions');
    const dismissedVersions = dismissedVersionsStr ? dismissedVersionsStr.split(',').filter(v => v) : [];
    
    // Add version if not already dismissed
    if (!dismissedVersions.includes(versionId)) {
      dismissedVersions.push(versionId);
    }
    
    // Save updated list
    setCookie('patch-notes-dismissed-versions', dismissedVersions.join(','), 365);
    
    // Recalculate unread count for all notifications
    const customNotificationsList = Object.values(customNotifications)
      .map(module => module.default)
      .filter(notification => notification && notification.type === 'custom');
    
    // Build list of all PR notifications
    const prNotifications = [];
    
    if (versionInfo.pr) {
      prNotifications.push({ id: `pr-${versionInfo.pr.prNumber}` });
    }
    
    if (versionInfo.recentPRs && Array.isArray(versionInfo.recentPRs)) {
      versionInfo.recentPRs.forEach(pr => {
        const isDuplicate = versionInfo.pr && pr.prNumber === versionInfo.pr.prNumber;
        if (!isDuplicate) {
          prNotifications.push({ id: `pr-${pr.prNumber}` });
        }
      });
    }
    
    const allNotifications = [...prNotifications, ...customNotificationsList];
    
    // Count unread notifications
    const unreadNotifications = allNotifications.filter(notification => {
      return !dismissedVersions.includes(notification.id);
    });
    
    const count = unreadNotifications.length;
    setHasUnreadPatchNotes(count > 0);
    setUnreadCount(count);
  };

  const handleOpenPatchNotes = () => {
    setShowPatchNotes(true);
    setShowSettings(false); // Close settings when opening patch notes
  };

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
            {/* Notification Badge */}
            {hasUnreadPatchNotes && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                minWidth: '18px',
                height: '18px',
                backgroundColor: '#ef4444',
                borderRadius: '50%',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: '700',
                color: 'white',
                padding: unreadCount > 9 ? '0 4px' : '0',
                animation: 'notification-pulse 2s ease-in-out infinite, notification-glow 2s ease-in-out infinite'
              }}>
                {unreadCount}
              </span>
            )}
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
                  ⚙️ App Settings
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
              {/* Theme Picker */}
              <div style={{
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <label style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-primary, #333)'
                }} htmlFor="theme-select">
                  Theme
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <select
                    id="theme-select"
                    value={selectedTheme}
                    onChange={e => setSelectedTheme(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--input-border, #d1d5db)',
                      background: 'var(--card-bg, rgba(255, 255, 255, 0.9))',
                      color: 'var(--text-primary, #333)',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)'
                    }}
                  >
                    {backgroundThemes && Object.entries(backgroundThemes).map(([key, theme]) => (
                      <option key={key} value={key}>
                        {theme.name}
                      </option>
                    ))}
                  </select>
                  <div style={{
                    width: '46px',
                    height: '26px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light, rgba(0, 0, 0, 0.1))',
                    background: selectedTheme === 'custom' && customColors
                      ? `linear-gradient(135deg, ${customColors.color1} 0%, ${customColors.color2} 100%)`
                      : backgroundThemes && backgroundThemes[selectedTheme]
                        ? backgroundThemes[selectedTheme].gradient
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.12)',
                    position: 'relative',
                    overflow: 'hidden'
                  }} aria-hidden="true">
                    {/* Add stars for space theme */}
                    {selectedTheme === 'monochrome' && (
                      <>
                        <div style={{
                          position: 'absolute',
                          top: '4px',
                          right: '6px',
                          width: '1.5px',
                          height: '1.5px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          boxShadow: '0 0 2px rgba(255, 255, 255, 0.8)'
                        }} />
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '14px',
                          width: '1px',
                          height: '1px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255, 255, 255, 0.7)',
                          boxShadow: '0 0 1px rgba(255, 255, 255, 0.6)'
                        }} />
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '22px',
                          width: '1px',
                          height: '1px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255, 255, 255, 0.6)',
                          boxShadow: '0 0 1px rgba(255, 255, 255, 0.5)'
                        }} />
                        <div style={{
                          position: 'absolute',
                          top: '18px',
                          right: '8px',
                          width: '1px',
                          height: '1px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          boxShadow: '0 0 1.5px rgba(255, 255, 255, 0.7)'
                        }} />
                      </>
                    )}
                  </div>
                </div>
              </div>
              {/* Custom Colors Section */}
              <div style={{
                borderTop: '1px solid var(--border-light, rgba(0, 0, 0, 0.1))',
                padding: '12px',
                backgroundColor: 'var(--secondary-bg, rgba(248, 249, 250, 0.8))'
              }}>
                <button
                  type="button"
                  onClick={() => setShowCustomColors(prev => !prev)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--text-primary, #333)',
                    cursor: 'pointer'
                  }}
                >
                  <span>🎨 Custom Colors</span>
                  <span style={{
                    fontSize: '14px',
                    transition: 'transform 0.2s ease',
                    transform: showCustomColors ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}>▾</span>
                </button>
                {showCustomColors && (
                  <div style={{
                    marginTop: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '8px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <label style={{
                          fontSize: '10px',
                          color: 'var(--text-secondary, #666)',
                          fontWeight: '500',
                          display: 'block',
                          marginBottom: '4px'
                        }}>
                          Color 1
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
                          marginBottom: '4px'
                        }}>
                          Color 2
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
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{
                        flex: 1,
                        height: '28px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-light, rgba(0,0,0,0.12))',
                        background: customColors ? `linear-gradient(135deg, ${customColors.color1} 0%, ${customColors.color2} 100%)` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: 'inset 0 0 4px rgba(15, 23, 42, 0.12)'
                      }} aria-hidden="true" />
                      {selectedTheme !== 'custom' && (
                        <button
                          type="button"
                          style={{
                            marginLeft: '12px',
                            background: 'none',
                            border: 'none',
                            color: '#6366f1',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                          onClick={() => setSelectedTheme('custom')}
                        >
                          Use these colors
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* Quick Actions */}
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
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--text-primary, #333)'
                  }}>
                    Quick Actions
                  </span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <button
                      type="button"
                      title="Clear cache & reload"
                      aria-label="Clear cache and reload"
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        border: '1px solid var(--border-light, rgba(0,0,0,0.15))',
                        background: 'var(--card-bg, white)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '16px',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        boxShadow: 'none'
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 14px rgba(0, 0, 0, 0.15)';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
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
                      🗑️
                    </button>
                    <button
                      type="button"
                      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                      aria-label="Toggle dark mode"
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        border: '1px solid var(--border-light, rgba(0,0,0,0.15))',
                        background: 'var(--card-bg, white)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '16px',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        boxShadow: 'none'
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 14px rgba(0, 0, 0, 0.15)';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      onClick={() => setDarkMode(!darkMode)}
                    >
                      {darkMode ? '☀️' : '🌙'}
                    </button>
                    <button
                      type="button"
                      title={hasUnreadPatchNotes ? "Messages (new updates available)" : "Messages"}
                      aria-label="Show messages"
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        border: '1px solid var(--border-light, rgba(0,0,0,0.15))',
                        background: 'var(--card-bg, white)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '16px',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        position: 'relative',
                        boxShadow: 'none'
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 14px rgba(0, 0, 0, 0.15)';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      onClick={handleOpenPatchNotes}
                    >
                      💬
                      {hasUnreadPatchNotes && (
                        <span style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          minWidth: '16px',
                          height: '16px',
                          backgroundColor: '#ef4444',
                          borderRadius: '50%',
                          border: '2px solid white',
                          boxShadow: '0 0 4px rgba(239, 68, 68, 0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '9px',
                          fontWeight: '700',
                          color: 'white',
                          padding: unreadCount > 9 ? '0 3px' : '0',
                          animation: 'notification-pulse 2s ease-in-out infinite, notification-glow 2s ease-in-out infinite'
                        }}>
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
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
    {/* Patch Notes Modal */}
    {showPatchNotes && (
      <PatchNotesModal 
        onClose={() => setShowPatchNotes(false)} 
        getAccentGradient={getAccentGradient}
        getCurrentGradient={getCurrentGradient}
        dismissedVersions={getCookie('patch-notes-dismissed-versions')?.split(',') || []}
        onDismissVersion={handleDismissVersion}
      />
    )}
  </div>
  );
};

export default TopRightLogin;

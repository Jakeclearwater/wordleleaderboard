import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({

    header: {
        textAlign: 'center',
        marginBottom: 'var(--space-8)',
        position: 'relative',
    },
    
    headerTitle: {
        fontSize: 'clamp(2rem, 5vw, 3rem)',
        fontWeight: '800',
        color: 'var(--text-primary, #1f2937)',
        margin: '0 0 var(--space-3) 0',
        letterSpacing: '-0.02em',
    },
    
    headerSubtitle: {
        fontSize: '1.2rem',
        color: 'var(--text-secondary, #6b7280)',
        fontWeight: '400',
        margin: 0,
    },

    todaysScore: {
        marginTop: "1.5rem",
        fontSize: "1.1rem",
        color: "#2563eb",
        background: "#f3f4f6",
        borderRadius: "8px",
        padding: "1rem 1.5rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        fontWeight: "600"
    },

    playButtonStyle: {
        padding: "16px 32px",
        borderRadius: "12px",
        border: "none",
        color: "white",
        fontSize: "16px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s ease",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        margin: "0 auto"
    },

    activeTab: {
        padding: "2rem",
        width: "100%",
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: "2rem"
    },

    contentCard: {
        width: "100%",
        background: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(8px)",
        borderRadius: "0 0 12px 12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        borderTop: "none",
        overflow: "hidden",
        position: "relative",
        zIndex: 2,
        padding: "1rem",
        boxSizing: "border-box",
        margin: "0 0 2rem 0",
        lineHeight: "1.5",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },

    greyParagraph: {
        marginTop: "1.5rem",
        fontSize: "1rem",
        color: "#737983ff",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },

    greyParagraphSubText: {
        marginTop: "1.5rem",
        fontSize: "0.875rem",
        color: "#9ca3af",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },

    innerContentCard: {
        maxWidth: "500px",
        background: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(8px)",
        borderRadius: "0 0 12px 12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        borderTop: "none",
        overflow: "hidden",
        position: "relative",
        zIndex: 2,
        padding: "1rem",
        boxSizing: "border-box",
        margin: "0 0 2rem 0",
        lineHeight: "1.5",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },

    mainResponsiveMargin: {
        width: "100%",
        maxWidth: "calc(100% - 20px)",
        margin: "0 auto",
        padding: "2rem 1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxSizing: "border-box",
        "@media (max-width: 600px)": {
            padding: "1rem 0.5rem",
            maxWidth: "100vw"
        }
    },
    loginContainer: {
        maxWidth: "400px",
        margin: "4rem auto",
        padding: "2rem",
        background: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(8px)",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid rgba(255, 255, 255, 0.3)"
    },
    loginTitle: {
        textAlign: "center",
        marginBottom: "2rem",
        color: "#1a1a1a",
        fontWeight: "600",
        fontSize: "24px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    loginSubtitle: {
        textAlign: "center",
        color: "#6b7280",
        fontSize: "15px",
        marginBottom: "2rem",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    loginLabel: {
        fontWeight: "500",
        fontSize: "14px",
        color: "#374151",
        display: "block",
        marginBottom: "0.5rem",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    loginInput: {
        width: "100%",
        padding: "12px 16px",
        borderRadius: "8px",
        border: "1px solid #e0e4e7",
        fontSize: "15px",
        marginBottom: "1.5rem",
        boxSizing: "border-box",
        transition: "all 0.2s ease",
        background: "white",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        "&:focus": {
            borderColor: "#3b82f6",
            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)"
        }
    },
    loginButton: {
        width: "100%",
        padding: "12px 24px",
        borderRadius: "8px",
        background: "#3b82f6",
        color: "white",
        fontWeight: "500",
        fontSize: "15px",
        border: "none",
        cursor: "pointer",
        transition: "all 0.2s ease",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        "&:hover": {
            background: "#2563eb"
        },
        "&:active": {
            transform: "translateY(1px)"
        }
    },
    form: {
        display: "flex",
        flexDirection: "column",
        padding: "2rem",
        width: "100%",
        maxWidth: "420px",
        minWidth: "220px",
        margin: "0 auto",
        gap: "1.5rem",
        boxSizing: "border-box",
        "@media (max-width: 600px)": {
            padding: "1rem",
            maxWidth: "98vw",
            minWidth: "0",
            width: "100%",
        },
        "& label": {
            color: "#374151 !important",
            fontWeight: "500",
            fontSize: "14px",
            marginBottom: "0.5rem",
            display: "block",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease-out",
        gap: "0.25rem",
    },
    
    formContentArea: {
        minHeight: "160px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        gap: "1rem",
        transition: "all 0.3s ease",
    },
    
    input: {
        padding: "12px 16px",
        borderRadius: "8px",
        border: "1px solid #e0e4e7",
        fontSize: "15px",
        width: "100%",
        minWidth: "0",
        maxWidth: "100%",
        boxSizing: "border-box",
        transition: "all 0.2s ease",
        background: "white",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        "@media (max-width: 600px)": {
            fontSize: "15px",
            padding: "12px 12px",
        },
        "&:focus": {
            outline: "none",
            borderColor: "#3b82f6",
            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
        },
        "&.disabled": {
            backgroundColor: "#f8f9fa",
            cursor: "not-allowed",
            color: "#6c757d",
            borderColor: "#dee2e6",
        },
    },
    select: {
        padding: "12px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        backgroundColor: "white",
        color: "black",
        fontSize: "16px",
        width: "100%",
        boxSizing: "border-box",
        appearance: "none",
        backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 4 5\"><path fill=\"%23666\" d=\"M2 0L0 2h4zm0 5L0 3h4z\"/></svg>')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        backgroundSize: "12px",
        "&:focus": {
            outline: "none",
            borderColor: "#28a745",
            boxShadow: "0 0 0 2px rgba(40, 167, 69, 0.2)",
        },
    },
    button: {
        padding: "12px 24px",
        border: "none",
        borderRadius: "8px",
        background: "#3b82f6",
        color: "white",
        cursor: "pointer",
        fontSize: "15px",
        fontWeight: "500",
        width: "100%",
        boxSizing: "border-box",
        marginTop: "1rem",
        transition: "all 0.2s ease",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        "&:hover": {
            background: "#2563eb",
        },
        "&:active": {
            transform: "translateY(1px)",
        },
        "&.disabled": {
            background: "#d1d5db",
            cursor: "not-allowed",
            "&:hover": {
                background: "#d1d5db",
            },
        },
    },
    checkboxGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
    },
    checkboxWrapper: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
    },
    checkbox: {
        width: "18px",
        height: "18px",
        accentColor: "#28a745",
    },
    textarea: {
        padding: "12px 16px",
        borderRadius: "8px",
        border: "1px solid #e0e4e7",
        minHeight: "120px",
        width: "100%",
        minWidth: "0",
        maxWidth: "100%",
        boxSizing: "border-box",
        fontSize: "14px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'SF Mono', Consolas, monospace",
        resize: "vertical",
        transition: "all 0.2s ease",
        background: "white",
        "@media (max-width: 600px)": {
            fontSize: "14px",
            padding: "10px 10px",
            minHeight: "80px",
        },
        "&:focus": {
            outline: "none",
            borderColor: "#3b82f6",
            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
        },
        "&::placeholder": {
            color: "#bfc6d1",
            opacity: 0.55,
        },
        "&::-webkit-input-placeholder": {
            color: "#bfc6d1",
            opacity: 0.55,
        },
        "&::-moz-placeholder": {
            color: "#bfc6d1",
            opacity: 0.55,
        },
        "&:-ms-input-placeholder": {
            color: "#bfc6d1",
            opacity: 0.55,
        },
        "&::-ms-input-placeholder": {
            color: "#bfc6d1",
            opacity: 0.55,
        },
    },
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        opacity: 1,
        transition: "opacity 1s ease",
    },
    hidden: {
        opacity: 0,
    },
    toggleButton: {
        backgroundColor: "#3b82f6",
        color: "white",
        border: "none",
        borderRadius: "8px",
        width: "36px",
        height: "36px",
        minWidth: "36px",
        minHeight: "36px",
        fontSize: "16px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        flexShrink: 0,
        aspectRatio: "1",
        lineHeight: "1",
        "&:hover": {
            backgroundColor: "#2563eb",
        },
        "&:active": {
            transform: "scale(0.95)",
        },
    },
    toggleContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        marginTop: "1rem",
        marginBottom: "1rem",
    },
    modeSelector: {
        display: "flex",
        background: "#f3f4f6",
        borderRadius: "8px",
        padding: "4px",
        border: "1px solid #e5e7eb",
    },
    modeOption: {
        flex: 1,
        padding: "8px 16px",
        borderRadius: "6px",
        border: "none",
        background: "transparent",
        color: "#6b7280",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "500",
        transition: "all 0.2s ease",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        "&:hover": {
            color: "#374151",
        },
    },
    activeMode: {
        background: "white",
        color: "#1f2937",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        fontWeight: "600",
        "&:hover": {
            color: "#1f2937",
        },
    },
    formContainer: {
        overflow: "hidden",
        transition: "max-height 0.3s ease-out, opacity 0.3s ease-out",
        width: "100%",
        maxWidth: "420px",
        minWidth: "220px",
        margin: "0 auto",
        boxSizing: "border-box",
        "@media (max-width: 600px)": {
            width: "100%",
            maxWidth: "98vw",
            minWidth: "0",
        },
        "&.collapsed": {
            maxHeight: "0",
            opacity: "0",
        },
        "&.expanded": {
            maxHeight: "1000px",
            opacity: "1",
        },
    },
    leaderboardContainer: {
        padding: '0',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-8)',
    },
  
  header: {
    textAlign: 'center',
    marginBottom: 'var(--space-8)',
    position: 'relative',
  },
  
  headerTitle: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: '800',
    color: 'var(--text-primary, #1f2937)',
    margin: '0 0 var(--space-3) 0',
    letterSpacing: '-0.02em',
  },
  
  headerSubtitle: {
    fontSize: '1.2rem',
    color: 'var(--text-secondary, #6b7280)',
    fontWeight: '400',
    margin: 0,
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 'var(--space-6)',
    marginBottom: 'var(--space-8)',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: 'var(--space-4)',
    },
  },
  
  spinningLogo: {
    width: '120px',
    height: 'auto',
    marginBottom: '1rem',
    display: 'inline-block',
    animation: '$logoSpin 2s infinite linear',
    transformOrigin: 'center',
  },
  
  '@keyframes logoSpin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
  
  statCard: {
    background: 'var(--card-bg, #ffffff)',
    borderRadius: 'var(--radius-2xl, 1rem)',
    padding: 'var(--space-8, 2rem)',
    boxShadow: 'var(--shadow-medium, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06))',
    border: '1px solid var(--border-light, #e5e7eb)',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 'var(--shadow-large, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05))',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'var(--dynamic-gradient, var(--wordle-green, #6aaa64))',
    }
  },
  
  statCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    marginBottom: 'var(--space-4)',
  },
  
  statIcon: {
    fontSize: '1.5rem',
    padding: 'var(--space-3, 0.75rem)',
    borderRadius: 'var(--radius-lg, 0.5rem)',
    background: 'rgba(106, 170, 100, 0.1)',
    color: 'var(--wordle-green, #6aaa64)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '48px',
    minHeight: '48px',
  },
  
  statTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--text-primary, #1f2937)',
    margin: 0,
  },
  
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--wordle-green, #6aaa64)',
    margin: '0 0 var(--space-2) 0',
    lineHeight: 1,
  },
  
  statSubtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary, #6b7280)',
    margin: 0,
  },
  
  leaderboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 'var(--space-6)',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: 'var(--space-4)',
    },
  },
  
  leaderboardCard: {
    background: 'var(--card-bg, #ffffff)',
    borderRadius: 'var(--radius-2xl, 1rem)',
    boxShadow: 'var(--shadow-medium, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06))',
    border: '1px solid var(--border-light, #e5e7eb)',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: 'var(--shadow-large, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05))',
    }
  },
  
  cardHeader: {
    padding: 'var(--space-6, 1.5rem) var(--space-6, 1.5rem) var(--space-4, 1rem)',
    borderBottom: '1px solid var(--border-light, #e5e7eb)',
    background: 'linear-gradient(135deg, rgba(106, 170, 100, 0.05) 0%, rgba(201, 180, 88, 0.05) 100%)',
  },
  
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--text-primary, #1f2937)',
    margin: '0 0 var(--space-1, 0.25rem) 0',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2, 0.5rem)',
  },
  
  cardSubtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary, #6b7280)',
    margin: 0,
  },

  infoIcon: {
    fontSize: '0.5rem',
    opacity: 0.7,
    cursor: 'help',
    marginLeft: '-0.25rem',
    marginTop: '-5px',
  },
  
  leaderboardList: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    maxHeight: '400px',
    overflowY: 'auto',
  },
  
  leaderboardItem: {
    padding: 'var(--space-4, 1rem) var(--space-6, 1.5rem)',
    borderBottom: '1px solid var(--border-light, #e5e7eb)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4, 1rem)',
    transition: 'all 0.2s ease',
    background: 'transparent',
    '&:hover': {
      background: 'rgba(106, 170, 100, 0.05)',
    },
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  
  rank: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-secondary, #6b7280)',
    minWidth: '32px',
    textAlign: 'center',
  },
  
  rankFirst: {
    color: '#FFD700',
    fontSize: '1.3rem',
  },
  
  rankSecond: {
    color: '#C0C0C0',
    fontSize: '1.2rem',
  },
  
  rankThird: {
    color: '#CD7F32',
    fontSize: '1.15rem',
  },
  
  playerInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1, 0.25rem)',
  },
  
  playerName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--text-primary, #1f2937)',
    margin: 0,
  },
  
  playerStats: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary, #6b7280)',
    margin: 0,
  },
  
  scoreDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2, 0.5rem)',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--text-primary, #1f2937)',
  },
  
  scoreIcon: {
    fontSize: '1.2rem',
  },
  
  loading: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    gap: 'var(--space-4, 1rem)',
  },
  
  loadingText: {
    fontSize: '1.1rem',
    color: 'var(--text-secondary, #6b7280)',
    fontWeight: '500',
  }
});

export default useStyles;
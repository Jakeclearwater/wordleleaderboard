import { createUseStyles } from "react-jss";

const FONT_SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const FONT_MONO = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'SF Mono', Consolas, monospace";

const GLASS_CARD_BASE = {
  background: "var(--card-bg, rgba(255, 255, 255, 0.98))",
  backdropFilter: "blur(8px)",
  borderRadius: "12px",
  boxShadow: "var(--shadow-medium, 0 4px 20px rgba(0,0,0,0.08))",
  border: "1px solid var(--border-light, rgba(255, 255, 255, 0.3))",
};

const TRAINING_ACCENT_FALLBACK = "linear-gradient(135deg, #6aaa64 0%, #3cba92 100%)";

const PRIMARY_BUTTON_BASE = {
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
  fontFamily: FONT_SANS,
  "&:hover": {
    background: "#2563eb",
  },
  "&:active": {
    transform: "translateY(1px)",
  },
};

const INPUT_BASE = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: "8px",
  border: "1px solid var(--input-border, #e0e4e7)",
  fontSize: "15px",
  boxSizing: "border-box",
  transition: "all 0.2s ease",
  background: "var(--input-bg, white)",
  color: "var(--input-text, #1f2937)",
  fontFamily: FONT_SANS,
  "&:focus": {
    outline: "none",
    borderColor: "#3b82f6",
    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
  },
};

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
        background: "var(--secondary-bg, #f3f4f6)",
        borderRadius: "8px",
        padding: "1rem 1.5rem",
        boxShadow: "var(--shadow-small, 0 2px 8px rgba(0,0,0,0.05))",
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
    fontFamily: FONT_SANS,
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
        ...GLASS_CARD_BASE,
        width: "100%",
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
        zIndex: 50,
        padding: "1rem",
        boxSizing: "border-box",
        margin: "0 0 2rem 0",
        lineHeight: "1.5",
        fontFamily: FONT_SANS,
    },

    greyParagraph: {
        marginTop: "1.5rem",
        fontSize: "1rem",
        color: "var(--text-secondary, #737983ff)",
        fontFamily: FONT_SANS,
    },

    greyParagraphSubText: {
        marginTop: "1.5rem",
        fontSize: "0.875rem",
        color: "var(--text-muted, #9ca3af)",
        fontFamily: FONT_SANS,
    },

    innerContentCard: {
        ...GLASS_CARD_BASE,
        maxWidth: "500px",
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
        zIndex: 2,
        padding: "1rem",
        boxSizing: "border-box",
        margin: "0 0 2rem 0",
        lineHeight: "1.5",
        fontFamily: FONT_SANS,
        '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: props => (props && props.accentGradient) || (props && props.gradient) || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px 12px 0 0',
            opacity: 0.8,
        }
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
            maxWidth: "100vw",
        },
    },

    loginContainer: {
        ...GLASS_CARD_BASE,
        maxWidth: "400px",
        margin: "4rem auto",
        padding: "2rem",
    },
    loginTitle: {
        textAlign: "center",
        marginBottom: "2rem",
        color: "var(--text-primary, #1a1a1a)",
        fontWeight: "600",
        fontSize: "24px",
        fontFamily: FONT_SANS,
    },
    loginSubtitle: {
        textAlign: "center",
        color: "var(--text-secondary, #6b7280)",
        fontSize: "15px",
        marginBottom: "2rem",
        fontFamily: FONT_SANS,
    },
    loginLabel: {
        fontWeight: "500",
        fontSize: "14px",
        color: "var(--text-primary, #374151)",
        display: "block",
        marginBottom: "0.5rem",
        fontFamily: FONT_SANS,
    },
    loginInput: {
        ...INPUT_BASE,
        marginBottom: "1.5rem",
    },
    loginButton: {
        ...PRIMARY_BUTTON_BASE,
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
            color: "var(--text-primary, #374151)",
            fontWeight: "500",
            fontSize: "14px",
            marginBottom: "0.5rem",
            display: "block",
            fontFamily: FONT_SANS,
        },
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center", // Center the input box horizontally
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
    ...INPUT_BASE,
    minWidth: "0",
    maxWidth: "100%",
    // For number inputs (like guesses), use a more reasonable width
    "&[type='number']": {
        width: "150px", // About 25px larger than typical default
    },
        "@media (max-width: 600px)": {
            fontSize: "15px",
            padding: "12px 12px",
        },
        "&.disabled": {
            backgroundColor: "var(--input-bg, #f8f9fa)",
            cursor: "not-allowed",
            color: "var(--text-muted, #6c757d)",
            borderColor: "var(--border-light, #dee2e6)",
        },
    },
  select: {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid var(--input-border, #ccc)",
    backgroundColor: "var(--input-bg, white)",
    color: "var(--input-text, black)",
    fontSize: "16px",
    width: "100%",
    boxSizing: "border-box",
    appearance: "none",
    fontFamily: FONT_SANS,
        // backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0IDUiPjxwYXRoIGZpbGw9IiM2NjYiIGQ9Ik0yIDBMMCAySDQuem0wIDUgTDAgM2g0eiIvPjwvc3ZnPg==')",
        // backgroundRepeat: "no-repeat",
        // backgroundPosition: "right 12px center",
        // backgroundSize: "12px",
        "&:focus": {
            outline: "none",
            borderColor: "#28a745",
            boxShadow: "0 0 0 2px rgba(40, 167, 69, 0.2)",
        },
    },
  button: {
    ...PRIMARY_BUTTON_BASE,
    boxSizing: "border-box",
    marginTop: "1rem",
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
    ...INPUT_BASE,
    minHeight: "145px", // Increased by 25px from 120px
    minWidth: "0",
    maxWidth: "100%",
    fontSize: "14px",
    fontFamily: FONT_MONO,
        resize: "vertical",
        transition: "all 0.2s ease",
        background: "var(--input-bg, white)",
        color: "var(--input-text, #1f2937)",
        textAlign: "left", // Ensure text is left-aligned
        "@media (max-width: 600px)": {
            fontSize: "14px",
            padding: "10px 10px",
            minHeight: "80px",
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
        background: "var(--secondary-bg, #f3f4f6)",
        borderRadius: "8px",
        padding: "4px",
        border: "1px solid var(--border-light, #e5e7eb)",
    },
    modeOption: {
        flex: 1,
        padding: "8px 16px",
        borderRadius: "6px",
        border: "none",
        background: "transparent",
        color: "var(--text-secondary, #6b7280)",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "500",
        transition: "all 0.2s ease",
  fontFamily: FONT_SANS,
        "&:hover": {
            color: "var(--text-primary, #374151)",
        },
    },
    activeMode: {
        background: "var(--card-bg, white)",
        color: "var(--text-primary, #1f2937)",
        boxShadow: "var(--shadow-small, 0 1px 3px rgba(0, 0, 0, 0.1))",
        fontWeight: "600",
        "&:hover": {
            color: "var(--text-primary, #1f2937)",
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
    animation: '$squeezeBounce 1.5s ease-in-out infinite',
    transformOrigin: 'center',
    filter: 'drop-shadow(0 4px 12px rgba(15, 23, 42, 0.35))',
  },
  
  '@keyframes squeezeBounce': {
    '0%, 100%': { 
      transform: 'scale(1, 1)' 
    },
    '25%': { 
      transform: 'scale(1.3, 0.7)' 
    },
    '50%': { 
      transform: 'scale(0.7, 1.3)' 
    },
    '75%': { 
      transform: 'scale(1.15, 0.85)' 
    },
  },

  '@keyframes spin': {
    '0%': {
      transform: 'rotate(0deg)'
    },
    '100%': {
      transform: 'rotate(360deg)'
    },
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
  
  // Annual Winners Table Styles
  winnersTable: {
    marginTop: '1rem',
    background: 'var(--card-bg, #ffffff)',
    borderRadius: '12px',
    border: '1px solid var(--border-light, rgba(148, 163, 184, 0.2))',
    overflow: 'hidden',
  },
  
  winnersTableHeader: {
    display: 'grid',
    gridTemplateColumns: '80px 1fr 100px 100px',
    gap: '1rem',
    padding: '1rem',
    background: 'var(--secondary-bg, #f9fafb)',
    borderBottom: '1px solid var(--border-light, rgba(148, 163, 184, 0.2))',
    fontWeight: 600,
    fontSize: '0.875rem',
    color: 'var(--text-secondary, #6b7280)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  
  winnersTableRow: {
    display: 'grid',
    gridTemplateColumns: '80px 1fr 100px 100px',
    gap: '1rem',
    padding: '1rem',
    borderBottom: '1px solid var(--border-light, rgba(148, 163, 184, 0.1))',
    transition: 'background 0.2s ease',
    '&:last-child': {
      borderBottom: 'none',
    },
    '&:hover': {
      background: 'var(--secondary-bg, #f9fafb)',
    },
  },
  
  winnersYearCol: {
    fontWeight: 600,
    color: 'var(--text-primary, #1f2937)',
  },
  
  winnersNameCol: {
    color: 'var(--text-primary, #1f2937)',
  },
  
  winnersAvgCol: {
    textAlign: 'right',
    fontWeight: 600,
    color: 'var(--text-primary, #1f2937)',
  },
  
  winnersBAvgCol: {
    textAlign: 'right',
    fontWeight: 600,
    color: 'var(--text-secondary, #6b7280)',
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
  },

  // Bayesian Chart Styles
  bayesianChartContainer: {
    padding: '2rem',
    background: 'var(--card-bg, rgba(255, 255, 255, 0.95))',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    boxShadow: 'var(--shadow-large, 0 8px 32px rgba(0, 0, 0, 0.1))',
    border: '1px solid var(--border-light, rgba(255, 255, 255, 0.2))',
    margin: '0',
    maxWidth: '100%',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    overflow: 'visible',
    position: 'relative',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: 'var(--shadow-large, 0 12px 40px rgba(0, 0, 0, 0.15))',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '6px',
      background: props => (props && props.accentGradient) || (props && props.gradient) || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '16px 16px 0 0',
      opacity: 0.8,
    }
  },
  bayesianTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--text-primary, #333)',
    marginBottom: '2rem',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    '-webkit-background-clip': 'text',
    '-webkit-text-fill-color': 'transparent',
    backgroundClip: 'text',
  },
  bayesianControls: {
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
  bayesianUserSelector: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  bayesianUserCheckbox: {
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
  bayesianSelectedUser: {
    background: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.98)',
    },
  },
  bayesianPlayerMenuButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 6px',
    border: '1px solid var(--border-light, #dee2e6)',
    borderRadius: '4px',
    background: 'var(--card-bg, white)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '400',
    transition: 'all 0.2s ease',
    position: 'relative',
  },
  bayesianPlayerMenuDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '4px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid #e0e4e7',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    maxHeight: '300px',
    overflowY: 'auto',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '8px',
    minWidth: '120px',
    width: 'max-content',
  },
  bayesianPlayerMenuContainer: {
    position: 'relative',
  },
  bayesianLoading: {
    textAlign: 'center',
    padding: '4rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    minHeight: '60vh',
    justifyContent: 'center',
  },
  bayesianLoadingSpinner: {
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
  },
  bayesianLoadingText: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-primary, #333)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    '-webkit-background-clip': 'text',
    '-webkit-text-fill-color': 'transparent',
    backgroundClip: 'text',
  },
  bayesianLoadingSubtext: {
    fontSize: '14px',
    color: 'var(--text-secondary, #666)',
    fontWeight: '400',
  },
  bayesianSpinningLogo: {
    width: '120px',
    height: 'auto',
    marginBottom: '1rem',
    display: 'inline-block',
    animation: '$squeezeBounce 1.5s ease-in-out infinite',
    filter: 'drop-shadow(0 4px 12px rgba(15, 23, 42, 0.35))',
    transformOrigin: 'center',
  },

  // Training Wordle styles
  trainingSurface: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    padding: '2.5rem 1.25rem',
    boxSizing: 'border-box',
    '@media (max-width: 600px)': {
      padding: '1.75rem 0.75rem',
    },
  },
  trainingContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    width: 'min(100%, 540px)',
    minWidth: '360px',
    margin: '0 auto',
    padding: '2rem 1.75rem',
    borderRadius: '28px',
    background: 'var(--card-bg, rgba(255, 255, 255, 0.95))',
    border: '1px solid var(--border-light, rgba(148, 163, 184, 0.3))',
    boxShadow: 'var(--shadow-large, 0 32px 60px rgba(15, 23, 42, 0.15))',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '6px',
      background: props => (props && props.accentGradient) || (props && props.gradient) || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '28px 28px 0 0',
      opacity: 0.8,
    },
    '@media (max-width: 600px)': {
      padding: '1.5rem 1.1rem',
      borderRadius: '22px',
      minWidth: '335px',
    },
    '@media (max-width: 400px)': {
      minWidth: '320px',
    },
  },
  trainingControls: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  trainingFeedback: {
    position: 'absolute',
    top: '1rem',
    left: '50%',
    transform: 'translate(-50%, -16px)',
    opacity: 0,
    pointerEvents: 'none',
    padding: '0.85rem 1.35rem',
    borderRadius: '16px',
    textAlign: 'center',
    fontSize: '0.95rem',
    fontWeight: 500,
    letterSpacing: '0.01em',
    boxShadow: '0 26px 48px rgba(15, 23, 42, 0.55)',
    backdropFilter: 'blur(16px)',
    transition: 'opacity 0.25s ease, transform 0.25s ease',
    maxWidth: 'calc(100% - 2.75rem)',
    zIndex: 6,
    '@media (max-width: 600px)': {
      top: '0.75rem',
      maxWidth: 'calc(100% - 1.75rem)',
      padding: '0.75rem 1.1rem',
      fontSize: '0.9rem',
    },
  },
  trainingFeedbackVisible: {
    opacity: 1,
    transform: 'translate(-50%, 0)',
  },
  trainingFeedbackError: {
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(248, 113, 113, 0.5)',
    color: '#fee2e2',
  },
  trainingFeedbackInfo: {
    background: 'rgba(59, 130, 246, 0.22)',
    border: '1px solid rgba(96, 165, 250, 0.55)',
    color: '#e0f2fe',
  },
  trainingPrimaryButton: {
    padding: '0.65rem 1.5rem',
    borderRadius: '999px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    color: '#fff',
    background: `var(--training-accent, ${TRAINING_ACCENT_FALLBACK})`,
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    '&:hover': {
      transform: 'translateY(-1px)',
      filter: 'brightness(1.05)',
      boxShadow: '0 6px 16px rgba(15, 23, 42, 0.3)',
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.2)',
    },
  },
  trainingSecondaryButton: {
    padding: '0.65rem 1.5rem',
    borderRadius: '999px',
    border: '1px solid var(--border-light, rgba(148, 163, 184, 0.35))',
    cursor: 'pointer',
    fontWeight: 600,
    color: 'var(--text-primary, #e2e8f0)',
    background: 'var(--card-bg, #1f2937)',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    '&:hover': {
      background: 'var(--secondary-bg, #111827)',
      transform: 'translateY(-1px)',
      borderColor: 'var(--border-light, rgba(148, 163, 184, 0.5))',
      boxShadow: '0 6px 16px rgba(15, 23, 42, 0.3)',
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.2)',
    },
  },
  trainingBoard: {
    display: 'grid',
    gap: '0.5rem',
    width: '100%',
    maxWidth: '350px',
    margin: '0 auto',
    padding: '1.1rem',
    borderRadius: '18px',
    boxShadow: 'var(--shadow-small, 0 4px 6px rgba(0, 0, 0, 0.05))',
    background: 'var(--secondary-bg, #f9fafb)',
    border: '1px solid var(--border-light, rgba(148, 163, 184, 0.2))',
  },
  trainingRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(48px, 1fr))',
    gap: '0.5rem',
    '@media (max-width: 400px)': {
      gridTemplateColumns: 'repeat(5, minmax(44px, 1fr))',
      gap: '0.4rem',
    },
  },
  trainingRowWin: {
    animation: '$rowFlash 1s ease-in-out 0.75s',
  },
  trainingTile: {
    width: '100%',
    aspectRatio: '1 / 1',
    borderRadius: '12px',
    fontSize: '1.75rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-primary, #1f2937)',
    textTransform: 'uppercase',
    transition: 'all 0.25s ease',
    boxShadow: 'var(--shadow-small, 0 2px 4px rgba(0, 0, 0, 0.05))',
    position: 'relative',
    background: 'var(--card-bg, #ffffff)',
    border: '2px solid var(--border-light, #e5e7eb)',
    '& span': {
      position: 'relative',
      zIndex: 1,
    },
  },
  trainingTileFlip: {
    animationName: '$tileFlip',
    animationDuration: '0.5s',
    animationFillMode: 'both',
    animationTimingFunction: 'ease-in-out',
    '& span': {
      animationName: '$tileTextReveal',
      animationDuration: '0.5s',
      animationFillMode: 'both',
      animationTimingFunction: 'ease-in-out',
      opacity: 0,
    },
  },
  trainingRowWin: {
    animation: '$rowFlash 1s ease-in-out 1.3s',
  },
  trainingTileEmpty: {
    background: 'var(--card-bg, #ffffff)',
    border: '2px dashed var(--border-light, rgba(148, 163, 184, 0.35))',
    color: 'var(--text-muted, rgba(107, 114, 128, 0.45))',
  },
  trainingTilePending: {
    background: 'var(--card-bg, #ffffff)',
    border: '2px solid var(--border-light, rgba(59, 130, 246, 0.35))',
    color: 'var(--text-primary, #1f2937)',
  },
  trainingTileHidden: {
    background: 'var(--card-bg, #ffffff)',
    border: '2px solid var(--border-light, rgba(51, 65, 85, 0.45))',
    color: 'transparent',
  },
  trainingTileCorrect: {
    background: '#6aaa64',
    border: '2px solid #6aaa64',
    color: '#fff !important',
  },
  trainingTilePresent: {
    background: '#c9b458',
    border: '2px solid #c9b458',
    color: '#fff !important',
  },
  trainingTileAbsent: {
    background: '#787c7e',
    border: '2px solid #787c7e',
    color: '#fff !important',
  },
  trainingTilePulse: {
    animation: '$tilePulse 1.5s ease-in-out infinite',
  },
  trainingKeyboard: {
    width: '100%',
    maxWidth: 'min(500px, calc(100vw - 4rem))',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.45rem',
    marginTop: '0.5rem',
    paddingTop: '0.35rem',
    overflow: 'visible',
    '@media (max-width: 600px)': {
      maxWidth: 'calc(100vw - 3rem)',
      gap: '0.4rem',
    },
    '@media (max-width: 480px)': {
      maxWidth: 'calc(100vw - 2.5rem)',
      gap: '0.35rem',
      paddingTop: '0.25rem',
    },
    '@media (max-width: 400px)': {
      maxWidth: 'calc(100vw - 2rem)',
      gap: '0.26rem',
      paddingTop: '0.2rem',
    },
  },
  trainingKeyboardRow: {
    display: 'flex',
    gap: '0.45rem',
    justifyContent: 'center',
    '@media (max-width: 600px)': {
      gap: '0.4rem',
    },
    '@media (max-width: 480px)': {
      gap: '0.35rem',
    },
    '@media (max-width: 400px)': {
      gap: '0.25rem',
    },
  },
  trainingKeyboardKey: {
    minWidth: '38px',
    padding: '0.75rem 0.5rem',
    borderRadius: '8px',
    border: '1px solid var(--border-light, #e5e7eb)',
    background: 'var(--card-bg, #ffffff)',
    color: 'var(--text-primary, #1f2937)',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    boxShadow: 'var(--shadow-small, 0 2px 4px rgba(0, 0, 0, 0.05))',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    '&:hover': {
      transform: 'translateY(-1px)',
      background: 'var(--secondary-bg, #f9fafb)',
      boxShadow: 'var(--shadow-medium, 0 4px 6px rgba(0, 0, 0, 0.1))',
    },
    '@media (max-width: 600px)': {
      minWidth: '34px',
      padding: '0.7rem 0.45rem',
      fontSize: '0.85rem',
    },
    '@media (max-width: 480px)': {
      minWidth: '30px',
      padding: '0.65rem 0.4rem',
      fontSize: '0.8rem',
    },
    '@media (max-width: 400px)': {
      minWidth: '26px',
      padding: '0.55rem 0.32rem',
      fontSize: '0.74rem',
      letterSpacing: '0.32px',
    },
  },
  trainingKeyAction: {
    minWidth: '58px',
    fontSize: '0.85rem',
    '@media (max-width: 600px)': {
      minWidth: '52px',
      fontSize: '0.82rem',
    },
    '@media (max-width: 480px)': {
      minWidth: '48px',
      padding: '0.65rem 0.4rem',
      fontSize: '0.78rem',
    },
    '@media (max-width: 400px)': {
      minWidth: '40px',
      padding: '0.55rem 0.32rem',
      fontSize: '0.7rem',
    },
  },
  trainingKeyCorrect: {
    background: '#6aaa64 !important',
    color: '#fff !important',
    border: '1px solid #6aaa64 !important',
  },
  trainingKeyPresent: {
    background: '#c9b458 !important',
    color: '#fff !important',
    border: '1px solid #c9b458 !important',
  },
  trainingKeyAbsent: {
    background: '#787c7e !important',
    color: '#fff !important',
    border: '1px solid #787c7e !important',
    boxShadow: 'none !important',
    filter: 'saturate(0.35) brightness(0.92)',
    '&:hover': {
      transform: 'none !important',
      background: 'linear-gradient(140deg, rgba(148, 163, 184, 0.36) 0%, rgba(71, 85, 105, 0.28) 100%) !important',
    },
  },
  trainingResultCard: {
    marginTop: '1rem',
    padding: '1.75rem',
    background: 'var(--secondary-bg, #111827)',
    borderRadius: '20px',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
    textAlign: 'center',
    border: '1px solid var(--border-light, rgba(148, 163, 184, 0.3))',
    color: 'var(--text-primary, #e2e8f0)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    alignItems: 'center',
  },
  trainingResultTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text-primary, #f8fafc)',
  },
  trainingResultWord: {
    fontSize: '2.2rem',
    fontWeight: 800,
    letterSpacing: '0.2em',
    color: 'var(--text-primary, #e2e8f0)',
  },
  trainingStatsCard: {
    marginTop: '1rem',
    padding: '1.25rem',
    background: 'var(--card-bg, #1f2937)',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
    border: '1px solid var(--border-light, rgba(148, 163, 184, 0.3))',
  },
  trainingStatsCardLarge: {
    padding: '2rem',
    background: 'var(--card-bg, #1f2937)',
    borderRadius: '18px',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
    border: '1px solid var(--border-light, rgba(148, 163, 184, 0.3))',
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  trainingFlipContainer: {
    perspective: '1000px',
    width: '100%',
    position: 'relative',
  },
  trainingFlipCard: {
    position: 'relative',
    width: '100%',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.6s',
  },
  trainingFlipCardFlipped: {
    transform: 'rotateY(180deg)',
  },
  trainingFlipFront: {
    backfaceVisibility: 'hidden',
    width: '100%',
    WebkitBackfaceVisibility: 'hidden',
  },
  trainingFlipBack: {
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    minHeight: '100%',
    transform: 'rotateY(180deg)',
    background: 'var(--card-bg, #1f2937)',
  },
  trainingFlipped: {},
  trainingStatsTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-muted, #94a3b8)',
    textAlign: 'center',
    marginBottom: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  trainingStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  trainingStat: {
    textAlign: 'center',
  },
  trainingStatValue: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--text-primary, #f8fafc)',
    lineHeight: 1,
  },
  trainingStatLabel: {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'var(--text-muted, #94a3b8)',
    marginTop: '0.25rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  trainingOverlay: {
    position: 'fixed',
    inset: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0, 0, 0, 0.45)',
    display: 'grid',
    placeItems: 'center',
    zIndex: 9999,
    padding: '1.25rem',
    boxSizing: 'border-box',
  },
  trainingModal: {
    background: 'rgba(15, 23, 42, 0.96)',
    padding: '2rem',
    borderRadius: '20px',
    color: '#f8fafc',
  maxWidth: '420px',
  width: 'min(100%, 420px)',
    boxShadow: '0 24px 50px rgba(15, 23, 42, 0.55)',
    border: '1px solid rgba(148, 163, 184, 0.35)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'stretch',
    '& ul': {
      margin: '0 0 0.5rem 1.25rem',
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      fontSize: '0.95rem',
      color: '#e2e8f0',
    },
    '@media (max-width: 600px)': {
      margin: '0 auto',
    },
  },

  '@keyframes tileFlip': {
    '0%': {
      transform: 'rotateX(0deg)',
    },
    '50%': {
      transform: 'rotateX(90deg)',
    },
    '100%': {
      transform: 'rotateX(0deg)',
    },
  },

  '@keyframes tileTextReveal': {
    '0%': {
      opacity: 0,
    },
    '50%': {
      opacity: 0,
    },
    '51%': {
      opacity: 1,
    },
    '100%': {
      opacity: 1,
    },
  },

  '@keyframes rowFlash': {
    '0%, 100%': {
      transform: 'scale(1)',
      opacity: 1,
    },
    '50%': {
      transform: 'scale(1.05)',
      opacity: 0.8,
    },
  },

  '@keyframes tilePulse': {
    '0%, 100%': {
      borderColor: 'var(--border-light, rgba(148, 163, 184, 0.35))',
      boxShadow: 'var(--shadow-small, 0 2px 4px rgba(0, 0, 0, 0.05))',
      transform: 'scale(1)',
    },
    '50%': {
      borderColor: 'var(--border-light, rgba(148, 163, 184, 0.35))',
      boxShadow: '0 0 0 3px var(--training-accent-color, rgba(59, 130, 246, 0.3))',
      transform: 'scale(1.02)',
    },
  },

  // Keyframe animations
});

export default useStyles;

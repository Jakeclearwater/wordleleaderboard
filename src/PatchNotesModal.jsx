import { createUseStyles } from 'react-jss';
import { createPortal } from 'react-dom';
import versionInfo from './version.json';

const useStyles = createUseStyles({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '1rem',
  },
  modal: {
    backgroundColor: 'var(--card-bg, rgba(255, 255, 255, 0.95))',
    backdropFilter: 'blur(15px)',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '85vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    '@media (max-width: 768px)': {
      maxWidth: '95vw',
      maxHeight: '90vh',
    },
  },
  header: {
    padding: '2rem',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    '@media (max-width: 768px)': {
      padding: '1.5rem',
    },
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    margin: 0,
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'var(--text-primary, #1f2937)',
    marginBottom: '0.5rem',
    '@media (max-width: 768px)': {
      fontSize: '1.5rem',
    },
  },
  subtitle: {
    fontSize: '1rem',
    color: 'var(--text-secondary, #6b7280)',
    margin: 0,
    '@media (max-width: 768px)': {
      fontSize: '0.875rem',
    },
  },
  releaseInfo: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1.5rem',
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: '8px',
    '@media (max-width: 768px)': {
      gap: '1rem',
      padding: '0.75rem',
    },
  },
  releaseInfoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  releaseLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-secondary, #6b7280)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  releaseValue: {
    fontSize: '0.875rem',
    color: 'var(--text-primary, #1f2937)',
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: 'var(--text-secondary, #6b7280)',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      color: 'var(--text-primary, #1f2937)',
    },
  },
  content: {
    padding: '2rem',
    overflowY: 'auto',
    flex: 1,
    lineHeight: '1.7',
    '@media (max-width: 768px)': {
      padding: '1.5rem',
    },
  },
  versionBlock: {
    marginBottom: '2.5rem',
    '&:last-child': {
      marginBottom: 0,
    },
  },
  versionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.75rem',
    flexWrap: 'wrap',
  },
  versionNumber: {
    fontSize: '1.375rem',
    fontWeight: 'bold',
    color: 'var(--text-primary, #1f2937)',
    '@media (max-width: 768px)': {
      fontSize: '1.25rem',
    },
  },
  versionDate: {
    fontSize: '0.9375rem',
    color: 'var(--text-secondary, #6b7280)',
    '@media (max-width: 768px)': {
      fontSize: '0.875rem',
    },
  },
  versionTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: 'var(--text-primary, #1f2937)',
    marginBottom: '0.75rem',
    '@media (max-width: 768px)': {
      fontSize: '1rem',
    },
  },
  changesList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  changeItem: {
    padding: '0.625rem 0',
    paddingLeft: '1.75rem',
    position: 'relative',
    color: 'var(--text-secondary, #4b5563)',
    lineHeight: '1.7',
    fontSize: '1rem',
    '@media (max-width: 768px)': {
      fontSize: '0.9375rem',
      paddingLeft: '1.5rem',
    },
    '&:before': {
      content: '"•"',
      position: 'absolute',
      left: '0.5rem',
      color: ({ gradient }) => gradient ? 'transparent' : '#667eea',
      background: ({ gradient }) => gradient || 'none',
      WebkitBackgroundClip: ({ gradient }) => gradient ? 'text' : 'none',
      backgroundClip: ({ gradient }) => gradient ? 'text' : 'none',
      fontWeight: 'bold',
      fontSize: '1.25rem',
    },
  },
  footer: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  dismissButton: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    background: ({ gradient }) => gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
    },
  },
});

const PatchNotesModal = ({ onClose, getAccentGradient, getCurrentGradient }) => {
  const gradient = getAccentGradient ? getAccentGradient() : getCurrentGradient ? getCurrentGradient() : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  const classes = useStyles({ gradient });

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div className={classes.overlay} onClick={handleOverlayClick}>
      <div className={classes.modal}>
        <div className={classes.header}>
          <div className={classes.headerTop}>
            <div className={classes.headerContent}>
              <h2 className={classes.title}>🎉 What&apos;s New</h2>
              <p className={classes.subtitle}>Latest updates and improvements to Wordle Leaderboard</p>
            </div>
            <button className={classes.closeButton} onClick={onClose} title="Close">
              ✕
            </button>
          </div>
          
          {/* Release Information */}
          <div className={classes.releaseInfo}>
            <div className={classes.releaseInfoItem}>
              <span className={classes.releaseLabel}>Version</span>
              <span className={classes.releaseValue}>v{versionInfo.version}</span>
            </div>
            <div className={classes.releaseInfoItem}>
              <span className={classes.releaseLabel}>Released</span>
              <span className={classes.releaseValue}>{formatDate(versionInfo.buildTimestamp)}</span>
            </div>
            <div className={classes.releaseInfoItem}>
              <span className={classes.releaseLabel}>Branch</span>
              <span className={classes.releaseValue}>{versionInfo.branch}</span>
            </div>
            <div className={classes.releaseInfoItem}>
              <span className={classes.releaseLabel}>Commit</span>
              <span className={classes.releaseValue}>{versionInfo.commit}</span>
            </div>
            <div className={classes.releaseInfoItem}>
              <span className={classes.releaseLabel}>Author</span>
              <span className={classes.releaseValue}>{versionInfo.pr?.prAuthor || versionInfo.author || 'Team'}</span>
            </div>
            <div className={classes.releaseInfoItem}>
              <span className={classes.releaseLabel}>Build</span>
              <span className={classes.releaseValue}>#{versionInfo.commitCount}</span>
            </div>
          </div>
        </div>
        <div className={classes.content}>
          {versionInfo.pr ? (
            // Show PR information when available
            <div className={classes.versionBlock}>
              <div className={classes.versionHeader}>
                <span className={classes.versionNumber}>PR #{versionInfo.pr.prNumber}</span>
                <span className={classes.versionDate}>
                  {new Date(versionInfo.pr.prMergedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className={classes.versionTitle}>{versionInfo.pr.prTitle}</div>
              {versionInfo.pr.prBody ? (
                <div style={{ 
                  color: 'var(--text-secondary, #4b5563)', 
                  lineHeight: '1.7',
                  fontSize: '1rem',
                  whiteSpace: 'pre-wrap',
                  marginTop: '0.75rem'
                }}>
                  {versionInfo.pr.prBody}
                </div>
              ) : (
                <ul className={classes.changesList}>
                  <li className={classes.changeItem}>
                    Making Wordle great again! 🎉
                  </li>
                </ul>
              )}
              <div style={{ marginTop: '1rem' }}>
                <a 
                  href={versionInfo.pr.prUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    color: '#667eea',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  View PR on GitHub →
                </a>
              </div>
            </div>
          ) : (
            // Fallback when no PR available (direct commit)
            <div className={classes.versionBlock}>
              <div className={classes.versionHeader}>
                <span className={classes.versionNumber}>v{versionInfo.version}</span>
                <span className={classes.versionDate}>
                  {new Date(versionInfo.commitDate || versionInfo.buildTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className={classes.versionTitle}>{versionInfo.commitMessage || 'Latest Update'}</div>
              <ul className={classes.changesList}>
                <li className={classes.changeItem}>
                  Making Wordle great again! 🎉
                </li>
              </ul>
            </div>
          )}
        </div>
        <div className={classes.footer}>
          <button className={classes.dismissButton} onClick={onClose}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PatchNotesModal;

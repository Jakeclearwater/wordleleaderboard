import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { createPortal } from 'react-dom';
import versionInfo from './version.json';

// Import custom notifications
const customNotifications = import.meta.glob('../notifications/*.json', { eager: true });

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
    maxWidth: '700px',
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
    padding: '1.5rem 1.75rem',
    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
    '@media (max-width: 768px)': {
      padding: '1.25rem 1.5rem',
    },
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--text-primary, #1f2937)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    '@media (max-width: 768px)': {
      fontSize: '1.25rem',
    },
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary, #6b7280)',
    margin: '0.25rem 0 0 0',
    '@media (max-width: 768px)': {
      fontSize: '0.8125rem',
    },
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
    padding: '1rem',
    overflowY: 'auto',
    flex: 1,
    '@media (max-width: 768px)': {
      padding: '0.75rem',
    },
  },
  versionBlock: {
    padding: '1.25rem',
    border: '2px solid rgba(0, 0, 0, 0.12)',
    borderRadius: '12px',
    backgroundColor: 'var(--card-bg, rgba(255, 255, 255, 0.8))',
    marginBottom: '1rem',
    position: 'relative',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
      borderColor: 'rgba(0, 0, 0, 0.18)',
      transform: 'translateY(-1px)',
    },
    '&:last-child': {
      marginBottom: 0,
    },
    '@media (max-width: 768px)': {
      padding: '1rem',
    },
  },
  dismissedVersionBlock: {
    opacity: 0.6,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderColor: 'rgba(0, 0, 0, 0.06)',
    '&:hover': {
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)',
      borderColor: 'rgba(0, 0, 0, 0.08)',
    },
  },
  expandedBlock: {
    cursor: 'default',
  },
  unreadIndicator: {
    position: 'absolute',
    left: '0.625rem',
    top: '1.25rem',
    width: '6px',
    height: '6px',
    backgroundColor: '#3b82f6',
    borderRadius: '50%',
    '@media (max-width: 768px)': {
      left: '0.5rem',
      top: '1rem',
    },
  },
  collapsedContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    paddingLeft: '1rem',
  },
  collapsedLeft: {
    flex: 1,
    minWidth: 0,
  },
  collapsedSubject: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: 'var(--text-primary, #1f2937)',
    marginBottom: '0.25rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  collapsedMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8125rem',
    color: 'var(--text-secondary, #9ca3af)',
  },
  expandedContent: {
    paddingLeft: '1rem',
  },
  versionBlockHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
    gap: '1rem',
  },
  messageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    marginBottom: '0.5rem',
  },
  messageFrom: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: 'var(--text-primary, #1f2937)',
  },
  messageBadge: {
    padding: '0.125rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    color: '#6366f1',
  },
  messageDate: {
    fontSize: '0.8125rem',
    color: 'var(--text-secondary, #9ca3af)',
  },
  messageSubject: {
    fontSize: '1.0625rem',
    fontWeight: '600',
    color: 'var(--text-primary, #1f2937)',
    marginBottom: '0.625rem',
    lineHeight: '1.4',
  },
  messageBody: {
    fontSize: '0.9375rem',
    color: 'var(--text-secondary, #4b5563)',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    marginBottom: '0.75rem',
  },
  dismissVersionButton: {
    background: 'none',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    padding: '0.375rem 0.875rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: 'var(--text-secondary, #6b7280)',
    transition: 'all 0.2s ease',
    flexShrink: 0,
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
      borderColor: 'rgba(0, 0, 0, 0.15)',
      color: 'var(--text-primary, #374151)',
    },
  },
  dismissedBadge: {
    padding: '0.375rem 0.875rem',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    flexShrink: 0,
  },
  messageLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    color: '#6366f1',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    marginTop: '0.5rem',
    transition: 'color 0.2s ease',
    '&:hover': {
      color: '#4f46e5',
      textDecoration: 'underline',
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
      content: '"\\2022"',
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

const PatchNotesModal = ({ onClose, getAccentGradient, getCurrentGradient, dismissedVersions, onDismissVersion }) => {
  const gradient = getAccentGradient ? getAccentGradient() : getCurrentGradient ? getCurrentGradient() : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  const classes = useStyles({ gradient });
  
  const [expandedNotifications, setExpandedNotifications] = useState(new Set());

  // Load custom notifications from JSON files
  const customNotificationsList = Object.values(customNotifications)
    .map(module => module.default)
    .filter(notification => notification && notification.type === 'custom')
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, newest first

  // Build notifications from recent PRs (last 30 days)
  const prNotifications = [];
  
  // Add current PR if available
  if (versionInfo.pr) {
    prNotifications.push({
      id: `pr-${versionInfo.pr.prNumber}`,
      version: versionInfo.version,
      prNumber: versionInfo.pr.prNumber,
      prTitle: versionInfo.pr.prTitle,
      prBody: versionInfo.pr.prBody,
      prUrl: versionInfo.pr.prUrl,
      prAuthor: versionInfo.pr.prAuthor,
      mergedAt: versionInfo.pr.prMergedAt,
      buildTimestamp: versionInfo.buildTimestamp,
    });
  }
  
  // Add recent PRs from last 30 days
  if (versionInfo.recentPRs && Array.isArray(versionInfo.recentPRs)) {
    versionInfo.recentPRs.forEach(pr => {
      // Avoid duplicates with current PR
      const isDuplicate = versionInfo.pr && pr.prNumber === versionInfo.pr.prNumber;
      if (!isDuplicate) {
        prNotifications.push({
          id: `pr-${pr.prNumber}`,
          prNumber: pr.prNumber,
          prTitle: pr.prTitle,
          prBody: pr.prBody,
          prUrl: pr.prUrl,
          prAuthor: pr.prAuthor,
          mergedAt: pr.prMergedAt,
        });
      }
    });
  }

  // Merge all notifications (PRs + custom notifications), sorted by date
  const notifications = [...prNotifications, ...customNotificationsList].sort((a, b) => {
    const dateA = new Date(a.mergedAt || a.date || 0);
    const dateB = new Date(b.mergedAt || b.date || 0);
    return dateB - dateA; // Newest first
  });

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDismissNotification = (notificationId) => {
    if (onDismissVersion) {
      onDismissVersion(notificationId);
    }
  };

  const isNotificationDismissed = (notificationId) => {
    return dismissedVersions && dismissedVersions.includes(notificationId);
  };

  const toggleNotificationExpanded = (notificationId) => {
    setExpandedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const isNotificationExpanded = (notificationId) => {
    return expandedNotifications.has(notificationId);
  };

  const modalContent = (
    <div className={classes.overlay} onClick={handleOverlayClick}>
      <div className={classes.modal}>
        <div className={classes.header}>
          <div className={classes.headerTop}>
            <div className={classes.headerContent}>
              <h2 className={classes.title}>
                <span>💬</span>
                <span>Messages</span>
              </h2>
              <p className={classes.subtitle}>Updates and announcements</p>
            </div>
            <button className={classes.closeButton} onClick={onClose} title="Close">
              ✕
            </button>
          </div>
        </div>
        <div className={classes.content}>
          {notifications.map((notification) => {
            const isDismissed = isNotificationDismissed(notification.id);
            const isExpanded = isNotificationExpanded(notification.id);
            
            return (
              <div 
                key={notification.id} 
                className={`${classes.versionBlock} ${isDismissed ? classes.dismissedVersionBlock : ''} ${isExpanded ? classes.expandedBlock : ''}`}
                style={{
                  border: '2px solid rgba(156, 163, 175, 0.3)',
                  borderRadius: '4px',
                  padding: '1.25rem',
                  marginBottom: '1rem',
                  backgroundColor: 'var(--card-bg, rgba(255, 255, 255, 0.8))',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                }}
                onClick={(e) => {
                  // Don't toggle if clicking on buttons or links
                  if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
                    toggleNotificationExpanded(notification.id);
                  }
                }}
              >
                {!isDismissed && <div className={classes.unreadIndicator} />}
                
                {!isExpanded ? (
                  // Collapsed view
                  <div className={classes.collapsedContent}>
                    <div className={classes.collapsedLeft}>
                      <div className={classes.collapsedSubject}>
                        {notification.subject || notification.prTitle || notification.commitMessage}
                      </div>
                      <div className={classes.collapsedMeta}>
                        <span className={classes.messageFrom}>
                          {notification.sender || notification.prAuthor || versionInfo.pr?.prAuthor || 'System'}
                        </span>
                        <span>·</span>
                        <span>
                          {notification.date
                            ? new Date(notification.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric'
                              })
                            : notification.mergedAt 
                            ? new Date(notification.mergedAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric'
                              })
                            : new Date(notification.commitDate || notification.buildTimestamp).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric'
                              })
                          }
                        </span>
                        {(notification.badge || notification.prNumber) && (
                          <>
                            <span>·</span>
                            <span className={classes.messageBadge}>
                              {notification.badge || `PR #${notification.prNumber}`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {isDismissed && (
                      <span className={classes.dismissedBadge}>✓ Read</span>
                    )}
                  </div>
                ) : (
                  // Expanded view
                  <div className={classes.expandedContent}>
                    <div className={classes.versionBlockHeader}>
                      <div style={{ flex: 1 }}>
                        <div className={classes.messageHeader}>
                          <span className={classes.messageFrom}>
                            {notification.sender || notification.prAuthor || versionInfo.pr?.prAuthor || 'System'}
                          </span>
                          <span className={classes.messageBadge}>
                            {notification.badge || (notification.prNumber ? `PR #${notification.prNumber}` : `v${notification.version}`)}
                          </span>
                        </div>
                        <div className={classes.messageDate}>
                          {notification.date
                            ? new Date(notification.date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : notification.mergedAt 
                            ? new Date(notification.mergedAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : new Date(notification.commitDate || notification.buildTimestamp).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                          }
                        </div>
                      </div>
                      {isDismissed && (
                        <span className={classes.dismissedBadge}>✓ Read</span>
                      )}
                    </div>
                    
                    <div className={classes.messageSubject}>
                      {notification.subject || notification.prTitle || notification.commitMessage}
                    </div>
                    
                    {(notification.body || notification.prBody) && (
                      <div className={classes.messageBody}>
                        {notification.body || notification.prBody}
                      </div>
                    )}
                    
                    {(notification.link?.url || notification.prUrl) && (
                      <a 
                        href={notification.link?.url || notification.prUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={classes.messageLink}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {notification.link?.text || 'View details on GitHub'} →
                      </a>
                    )}
                    
                    {!isDismissed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismissNotification(notification.id);
                        }}
                        style={{
                          marginTop: '0.75rem',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(0, 0, 0, 0.15)',
                          background: 'var(--card-bg, white)',
                          color: 'var(--text-secondary, #6b7280)',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.borderColor = 'transparent';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'var(--card-bg, white)';
                          e.currentTarget.style.color = 'var(--text-secondary, #6b7280)';
                          e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.15)';
                        }}
                      >
                        <span>✓</span>
                        <span>Mark as Read</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PatchNotesModal;

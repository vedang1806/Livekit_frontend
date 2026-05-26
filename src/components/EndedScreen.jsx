/**
 * EndedScreen.jsx
 * Shown after the session ends.
 * Displays session summary, composite MP4, and participant audio recordings.
 */

import { useEffect, useState } from 'react';
import { ROLE_COLORS, setupVideoSync } from '../services/recordingDisplay';

export default function EndedScreen({ sessionId, onReset, recordingUrl, participantRecordings, fetchRecordingUrl }) {
  const [displayUrl, setDisplayUrl] = useState(recordingUrl);
  const [loading, setLoading] = useState(!recordingUrl);
  const [error, setError] = useState(null);
  const [showComposite, setShowComposite] = useState(true);
  const [syncCleanup, setSyncCleanup] = useState(null);

  // If recordingUrl not immediately available, wait for it (via fetchRecordingUrl fallback)
  useEffect(() => {
    if (!displayUrl && fetchRecordingUrl && sessionId) {
      (async () => {
        try {
          const data = await fetchRecordingUrl(86400);
          if (data?.url) {
            setDisplayUrl(data.url);
          } else {
            setError('Could not fetch recording URL');
          }
        } catch (e) {
          setError(`Error: ${e.message}`);
        } finally {
          setLoading(false);
        }
      })();
    } else if (displayUrl) {
      setLoading(false);
    }
  }, [displayUrl, fetchRecordingUrl, sessionId]);

  // Setup video sync when switching to participant view
  useEffect(() => {
    if (!showComposite && participantRecordings?.length > 0) {
      // Delay to ensure DOM is ready
      const timer = setTimeout(() => {
        const cleanup = setupVideoSync('.recordings-container');
        setSyncCleanup(() => cleanup);
      }, 100);
      return () => {
        clearTimeout(timer);
        if (syncCleanup) syncCleanup();
      };
    }
  }, [showComposite, participantRecordings]);

  return (
    <div style={styles.root}>
      <div style={styles.mainCard}>
        <div style={styles.header}>
          <div style={styles.icon}>✓</div>
          <h2 style={styles.title}>Session Ended</h2>
          <p style={styles.sub}>Recording saved to S3</p>
        </div>

        <div style={styles.sessionInfo}>
          <div style={styles.infoField}>
            <span style={styles.label}>SESSION ID</span>
            <span style={styles.value}>{sessionId}</span>
          </div>
        </div>

        {/* Tab buttons */}
        <div style={styles.tabs}>
          <button
            onClick={() => setShowComposite(true)}
            style={{
              ...styles.tabBtn,
              ...(showComposite ? styles.tabBtnActive : styles.tabBtnInactive),
            }}
          >
            Full Recording
          </button>
          {participantRecordings?.length > 0 && (
            <button
              onClick={() => setShowComposite(false)}
              style={{
                ...styles.tabBtn,
                ...(!showComposite ? styles.tabBtnActive : styles.tabBtnInactive),
              }}
            >
              Participant Tracks ({participantRecordings.length})
            </button>
          )}
        </div>

        {/* Composite MP4 view */}
        {showComposite && (
          <div style={styles.content}>
            {loading ? (
              <div style={styles.loading}>
                <span style={styles.spinner}>⏳</span>
                <p style={styles.loadingText}>Waiting for recording to be ready...</p>
              </div>
            ) : error ? (
              <div style={styles.error}>
                <span style={styles.errorIcon}>⚠️</span>
                <p style={styles.errorText}>{error}</p>
              </div>
            ) : displayUrl ? (
              <div style={styles.videoContainer}>
                <video
                  src={displayUrl}
                  controls
                  style={styles.compositeVideo}
                />
                <p style={styles.hint}>
                  Full composite recording (all participants in grid layout)
                </p>
                <a
                  href={displayUrl}
                  download
                  style={styles.downloadBtn}
                >
                  ⬇️ Download MP4 (24h expiry)
                </a>
              </div>
            ) : (
              <div style={styles.noData}>
                <p>No recording URL available</p>
              </div>
            )}
          </div>
        )}

        {/* Participant recordings view */}
        {!showComposite && participantRecordings?.length > 0 && (
          <div style={styles.content}>
            <div className="recordings-container" style={styles.recordingsGrid}>
              {participantRecordings.map((rec) => (
                <ParticipantRecording key={rec.identity} recording={rec} />
              ))}
            </div>
            <p style={styles.hint}>
              Click any video to expand. Use one as master to sync all playback.
            </p>
          </div>
        )}

        <div style={styles.actions}>
          <button onClick={onReset} style={styles.btn}>
            Start New Session
          </button>
        </div>
      </div>
    </div>
  );
}

function getRoleColor(role) {
  return ROLE_COLORS[role?.toUpperCase()] || '#999';
}

/**
 * Participant recording component with role overlay
 */
function ParticipantRecording({ recording }) {
  const roleColor = getRoleColor(recording.role);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div style={styles.participantCard}>
      <div style={styles.videoWrapper}>
        <video
          data-participant={recording.identity}
          src={recording.url}
          controls
          style={styles.participantVideo}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        {/* Role overlay */}
        <div
          style={{
            ...styles.roleOverlay,
            background: isPlaying
              ? 'linear-gradient(transparent, rgba(0,0,0,0.8))'
              : 'linear-gradient(transparent, rgba(0,0,0,0.6))',
          }}
        >
          <span style={{ ...styles.roleLabel, color: roleColor }}>
            {recording.role || recording.identity}
          </span>
        </div>
      </div>
      <div style={styles.participantMeta}>
        <span style={{ ...styles.roleBadge, backgroundColor: roleColor }}>
          {recording.role}
        </span>
        <span style={styles.identityText}>{recording.identity}</span>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    background: 'var(--bg)',
  },
  mainCard: {
    width: '100%',
    maxWidth: 900,
    background: 'var(--surface)',
    border: '1px solid var(--border-bright)',
    borderRadius: 16,
    padding: '36px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    textAlign: 'center',
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: 'var(--patient-dim)',
    border: '2px solid var(--patient)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    color: 'var(--patient)',
    fontWeight: 700,
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--text)',
    margin: 0,
  },
  sub: {
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    color: 'var(--text-muted)',
    margin: 0,
  },
  sessionInfo: {
    display: 'flex',
    gap: 16,
    padding: '16px',
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 8,
  },
  infoField: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flex: 1,
  },
  label: {
    fontFamily: 'var(--font-display)',
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--text-dim)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  value: {
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    color: 'var(--text)',
    wordBreak: 'break-all',
  },
  tabs: {
    display: 'flex',
    gap: 8,
    borderBottom: '1px solid var(--border)',
    padding: '0 0 0 0',
  },
  tabBtn: {
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    fontWeight: 600,
    padding: '12px 16px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
    borderBottom: '2px solid transparent',
    marginBottom: '-1px',
  },
  tabBtnActive: {
    color: 'var(--doctor)',
    borderBottomColor: 'var(--doctor)',
  },
  tabBtnInactive: {
    color: 'var(--text-muted)',
    borderBottomColor: 'transparent',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    minHeight: 300,
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: '60px 24px',
    color: 'var(--text-muted)',
  },
  spinner: {
    fontSize: 48,
    animation: 'pulse 1s infinite',
  },
  loadingText: {
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    margin: 0,
  },
  error: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    padding: '40px 24px',
    background: 'rgba(244, 67, 54, 0.1)',
    border: '1px solid rgba(244, 67, 54, 0.3)',
    borderRadius: 8,
    color: '#f44336',
  },
  errorIcon: {
    fontSize: 36,
  },
  errorText: {
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    margin: 0,
  },
  noData: {
    textAlign: 'center',
    padding: '60px 24px',
    color: 'var(--text-muted)',
  },
  videoContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    alignItems: 'center',
  },
  compositeVideo: {
    width: '100%',
    maxWidth: '100%',
    maxHeight: 500,
    borderRadius: 8,
    background: '#000',
  },
  hint: {
    fontFamily: 'var(--font-body)',
    fontSize: 12,
    color: 'var(--text-dim)',
    margin: 0,
    textAlign: 'center',
  },
  downloadBtn: {
    display: 'inline-block',
    padding: '10px 20px',
    background: 'var(--doctor)',
    color: '#000',
    fontFamily: 'var(--font-display)',
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 6,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  recordingsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 16,
  },
  participantCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid var(--border)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  videoWrapper: {
    position: 'relative',
    aspectRatio: '16 / 9',
    background: '#000',
    borderRadius: 4,
    overflow: 'hidden',
  },
  participantVideo: {
    width: '100%',
    height: '100%',
    display: 'block',
  },
  roleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '16px 12px',
    display: 'flex',
    alignItems: 'flex-end',
    pointerEvents: 'none',
  },
  roleLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: '1px',
  },
  participantMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    background: 'var(--surface-2)',
  },
  roleBadge: {
    fontFamily: 'var(--font-display)',
    fontSize: 9,
    fontWeight: 700,
    color: '#000',
    padding: '3px 8px',
    borderRadius: 3,
    letterSpacing: '0.08em',
  },
  identityText: {
    fontFamily: 'var(--font-body)',
    fontSize: 11,
    color: 'var(--text-muted)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  actions: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
  },
  btn: {
    padding: '12px 32px',
    background: 'var(--doctor)',
    color: '#000',
    border: 'none',
    borderRadius: 8,
    fontFamily: 'var(--font-display)',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
};

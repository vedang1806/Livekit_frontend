/**
 * EndedScreen.jsx
 * Shown after the session ends.
 * Displays session summary, presigned S3 URL, and participant audio recordings.
 */

import { useEffect, useState } from 'react';

export default function EndedScreen({ sessionId, onReset, recordingUrl, participantRecordings, fetchRecordingUrl }) {
  const [displayUrl, setDisplayUrl] = useState(recordingUrl);
  const [loading, setLoading] = useState(!recordingUrl);
  const [error, setError] = useState(null);

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

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <div style={styles.icon}>✓</div>

        <h2 style={styles.title}>Session Ended</h2>
        <p style={styles.sub}>The recording has been saved to S3.</p>

        <div style={styles.detail}>
          <span style={styles.detailLabel}>SESSION ID</span>
          <span style={styles.detailValue}>{sessionId}</span>
        </div>

        <div style={styles.detail}>
          <span style={styles.detailLabel}>RECORDING</span>
          {loading ? (
            <span style={styles.detailValue}>⏳ Waiting for recording to be ready...</span>
          ) : error ? (
            <span style={{ ...styles.detailValue, color: 'var(--danger)' }}>{error}</span>
          ) : displayUrl ? (
            <a
              href={displayUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.recordingLink}
              download
            >
              Download MP4 (expires in 24h)
            </a>
          ) : (
            <span style={styles.detailValue}>No recording URL available</span>
          )}
        </div>

        {participantRecordings && participantRecordings.length > 0 && (
          <div style={styles.participantSection}>
            <span style={styles.detailLabel}>PARTICIPANT RECORDINGS</span>
            <div style={styles.participantList}>
              {participantRecordings.map((recording, idx) => {
                const roleColor = getRoleColor(recording.role);
                return (
                  <div key={idx} style={{ ...styles.participantItem, borderLeftColor: roleColor }}>
                    <div style={styles.participantHeader}>
                      <span style={{ ...styles.roleBadge, backgroundColor: roleColor }}>
                        {recording.role?.toUpperCase() || 'PARTICIPANT'}
                      </span>
                    </div>
                    <audio 
                      controls 
                      style={styles.audioPlayer}
                      src={recording.url}
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p style={styles.note}>
          The MP4 is available for 24 hours. Layer 2 (STT pipeline) can be triggered
          against the OGG per-participant tracks from S3.
        </p>

        <button onClick={onReset} style={styles.btn}>
          Start New Session
        </button>
      </div>
    </div>
  );
}

function getRoleColor(role) {
  const roleMap = {
    'doctor': 'var(--doctor)',
    'patient': 'var(--patient)',
    'interpreter': 'var(--interpreter)',
  };
  return roleMap[role?.toLowerCase()] || 'var(--border)';
}

const styles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    background: 'var(--surface)',
    border: '1px solid var(--border-bright)',
    borderRadius: 16,
    padding: 36,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 18,
    textAlign: 'center',
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: 'var(--patient-dim)',
    border: '1px solid var(--patient)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    color: 'var(--patient)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--text)',
  },
  sub: {
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    color: 'var(--text-muted)',
    marginTop: -10,
  },
  detail: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '10px 14px',
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    textAlign: 'left',
  },
  detailLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--text-dim)',
    letterSpacing: '0.14em',
  },
  detailValue: {
    fontFamily: 'var(--font-body)',
    fontSize: 12,
    color: 'var(--text-muted)',
    wordBreak: 'break-all',
  },
  recordingLink: {
    display: 'inline-block',
    fontFamily: 'var(--font-body)',
    fontSize: 12,
    color: 'var(--doctor)',
    textDecoration: 'underline',
    wordBreak: 'break-all',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  participantSection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '10px 14px',
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 8,
  },
  participantList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  participantItem: {
    borderLeft: '3px solid',
    paddingLeft: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  participantHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    fontFamily: 'var(--font-display)',
    fontSize: 9,
    fontWeight: 700,
    color: '#000',
    padding: '2px 6px',
    borderRadius: 4,
    letterSpacing: '0.08em',
  },
  audioPlayer: {
    width: '100%',
    height: 24,
    fontSize: 11,
  },
  note: {
    fontFamily: 'var(--font-body)',
    fontSize: 11,
    color: 'var(--text-dim)',
    lineHeight: 1.7,
  },
  btn: {
    width: '100%',
    background: 'var(--doctor)',
    color: '#000',
    border: 'none',
    borderRadius: 8,
    fontFamily: 'var(--font-display)',
    fontSize: 14,
    fontWeight: 700,
    padding: 14,
    cursor: 'pointer',
    letterSpacing: '0.04em',
    marginTop: 4,
  },
};

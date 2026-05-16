/**
 * EndedScreen.jsx
 * Shown after the session ends.
 * Displays session summary, fetches presigned S3 URL, and provides download link.
 */

import { useState, useEffect } from 'react';

export default function EndedScreen({ sessionId, onReset, fetchRecordingUrl }) {
  const [recordingUrl, setRecordingUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (fetchRecordingUrl && sessionId) {
      (async () => {
        const data = await fetchRecordingUrl(86400); // 24 hours expiry
        if (data?.url) {
          setRecordingUrl(data.url);
        } else {
          setError('Could not fetch recording URL');
        }
        setLoading(false);
      })();
    }
  }, [fetchRecordingUrl, sessionId]);

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
            <span style={styles.detailValue}>Fetching presigned URL...</span>
          ) : error ? (
            <span style={{ ...styles.detailValue, color: 'var(--danger)' }}>{error}</span>
          ) : recordingUrl ? (
            <a
              href={recordingUrl}
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

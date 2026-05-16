/**
 * SessionControls.jsx
 * Top bar inside the meeting room:
 *   - Session ID display
 *   - Your role badge
 *   - Start/Stop recording button
 *   - Leave button
 *   - Recording duration timer
 */

import { useState, useEffect, useRef } from 'react';

const ROLE_COLOR = {
  doctor:      'var(--doctor)',
  patient:     'var(--patient)',
  interpreter: 'var(--interpreter)',
};

function RecordingTimer({ active }) {
  const [seconds, setSeconds] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (active) {
      setSeconds(0);
      ref.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(ref.current);
    }
    return () => clearInterval(ref.current);
  }, [active]);

  if (!active) return null;

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div style={styles.timer}>
      <span style={styles.recDot} />
      REC {mm}:{ss}
    </div>
  );
}

export default function SessionControls({
  sessionId,
  role,
  recording,
  onStartRecording,
  onStopRecording,
  onLeave,
}) {
  const roleColor = ROLE_COLOR[role] || 'var(--text-muted)';

  return (
    <div style={styles.bar}>
      {/* Left: session info */}
      <div style={styles.left}>
        <span style={styles.sessionLabel}>SESSION</span>
        <span style={styles.sessionId}>{sessionId}</span>
        <span style={{ ...styles.roleBadge, color: roleColor, borderColor: `${roleColor}44`, background: `${roleColor}12` }}>
          {role?.toUpperCase()}
        </span>
      </div>

      {/* Centre: recording timer */}
      <RecordingTimer active={recording} />

      {/* Right: actions */}
      <div style={styles.right}>
        {!recording ? (
          <button onClick={onStartRecording} style={styles.recBtn}>
            ⏺ Start Recording
          </button>
        ) : (
          <button onClick={onStopRecording} style={styles.stopBtn}>
            ⏹ Stop Recording
          </button>
        )}
        <button onClick={onLeave} style={styles.leaveBtn}>
          Leave
        </button>
      </div>
    </div>
  );
}

const styles = {
  bar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 200,
    height: 52,
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    gap: 12,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  sessionLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--text-dim)',
    letterSpacing: '0.14em',
    flexShrink: 0,
  },
  sessionId: {
    fontFamily: 'var(--font-body)',
    fontSize: 12,
    color: 'var(--text-muted)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  roleBadge: {
    fontFamily: 'var(--font-display)',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.1em',
    padding: '3px 8px',
    border: '1px solid',
    borderRadius: 4,
    flexShrink: 0,
  },
  timer: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    color: 'var(--recording)',
    fontWeight: 500,
    letterSpacing: '0.06em',
  },
  recDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: 'var(--recording)',
    animation: 'pulse 1.2s infinite',
    display: 'inline-block',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  recBtn: {
    background: 'var(--recording)',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontFamily: 'var(--font-display)',
    fontSize: 12,
    fontWeight: 700,
    padding: '6px 14px',
    cursor: 'pointer',
    letterSpacing: '0.04em',
  },
  stopBtn: {
    background: 'var(--surface-2)',
    color: 'var(--recording)',
    border: '1px solid var(--recording)',
    borderRadius: 6,
    fontFamily: 'var(--font-display)',
    fontSize: 12,
    fontWeight: 700,
    padding: '6px 14px',
    cursor: 'pointer',
    letterSpacing: '0.04em',
  },
  leaveBtn: {
    background: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    fontFamily: 'var(--font-display)',
    fontSize: 12,
    fontWeight: 600,
    padding: '6px 14px',
    cursor: 'pointer',
    letterSpacing: '0.04em',
  },
};

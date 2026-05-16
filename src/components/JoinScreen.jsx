/**
 * JoinScreen.jsx
 * Pre-join lobby — role selector + session ID input.
 */

import { useState } from 'react';
import { SESSION_STATE } from '../hooks/useSession';

const ROLES = [
  { id: 'doctor',      label: 'Doctor',      icon: '⚕️',  desc: 'Attending physician' },
  { id: 'patient',     label: 'Patient',     icon: '🏥',  desc: 'Receiving care' },
  { id: 'interpreter', label: 'Interpreter', icon: '🌐',  desc: 'Language bridge' },
];

const ROLE_COLOR = {
  doctor:      'var(--doctor)',
  patient:     'var(--patient)',
  interpreter: 'var(--interpreter)',
};

export default function JoinScreen({ sessionState, error, onJoin, defaultRoom }) {
  const [role,      setRole]      = useState('doctor');
  const [sessionId, setSessionId] = useState(defaultRoom || '');

  const busy = sessionState === SESSION_STATE.CREATING || sessionState === SESSION_STATE.JOINING;

  function handleJoin() {
    if (busy) return;
    onJoin(sessionId.trim() || null, role);
  }

  return (
    <div style={styles.root}>
      {/* Background grid */}
      <div style={styles.grid} aria-hidden />

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.logo}>Interpreter<span style={styles.logoAccent}>IQ</span></span>
          <p style={styles.tagline}>Medical interpretation — secure, recorded, compliant</p>
        </div>

        {/* Session ID */}
        <div style={styles.field}>
          <label style={styles.label}>SESSION ID</label>
          <input
            style={styles.input}
            placeholder="auto-generated if empty"
            value={sessionId}
            onChange={e => setSessionId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
          />
        </div>

        {/* Role selector */}
        <div style={styles.field}>
          <label style={styles.label}>YOUR ROLE</label>
          <div style={styles.roleGrid}>
            {ROLES.map(r => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                style={{
                  ...styles.roleBtn,
                  borderColor: role === r.id ? ROLE_COLOR[r.id] : 'var(--border)',
                  background:  role === r.id ? `${ROLE_COLOR[r.id]}15` : 'var(--surface-2)',
                  color:       role === r.id ? ROLE_COLOR[r.id] : 'var(--text-muted)',
                }}
              >
                <span style={styles.roleIcon}>{r.icon}</span>
                <span style={styles.roleLabel}>{r.label}</span>
                <span style={styles.roleDesc}>{r.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && <p style={styles.error}>{error}</p>}

        {/* Join button */}
        <button
          onClick={handleJoin}
          disabled={busy}
          style={{
            ...styles.joinBtn,
            background:  busy ? 'var(--surface-2)' : ROLE_COLOR[role],
            color:       busy ? 'var(--text-muted)' : '#000',
            cursor:      busy ? 'not-allowed' : 'pointer',
          }}
        >
          {busy
            ? (sessionState === SESSION_STATE.CREATING ? 'Creating room…' : 'Connecting…')
            : `Join as ${role.charAt(0).toUpperCase() + role.slice(1)}`
          }
        </button>

        <p style={styles.hint}>
          Open this page in 3 tabs — join as each role to simulate a full session.
        </p>
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
    position: 'relative',
    overflow: 'hidden',
    padding: 24,
  },
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    opacity: 0.4,
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: 480,
    background: 'var(--surface)',
    border: '1px solid var(--border-bright)',
    borderRadius: 'var(--radius-lg)',
    padding: 36,
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
  },
  header: {
    textAlign: 'center',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontSize: 28,
    fontWeight: 800,
    color: 'var(--text)',
    letterSpacing: '-0.02em',
  },
  logoAccent: {
    color: 'var(--doctor)',
  },
  tagline: {
    fontFamily: 'var(--font-body)',
    fontSize: 12,
    color: 'var(--text-muted)',
    marginTop: 6,
    letterSpacing: '0.06em',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontFamily: 'var(--font-display)',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text-muted)',
    letterSpacing: '0.12em',
  },
  input: {
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text)',
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    padding: '10px 14px',
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  roleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
  },
  roleBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '14px 8px',
    border: '1px solid',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: 'var(--font-body)',
  },
  roleIcon: {
    fontSize: 22,
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: 500,
    fontFamily: 'var(--font-display)',
    letterSpacing: '0.04em',
  },
  roleDesc: {
    fontSize: 10,
    opacity: 0.6,
  },
  error: {
    background: '#ff4d6a15',
    border: '1px solid #ff4d6a44',
    borderRadius: 'var(--radius)',
    color: 'var(--danger)',
    fontSize: 12,
    padding: '10px 14px',
    fontFamily: 'var(--font-body)',
  },
  joinBtn: {
    border: 'none',
    borderRadius: 'var(--radius)',
    fontFamily: 'var(--font-display)',
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: '0.04em',
    padding: '14px',
    transition: 'all 0.15s',
  },
  hint: {
    textAlign: 'center',
    fontSize: 11,
    color: 'var(--text-dim)',
    fontFamily: 'var(--font-body)',
    lineHeight: 1.6,
  },
};

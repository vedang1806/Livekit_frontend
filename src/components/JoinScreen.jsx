/**
 * JoinScreen.jsx — "Who am I?" + Start / Join + shareable meet link.
 */

import { useState } from 'react';
import { SESSION_STATE } from '../hooks/useSession';
import { getRoomFromUrl, setRoomInUrl } from '../utils/meetLink';
import ShareMeetLink from './ShareMeetLink';
import RoleSelector from './RoleSelector';

function makeSessionId() {
  return `meet_${Date.now().toString(36)}`;
}

export default function JoinScreen({ sessionState, error, onJoin }) {
  const roomFromUrl = getRoomFromUrl();
  const isInvite = Boolean(roomFromUrl);

  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('patient');
  const [roomId, setRoomId] = useState(roomFromUrl);

  const busy = sessionState === SESSION_STATE.CREATING || sessionState === SESSION_STATE.JOINING;
  const canSubmit = displayName.trim().length > 0 && !busy;

  function handleSubmit() {
    if (!canSubmit) return;
    const name = displayName.trim();
    const sid = isInvite ? roomFromUrl : (roomId.trim() || makeSessionId());
    if (!isInvite) {
      setRoomId(sid);
      setRoomInUrl(sid);
    }
    onJoin(sid, name, role);
  }

  return (
    <div style={styles.root}>
      <div style={styles.grid} aria-hidden />

      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.logo}>Meet</span>
          <p style={styles.tagline}>
            {isInvite ? 'You were invited to a meeting' : 'Start a meeting and invite others'}
          </p>
        </div>

        <div style={styles.field}>
          <label style={styles.label} htmlFor="display-name">WHO AM I?</label>
          <input
            id="display-name"
            style={styles.input}
            placeholder="Your name"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
        </div>

        <RoleSelector value={role} onChange={setRole} variant="inline" />

        {(roomId || roomFromUrl) && (
          <ShareMeetLink roomId={roomId || roomFromUrl} />
        )}

        {error && <p style={styles.error}>{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            ...styles.primaryBtn,
            background: canSubmit ? 'var(--accent)' : 'var(--surface-2)',
            color: canSubmit ? '#000' : 'var(--text-muted)',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}
        >
          {busy
            ? (sessionState === SESSION_STATE.CREATING ? 'Starting…' : 'Joining…')
            : isInvite
              ? 'Join meeting'
              : 'Start'}
        </button>

        {!isInvite && !roomId && (
          <p style={styles.footerHint}>
            After you start, copy the meet link and send it to others so they can join.
          </p>
        )}
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
  header: { textAlign: 'center' },
  logo: {
    fontFamily: 'var(--font-display)',
    fontSize: 32,
    fontWeight: 800,
    color: 'var(--text)',
    letterSpacing: '-0.02em',
  },
  tagline: {
    fontSize: 13,
    color: 'var(--text-muted)',
    marginTop: 8,
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
    fontSize: 15,
    padding: '12px 14px',
    outline: 'none',
  },
  error: {
    background: '#ff4d6a15',
    border: '1px solid #ff4d6a44',
    borderRadius: 'var(--radius)',
    color: 'var(--danger)',
    fontSize: 12,
    padding: '10px 14px',
  },
  primaryBtn: {
    border: 'none',
    borderRadius: 'var(--radius)',
    fontFamily: 'var(--font-display)',
    fontSize: 16,
    fontWeight: 700,
    padding: '14px',
  },
  footerHint: {
    textAlign: 'center',
    fontSize: 11,
    color: 'var(--text-dim)',
    lineHeight: 1.6,
  },
};

/**
 * RoleOverlay.jsx — participant list with display names.
 */

import { useParticipants } from '@livekit/components-react';

function labelFromIdentity(identity = '') {
  const lastUnderscore = identity.lastIndexOf('_');
  if (lastUnderscore > 0) {
    const base = identity.slice(0, lastUnderscore).replace(/_/g, ' ');
    if (base) return base;
  }
  return identity || 'Guest';
}

function ParticipantRow({ identity, name }) {
  const label = name || labelFromIdentity(identity);

  return (
    <div style={styles.row}>
      <span style={styles.dot} />
      <span style={styles.name}>{label}</span>
      <span style={styles.live}>LIVE</span>
    </div>
  );
}

export default function RoleOverlay() {
  const participants = useParticipants();

  if (participants.length === 0) return null;

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        IN CALL ({participants.length})
      </div>
      {participants.map(p => (
        <ParticipantRow
          key={p.identity}
          identity={p.identity}
          name={p.name}
        />
      ))}
    </div>
  );
}

const styles = {
  panel: {
    position: 'fixed',
    top: 68,
    right: 16,
    zIndex: 100,
    width: 200,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: 12,
  },
  header: {
    fontFamily: 'var(--font-display)',
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--text-dim)',
    letterSpacing: '0.14em',
    paddingBottom: 6,
    borderBottom: '1px solid var(--border)',
    marginBottom: 2,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 4px',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--accent)',
    flexShrink: 0,
  },
  name: {
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    color: 'var(--text)',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  live: {
    fontSize: 9,
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    color: 'var(--patient)',
    letterSpacing: '0.1em',
  },
};

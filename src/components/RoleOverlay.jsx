/**
 * RoleOverlay.jsx — in-call participant list with role badges.
 */

import { useParticipants } from '@livekit/components-react';
import { ROLES, ROLE_COLOR, parseParticipantIdentity } from '../constants/roles';

function ParticipantRow({ identity, name }) {
  const { role, name: parsedName } = parseParticipantIdentity(identity);
  const label = name || parsedName;
  const roleMeta = ROLES.find(r => r.id === role);
  const color = role ? ROLE_COLOR[role] : 'var(--text-muted)';

  return (
    <div style={{
      ...styles.row,
      borderColor: `${color}33`,
    }}>
      <span style={{ ...styles.dot, background: color, boxShadow: role ? `0 0 6px ${color}` : 'none' }} />
      <div style={styles.info}>
        {roleMeta && (
          <div style={{ ...styles.roleLabel, color }}>{roleMeta.label.toUpperCase()}</div>
        )}
        <div style={styles.name}>{label}</div>
      </div>
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
    width: 220,
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
    padding: '8px 6px',
    borderRadius: 6,
    border: '1px solid',
    background: 'var(--surface-2)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  info: { flex: 1, minWidth: 0 },
  roleLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.08em',
  },
  name: {
    fontFamily: 'var(--font-body)',
    fontSize: 12,
    color: 'var(--text-muted)',
    marginTop: 2,
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
    flexShrink: 0,
  },
};

/**
 * SessionControls.jsx — top bar: name, copy invite link, leave.
 */

import ShareMeetLink from './ShareMeetLink';
import { ROLE_COLOR } from '../constants/roles';

export default function SessionControls({
  sessionId,
  displayName,
  role,
  onLeave,
}) {
  const roleColor = ROLE_COLOR[role] || 'var(--text-muted)';
  return (
    <div style={styles.bar}>
      <div style={styles.left}>
        <span style={styles.youLabel}>YOU</span>
        <span style={styles.name}>{displayName || 'Guest'}</span>
        <span style={{
          ...styles.roleBadge,
          color: roleColor,
          borderColor: `${roleColor}44`,
          background: `${roleColor}12`,
        }}>
          {role?.toUpperCase()}
        </span>
      </div>

      <div style={styles.right}>
        <ShareMeetLink roomId={sessionId} compact />
        <button type="button" onClick={onLeave} style={styles.leaveBtn}>
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
    gap: 8,
    minWidth: 0,
  },
  youLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--text-dim)',
    letterSpacing: '0.14em',
    flexShrink: 0,
  },
  name: {
    fontFamily: 'var(--font-display)',
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--accent)',
    flexShrink: 0,
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
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
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
  },
};

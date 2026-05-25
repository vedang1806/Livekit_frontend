/**
 * RoleSelector.jsx — doctor / patient / interpreter picker.
 * variant="inline" for join form, variant="overlay" floats over the meeting.
 */

import { ROLES, ROLE_COLOR } from '../constants/roles';

export default function RoleSelector({
  value,
  onChange,
  variant = 'inline',
  disabled = false,
}) {
  const isOverlay = variant === 'overlay';

  return (
    <div
      style={{
        ...(isOverlay ? styles.overlayWrap : styles.inlineWrap),
        pointerEvents: disabled ? 'none' : 'auto',
        opacity: disabled ? 0.85 : 1,
      }}
      role="group"
      aria-label="Select your role"
    >
      <span style={isOverlay ? styles.overlayLabel : styles.inlineLabel}>YOUR ROLE</span>
      <div style={isOverlay ? styles.overlayGrid : styles.inlineGrid}>
        {ROLES.map(r => {
          const selected = value === r.id;
          const color = ROLE_COLOR[r.id];
          return (
            <button
              key={r.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(r.id)}
              style={{
                ...styles.roleBtn,
                ...(isOverlay ? styles.roleBtnOverlay : {}),
                borderColor: selected ? color : 'var(--border)',
                background: selected ? `${color}18` : 'var(--surface-2)',
                color: selected ? color : 'var(--text-muted)',
                boxShadow: selected && isOverlay ? `0 0 20px ${color}33` : 'none',
              }}
            >
              <span style={styles.icon}>{r.icon}</span>
              <span style={styles.label}>{r.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  inlineWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  inlineLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text-muted)',
    letterSpacing: '0.12em',
  },
  inlineGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
  },
  overlayWrap: {
    position: 'fixed',
    left: '50%',
    bottom: 24,
    transform: 'translateX(-50%)',
    zIndex: 150,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    padding: '14px 18px',
    background: 'rgba(26, 26, 26, 0.92)',
    border: '1px solid var(--border-bright)',
    borderRadius: 'var(--radius-lg)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
    maxWidth: 'calc(100vw - 32px)',
  },
  overlayLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--text-dim)',
    letterSpacing: '0.14em',
  },
  overlayGrid: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  roleBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '12px 14px',
    border: '1px solid',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: 'var(--font-body)',
    minWidth: 88,
  },
  roleBtnOverlay: {
    padding: '14px 18px',
    minWidth: 100,
  },
  icon: { fontSize: 22 },
  label: {
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'var(--font-display)',
    letterSpacing: '0.04em',
  },
};

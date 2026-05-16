/**
 * RoleOverlay.jsx
 * Reads all participants from LiveKit and renders a floating panel
 * showing each participant's role badge + connection status.
 *
 * Also colours the participant tiles by injecting data attributes
 * that CSS targets via attribute selectors.
 */

import { useParticipants } from '@livekit/components-react';

const ROLE_CONFIG = {
  doctor:      { label: 'DOCTOR',      color: 'var(--doctor)',      bg: 'var(--doctor-dim)' },
  patient:     { label: 'PATIENT',     color: 'var(--patient)',     bg: 'var(--patient-dim)' },
  interpreter: { label: 'INTERPRETER', color: 'var(--interpreter)', bg: 'var(--interpreter-dim)' },
};

function getRoleFromIdentity(identity = '') {
  if (identity.startsWith('doctor'))      return 'doctor';
  if (identity.startsWith('patient'))     return 'patient';
  if (identity.startsWith('interpreter')) return 'interpreter';
  return null;
}

function RoleBadge({ identity, name }) {
  const role   = getRoleFromIdentity(identity);
  const config = ROLE_CONFIG[role] || { label: identity, color: 'var(--text-muted)', bg: 'var(--surface-2)' };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 12px',
      borderRadius: 8,
      background: 'var(--surface-2)',
      border: `1px solid ${config.color}33`,
    }}>
      {/* Role dot */}
      <span style={{
        width: 8, height: 8,
        borderRadius: '50%',
        background: config.color,
        flexShrink: 0,
        boxShadow: `0 0 6px ${config.color}`,
      }} />

      {/* Name + role */}
      <div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 12,
          fontWeight: 700,
          color: config.color,
          letterSpacing: '0.08em',
        }}>
          {config.label}
        </div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          color: 'var(--text-muted)',
          marginTop: 1,
        }}>
          {name || identity}
        </div>
      </div>

      {/* Live indicator */}
      <span style={{
        marginLeft: 'auto',
        fontSize: 10,
        fontFamily: 'var(--font-display)',
        color: 'var(--patient)',
        letterSpacing: '0.1em',
        fontWeight: 700,
      }}>
        LIVE
      </span>
    </div>
  );
}

export default function RoleOverlay() {
  const participants = useParticipants();

  if (participants.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 16,
      right: 16,
      zIndex: 100,
      width: 220,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}>
      {/* Header */}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 10,
        fontWeight: 700,
        color: 'var(--text-dim)',
        letterSpacing: '0.14em',
        paddingBottom: 4,
        borderBottom: '1px solid var(--border)',
        marginBottom: 2,
      }}>
        PARTICIPANTS ({participants.length})
      </div>

      {participants.map(p => (
        <RoleBadge
          key={p.identity}
          identity={p.identity}
          name={p.name}
        />
      ))}
    </div>
  );
}

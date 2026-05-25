/**
 * RoleParticipantTile.jsx — video tile with role-colored border and on-video label.
 */

import { ParticipantTile, TrackRefContextIfNeeded, useTrackRefContext } from '@livekit/components-react';
import { ROLES, ROLE_COLOR, parseParticipantIdentity } from '../constants/roles';

function RoleParticipantTileInner(props) {
  const trackReference = useTrackRefContext();
  const { role, name } = parseParticipantIdentity(trackReference.participant?.identity);
  const roleMeta = ROLES.find(r => r.id === role);
  const color = role ? ROLE_COLOR[role] : 'var(--text-muted)';

  return (
    <div
      className={`role-participant-wrap${role ? ` role-participant-wrap--${role}` : ''}`}
      style={{ '--role-color': color }}
    >
      <div className="role-participant-banner">
        <span className="role-participant-banner__role">
          {roleMeta ? `${roleMeta.icon} ${roleMeta.label}` : 'Guest'}
        </span>
        <span className="role-participant-banner__name">{name}</span>
      </div>
      <ParticipantTile
        {...props}
        className={`role-participant-tile ${props.className || ''}`.trim()}
      />
    </div>
  );
}

export default function RoleParticipantTile({ trackRef, ...props }) {
  return (
    <TrackRefContextIfNeeded trackRef={trackRef}>
      <RoleParticipantTileInner {...props} />
    </TrackRefContextIfNeeded>
  );
}

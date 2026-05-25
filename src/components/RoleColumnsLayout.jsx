/**
 * RoleColumnsLayout.jsx — three columns (Doctor / Patient / Interpreter) for camera feeds.
 */

import { useMemo } from 'react';
import { GridLayout, isTrackReference } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { ROLES, ROLE_COLOR, parseParticipantIdentity } from '../constants/roles';
import RoleParticipantTile from './RoleParticipantTile';

function RoleColumn({ roleId, tracks }) {
  const meta = ROLES.find(r => r.id === roleId);
  const color = ROLE_COLOR[roleId];

  return (
    <section
      className={`role-column role-column--${roleId}`}
      style={{ '--role-color': color }}
      aria-label={`${meta?.label} video`}
    >
      <header className="role-column__header">
        <span className="role-column__icon">{meta?.icon}</span>
        <span className="role-column__title">{meta?.label}</span>
        <span className="role-column__count">{tracks.length}</span>
      </header>
      <div className="role-column__body">
        {tracks.length === 0 ? (
          <div className="role-column__empty">No {meta?.label.toLowerCase()} yet</div>
        ) : (
          <GridLayout tracks={tracks} className="role-column__grid">
            <RoleParticipantTile />
          </GridLayout>
        )}
      </div>
    </section>
  );
}

export default function RoleColumnsLayout({ tracks }) {
  const cameraTracks = useMemo(
    () => tracks.filter(
      tr => tr.source === Track.Source.Camera || (isTrackReference(tr) && tr.publication?.source === Track.Source.Camera),
    ),
    [tracks],
  );

  const byRole = useMemo(() => {
    const grouped = { doctor: [], patient: [], interpreter: [] };

    for (const tr of cameraTracks) {
      const id = tr.participant?.identity;
      if (!id) continue;
      const { role } = parseParticipantIdentity(id);
      if (!role || !grouped[role]) continue;

      const idx = grouped[role].findIndex(t => t.participant.identity === id);
      if (idx >= 0) {
        if (isTrackReference(tr) && tr.publication?.isSubscribed) {
          grouped[role][idx] = tr;
        }
        continue;
      }
      grouped[role].push(tr);
    }
    return grouped;
  }, [cameraTracks]);

  return (
    <div className="role-columns-layout">
      {ROLES.map(r => (
        <RoleColumn key={r.id} roleId={r.id} tracks={byRole[r.id]} />
      ))}
    </div>
  );
}

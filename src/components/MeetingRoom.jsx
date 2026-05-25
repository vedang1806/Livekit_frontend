/**
 * MeetingRoom.jsx — LiveKit room with role-based video layout.
 */

import {
  LiveKitRoom,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';

import SessionControls from './SessionControls';
import RoleVideoConference from './RoleVideoConference';

export default function MeetingRoom({
  token,
  wsUrl,
  sessionId,
  displayName,
  role,
  onLeave,
}) {
  return (
    <>
      <SessionControls
        sessionId={sessionId}
        displayName={displayName}
        role={role}
        onLeave={onLeave}
      />

      <LiveKitRoom
        token={token}
        serverUrl={wsUrl}
        connect={true}
        video={true}
        audio={true}
        onDisconnected={onLeave}
        style={{
          height: '100vh',
          paddingTop: 52,
          background: 'var(--bg)',
        }}
      >
        <RoleVideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </>
  );
}

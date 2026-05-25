/**
 * MeetingRoom.jsx — LiveKit room + controls + participant list.
 */

import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';

import SessionControls from './SessionControls';
import RoleOverlay     from './RoleOverlay';

export default function MeetingRoom({
  token,
  wsUrl,
  sessionId,
  displayName,
  onLeave,
}) {
  return (
    <>
      <SessionControls
        sessionId={sessionId}
        displayName={displayName}
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
        <VideoConference />
        <RoomAudioRenderer />
        <RoleOverlay />
      </LiveKitRoom>
    </>
  );
}

/**
 * MeetingRoom.jsx
 * Active meeting view — LiveKit room + role overlays + controls.
 *
 * Layout:
 *   [SessionControls bar — top]
 *   [VideoConference — fills remaining height]
 *   [RoleOverlay — fixed top-right]
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
  role,
  recording,
  onStartRecording,
  onStopRecording,
  onLeave,
}) {
  return (
    <>
      <SessionControls
        sessionId={sessionId}
        role={role}
        recording={recording}
        onStartRecording={onStartRecording}
        onStopRecording={onStopRecording}
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
          paddingTop: 52,   // offset for the controls bar
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

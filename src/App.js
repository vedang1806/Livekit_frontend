/**
 * App.js — root component.
 * Routes between: JoinScreen → MeetingRoom → EndedScreen
 * All session state lives in useSession() hook.
 */

import { useEffect } from 'react';
import { useSession, SESSION_STATE } from './hooks/useSession';
import JoinScreen    from './components/JoinScreen';
import MeetingRoom   from './components/MeetingRoom';
import EndedScreen   from './components/EndedScreen';

const DEFAULT_ROOM = process.env.REACT_APP_DEFAULT_ROOM || '';

export default function App() {
  const {
    state, error,
    sessionId, role, setRole,
    token, wsUrl,
    recording,
    join, leave,
    startRecording, stopRecording,
    startParticipantPoll, stopParticipantPoll,
    fetchRecordingUrl,
  } = useSession();

  // Start polling participants once active
  useEffect(() => {
    if (state === SESSION_STATE.ACTIVE) {
      startParticipantPoll(sessionId);
    } else {
      stopParticipantPoll();
    }
  }, [state, sessionId, startParticipantPoll, stopParticipantPoll]);

  // ── Screens ───────────────────────────────────────────────
  if (state === SESSION_STATE.IDLE || state === SESSION_STATE.CREATING || state === SESSION_STATE.JOINING) {
    return (
      <JoinScreen
        sessionState={state}
        error={error}
        defaultRoom={DEFAULT_ROOM}
        onJoin={(sid, r) => {
          setRole(r);
          join(sid, r);
        }}
      />
    );
  }

  if (state === SESSION_STATE.ACTIVE && token) {
    return (
      <MeetingRoom
        token={token}
        wsUrl={wsUrl}
        sessionId={sessionId}
        role={role}
        recording={recording}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onLeave={leave}
      />
    );
  }

  if (state === SESSION_STATE.ENDED) {
    return (
      <EndedScreen
        sessionId={sessionId}
        onReset={() => window.location.reload()}
        fetchRecordingUrl={fetchRecordingUrl}
      />
    );
  }

  // Fallback — should not normally reach here
  return null;
}

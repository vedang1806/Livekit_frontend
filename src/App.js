/**
 * App.js — root component.
 * Routes between: JoinScreen → MeetingRoom → EndedScreen
 */

import { useEffect } from 'react';
import { useSession, SESSION_STATE } from './hooks/useSession';
import JoinScreen    from './components/JoinScreen';
import MeetingRoom   from './components/MeetingRoom';
import EndedScreen   from './components/EndedScreen';

export default function App() {
  const {
    state, error,
    sessionId, displayName,
    token, wsUrl,
    recordingUrl, participantRecordings,
    join, leave,
    startParticipantPoll, stopParticipantPoll,
    fetchRecordingUrl,
  } = useSession();

  useEffect(() => {
    if (state === SESSION_STATE.ACTIVE) {
      startParticipantPoll(sessionId);
    } else {
      stopParticipantPoll();
    }
  }, [state, sessionId, startParticipantPoll, stopParticipantPoll]);

  if (state === SESSION_STATE.IDLE || state === SESSION_STATE.CREATING || state === SESSION_STATE.JOINING) {
    return (
      <JoinScreen
        sessionState={state}
        error={error}
        onJoin={(sid, name) => join(sid, name)}
      />
    );
  }

  if (state === SESSION_STATE.ACTIVE && token) {
    return (
      <MeetingRoom
        token={token}
        wsUrl={wsUrl}
        sessionId={sessionId}
        displayName={displayName}
        onLeave={leave}
      />
    );
  }

  if (state === SESSION_STATE.ENDED) {
    return (
      <EndedScreen
        sessionId={sessionId}
        onReset={() => window.location.reload()}
        recordingUrl={recordingUrl}
        participantRecordings={participantRecordings}
        fetchRecordingUrl={fetchRecordingUrl}
      />
    );
  }

  return null;
}

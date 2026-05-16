/**
 * useSession.js
 * Manages the full session lifecycle:
 *   idle → creating → joining → active → ended
 *
 * Exposes everything the UI needs: state, token, actions.
 */

import { useState, useCallback, useRef } from 'react';
import { createRoom, getToken, startEgress, stopEgress, getParticipants, getRecordingUrl, getEgressStatus, listenForEgressEnded, getParticipantRecordings } from '../api/backend';

export const SESSION_STATE = {
  IDLE:     'idle',
  CREATING: 'creating',
  JOINING:  'joining',
  ACTIVE:   'active',
  ENDED:    'ended',
};

export function useSession() {
  const [state,       setState]      = useState(SESSION_STATE.IDLE);
  const [error,       setError]      = useState(null);
  const [sessionId,   setSessionId]  = useState('');
  const [token,       setToken]      = useState('');
  const [wsUrl,       setWsUrl]      = useState('');
  const [identity,    setIdentity]   = useState('');
  const [role,        setRole]       = useState('doctor');
  const [egressId,    setEgressId]   = useState('');
  const [recording,   setRecording]  = useState(false);
  const [recordingUrl, setRecordingUrl] = useState(null);
  const [participantRecordings, setParticipantRecordings] = useState([]);
  const [participants, setParticipants] = useState([]);

  const pollRef = useRef(null);
  const egressListenerRef = useRef(null);

  /** Generate a session_id from role + timestamp. */
  function makeSessionId() {
    return `sess_${Date.now().toString(36)}`;
  }

  /** Create room + mint token + connect. */
  const join = useCallback(async (sessionIdInput, roleInput) => {
    setError(null);
    const sid = sessionIdInput || makeSessionId();
    const rid = roleInput || role;
    const iid = `${rid}_${Date.now()}`;

    console.log(`[Session] JOIN initiated: session=${sid}, role=${rid}, identity=${iid}`);

    try {
      setState(SESSION_STATE.CREATING);
      console.log(`[Session] State: CREATING`);
      setSessionId(sid);
      setIdentity(iid);

      // Create the room (idempotent — LiveKit returns existing room if name exists)
      console.log(`[Session] Creating room: ${sid}`);
      await createRoom(sid);
      console.log(`[Session] Room created/exists`);

      setState(SESSION_STATE.JOINING);
      console.log(`[Session] State: JOINING`);

      // Mint participant token
      console.log(`[Session] Minting token for room=${sid}, identity=${iid}, role=${rid}`);
      const data = await getToken(sid, iid, rid);
      setToken(data.token);
      setWsUrl(data.url);
      setRole(rid);

      setState(SESSION_STATE.ACTIVE);
      console.log(`[Session] State: ACTIVE`);
    } catch (e) {
      console.error(`[Session] JOIN failed:`, e.message);
      setError(e.message);
      setState(SESSION_STATE.IDLE);
    }
  }, [role]);

  /** Start composite egress recording. */
  const startRecording = useCallback(async () => {
    if (!sessionId || recording) {
      console.log(`[Session] START RECORDING skipped: sessionId=${sessionId}, recording=${recording}`);
      return;
    }
    console.log(`[Session] START RECORDING initiated for session=${sessionId}`);
    try {
      const data = await startEgress(sessionId, false);
      setEgressId(data.egress_id);
      setRecording(true);
      console.log(`[Session] RECORDING started: egress_id=${data.egress_id}`);
    } catch (e) {
      console.error(`[Session] START RECORDING failed:`, e.message);
      setError(`Egress start failed: ${e.message}`);
    }
  }, [sessionId, recording]);

  /** Stop egress recording and listen for completion event. */
  const stopRecording = useCallback(async () => {
    if (!egressId) {
      console.log(`[Session] STOP RECORDING skipped: no egressId`);
      return;
    }
    console.log(`[Session] STOP RECORDING initiated: egress_id=${egressId}`);
    try {
      await stopEgress(egressId, sessionId);
      setRecording(false);
      setEgressId('');
      console.log(`[Session] RECORDING stopped. Listening for egress completion event...`);

      // Listen for egress_ended event
      if (egressListenerRef.current) {
        egressListenerRef.current(); // Unsubscribe previous listener
      }

      egressListenerRef.current = listenForEgressEnded(sessionId, async (egressData) => {
        console.log(`[Session] Egress completion event received. Fetching presigned URL and participant recordings...`);
        try {
          const urlData = await getRecordingUrl(sessionId, 86400);
          setRecordingUrl(urlData.url);
          console.log(`[Session] Recording URL ready:`, urlData.url);

          // Fetch participant recordings
          try {
            const recData = await getParticipantRecordings(sessionId);
            setParticipantRecordings(recData.recordings || []);
            console.log(`[Session] Participant recordings ready:`, recData.recordings);
            recData.recordings?.forEach(rec => {
              console.log(`  ${rec.role}: ${rec.url}`);
            });
          } catch (e) {
            console.warn(`[Session] Failed to fetch participant recordings (optional):`, e.message);
          }
        } catch (e) {
          console.error(`[Session] Failed to fetch recording URL:`, e.message);
          setError(`Failed to get recording URL: ${e.message}`);
        }
      });
    } catch (e) {
      // 412 = already stopped — not a real error
      console.warn(`[Session] STOP RECORDING error (may be ok):`, e.message);
      setRecording(false);
      setEgressId('');
    }
  }, [egressId, sessionId]);

  /** Poll participant list (call once after joining). */
  const startParticipantPoll = useCallback((sid) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const data = await getParticipants(sid || sessionId);
        setParticipants(data.participants || []);
      } catch (_) {}
    }, 3000);
  }, [sessionId]);

  const stopParticipantPoll = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
  }, []);

  /** Disconnect and clean up. */
  const leave = useCallback(async () => {
    stopParticipantPoll();
    // Clean up egress listener
    if (egressListenerRef.current) {
      egressListenerRef.current();
      egressListenerRef.current = null;
    }
    if (recording) await stopRecording();
    setState(SESSION_STATE.ENDED);
    setToken('');
    setWsUrl('');
    setEgressId('');
    setRecording(false);
  }, [recording, stopRecording, stopParticipantPoll]);

  /** Get recording URL - returns from state if available, or polls as fallback. */
  const fetchRecordingUrl = useCallback(async (expiresIn = 86400, maxWaitMs = 60000) => {
    if (!sessionId) {
      console.log(`[Session] FETCH RECORDING URL skipped: no sessionId`);
      return null;
    }

    // If URL already available (egress_ended event already fired), return it
    if (recordingUrl) {
      console.log(`[Session] Recording URL already available`);
      return { url: recordingUrl, session_id: sessionId, expires_in: expiresIn };
    }

    console.log(`[Session] FETCH RECORDING URL: waiting for egress_ended event (max wait: ${maxWaitMs}ms)`);

    // Wait for URL to be set by egress_ended event (with timeout fallback to polling)
    const startTime = Date.now();
    return new Promise((resolve) => {
      const checkInterval = setInterval(async () => {
        if (recordingUrl) {
          clearInterval(checkInterval);
          console.log(`[Session] Recording URL now available`);
          resolve({ url: recordingUrl, session_id: sessionId, expires_in: expiresIn });
          return;
        }

        // Timeout: try polling status as fallback
        if (Date.now() - startTime > maxWaitMs) {
          clearInterval(checkInterval);
          console.warn(`[Session] Egress event timeout after ${maxWaitMs}ms, falling back to status poll...`);

          try {
            const status = await getEgressStatus(sessionId);
            if (status.status === 'ready') {
              const data = await getRecordingUrl(sessionId, expiresIn);
              setRecordingUrl(data.url);
              resolve(data);
            }
          } catch (e) {
            console.error(`[Session] Fallback polling failed:`, e.message);
            resolve(null);
          }
          return;
        }
      }, 500); // Check every 500ms for state update
    });
  }, [sessionId, recordingUrl]);

  return {
    // State
    state, error, sessionId, identity, role, setRole,
    token, wsUrl, recording, recordingUrl, participantRecordings, participants, egressId,
    // Actions
    join, leave, startRecording, stopRecording,
    startParticipantPoll, stopParticipantPoll,
    fetchRecordingUrl,
  };
}

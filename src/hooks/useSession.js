/**
 * useSession.js
 * Manages the full session lifecycle:
 *   idle → creating → joining → active → ended
 *
 * Exposes everything the UI needs: state, token, actions.
 */

import { useState, useCallback, useRef } from 'react';
import { createRoom, getToken, startEgress, stopEgress, getParticipants, getRecordingUrl } from '../api/backend';

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
  const [participants, setParticipants] = useState([]);

  const pollRef = useRef(null);

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

  /** Stop egress recording. */
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
      console.log(`[Session] RECORDING stopped`);
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
    if (recording) await stopRecording();
    setState(SESSION_STATE.ENDED);
    setToken('');
    setWsUrl('');
    setEgressId('');
    setRecording(false);
  }, [recording, stopRecording, stopParticipantPoll]);

  /** Fetch presigned S3 URL for recording. */
  const fetchRecordingUrl = useCallback(async (expiresIn = 86400) => {
    if (!sessionId) {
      console.log(`[Session] FETCH RECORDING URL skipped: no sessionId`);
      return null;
    }
    console.log(`[Session] FETCH RECORDING URL: session=${sessionId}, expiresIn=${expiresIn}`);
    try {
      const data = await getRecordingUrl(sessionId, expiresIn);
      console.log(`[Session] RECORDING URL received:`, data.url);
      return data;
    } catch (e) {
      console.error(`[Session] FETCH RECORDING URL failed:`, e.message);
      setError(`Failed to get recording URL: ${e.message}`);
      return null;
    }
  }, [sessionId]);

  return {
    // State
    state, error, sessionId, identity, role, setRole,
    token, wsUrl, recording, participants, egressId,
    // Actions
    join, leave, startRecording, stopRecording,
    startParticipantPoll, stopParticipantPoll,
    fetchRecordingUrl,
  };
}

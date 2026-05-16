/**
 * backend.js — all API calls to the FastAPI backend.
 * All functions throw on non-2xx so callers can catch and display errors.
 */

const BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const url = `${BASE}${path}`;
  const method = options.method || 'GET';
  console.log(`[API] ${method} ${path}`);

  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const text = await res.text();
      console.error(`[API ERROR] ${method} ${path}: ${res.status} ${res.statusText}`);
      throw new Error(`${res.status} ${res.statusText}: ${text}`);
    }
    const data = await res.json();
    console.log(`[API SUCCESS] ${method} ${path}`, data);
    return data;
  } catch (err) {
    console.error(`[API EXCEPTION] ${method} ${path}:`, err.message);
    throw err;
  }
}

/** Create a LiveKit room for a session. */
export async function createRoom(sessionId) {
  return request('/room/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
  });
}

/**
 * Mint a participant token.
 * Returns { token, url, identity, role, room }
 */
export async function getToken(room, identity, role) {
  return request(`/token?room=${encodeURIComponent(room)}&identity=${encodeURIComponent(identity)}&role=${encodeURIComponent(role)}`);
}

/** List participants currently in the room. */
export async function getParticipants(sessionId) {
  return request(`/room/participants?session_id=${encodeURIComponent(sessionId)}`);
}

/** Start composite egress (MP4 video+audio). */
export async function startEgress(sessionId, audioOnly = false) {
  return request('/egress/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, audio_only: audioOnly }),
  });
}

/** Stop a running egress. */
export async function stopEgress(egressId, sessionId) {
  return request('/egress/stop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ egress_id: egressId, session_id: sessionId }),
  });
}

/** Get presigned S3 URL for recording. */
export async function getRecordingUrl(sessionId, expiresIn = 86400) {
  return request(`/egress/recording-url?session_id=${encodeURIComponent(sessionId)}&expires_in=${expiresIn}`);
}

/** List all egress jobs for a session. */
export async function listEgress(sessionId) {
  return request(`/egress/list?session_id=${encodeURIComponent(sessionId)}`);
}

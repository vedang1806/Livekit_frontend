/** Read room id from ?room= or ?session= query param. */
export function getRoomFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return (params.get('room') || params.get('session') || '').trim();
}

/** Build a shareable URL for the current origin + room id. */
export function buildMeetLink(roomId) {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('room', roomId);
  return url.toString();
}

/** Update the browser URL without reload so the host can refresh/share. */
export function setRoomInUrl(roomId) {
  const url = new URL(window.location.href);
  url.searchParams.set('room', roomId);
  window.history.replaceState({}, '', url);
}

export async function copyMeetLink(roomId) {
  const link = buildMeetLink(roomId);
  await navigator.clipboard.writeText(link);
  return link;
}

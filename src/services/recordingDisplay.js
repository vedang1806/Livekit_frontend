/**
 * recordingDisplay.js
 * Utilities for displaying recordings with role overlays and synchronized playback
 */

export const ROLE_COLORS = {
  DOCTOR: '#1976d2',
  PATIENT: '#388e3c',
  INTERPRETER: '#f57c00',
};

/**
 * Synchronize playback across multiple video elements.
 * Master is the first video; others follow its play/pause/seek.
 */
export function setupVideoSync(containerSelector = '.recordings-container') {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.warn(`[recordingDisplay] Container not found: ${containerSelector}`);
    return;
  }

  const videos = container.querySelectorAll('video[data-participant]');
  if (videos.length === 0) {
    console.warn(`[recordingDisplay] No videos found in container`);
    return;
  }

  const master = videos[0];

  const syncPlay = () => {
    videos.forEach(v => v !== master && v.play());
  };

  const syncPause = () => {
    videos.forEach(v => v !== master && v.pause());
  };

  const syncSeek = () => {
    videos.forEach(v => {
      if (v !== master) v.currentTime = master.currentTime;
    });
  };

  master.addEventListener('play', syncPlay);
  master.addEventListener('pause', syncPause);
  master.addEventListener('seeked', syncSeek);

  console.log(`[recordingDisplay] Video sync enabled for ${videos.length} participants`);

  // Return cleanup function
  return () => {
    master.removeEventListener('play', syncPlay);
    master.removeEventListener('pause', syncPause);
    master.removeEventListener('seeked', syncSeek);
  };
}

/**
 * Format a recording object for display in React
 * @param {Object} rec - Recording from API { identity, role, url, ... }
 * @returns {Object} Formatted recording with display info
 */
export function formatRecording(rec) {
  return {
    identity: rec.identity,
    role: rec.role,
    url: rec.url,
    s3Key: rec.s3_key,
    color: ROLE_COLORS[rec.role] || '#fff',
    displayLabel: rec.role || rec.identity,
  };
}

/**
 * Create HTML for a video with role overlay (vanilla JS)
 * @param {Object} rec - Recording { identity, role, url }
 * @returns {HTMLElement} Container div with video + overlay
 */
export function createVideoElement(rec) {
  const formatted = formatRecording(rec);

  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:relative;display:inline-block;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.2)';

  const video = document.createElement('video');
  video.src = rec.url;
  video.controls = true;
  video.dataset.participant = rec.identity;
  video.style.cssText = 'width:100%;max-width:500px;display:block;background:#000';

  const label = document.createElement('div');
  label.textContent = formatted.displayLabel;
  label.style.cssText = `
    position:absolute;bottom:40px;left:0;right:0;
    padding:8px 16px;pointer-events:none;
    background:linear-gradient(transparent,rgba(0,0,0,0.75));
    color:${formatted.color};font:700 22px/1 Arial;letter-spacing:2px
  `;

  wrap.appendChild(video);
  wrap.appendChild(label);
  return wrap;
}

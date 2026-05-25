/**
 * ShareMeetLink.jsx — copyable invite URL for the current room.
 */

import { useState } from 'react';
import { buildMeetLink, copyMeetLink } from '../utils/meetLink';

export default function ShareMeetLink({ roomId, compact = false }) {
  const [copied, setCopied] = useState(false);
  const link = roomId ? buildMeetLink(roomId) : '';

  if (!roomId) return null;

  async function handleCopy() {
    try {
      await copyMeetLink(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const input = document.createElement('input');
      input.value = link;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (compact) {
    return (
      <button type="button" onClick={handleCopy} style={styles.copyBtnCompact} title={link}>
        {copied ? 'Copied!' : 'Copy invite link'}
      </button>
    );
  }

  return (
    <div style={styles.box}>
      <label style={styles.label}>SHARE MEET LINK</label>
      <div style={styles.row}>
        <input style={styles.input} readOnly value={link} onFocus={e => e.target.select()} />
        <button type="button" onClick={handleCopy} style={styles.copyBtn}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p style={styles.hint}>Anyone with this link can join after entering their name.</p>
    </div>
  );
}

const styles = {
  box: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontFamily: 'var(--font-display)',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text-muted)',
    letterSpacing: '0.12em',
  },
  row: {
    display: 'flex',
    gap: 8,
  },
  input: {
    flex: 1,
    minWidth: 0,
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-body)',
    fontSize: 12,
    padding: '10px 12px',
    outline: 'none',
  },
  copyBtn: {
    flexShrink: 0,
    background: 'var(--accent)',
    color: '#000',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontFamily: 'var(--font-display)',
    fontSize: 13,
    fontWeight: 700,
    padding: '10px 16px',
    cursor: 'pointer',
  },
  copyBtnCompact: {
    background: 'var(--surface-2)',
    color: 'var(--accent)',
    border: '1px solid var(--accent)',
    borderRadius: 6,
    fontFamily: 'var(--font-display)',
    fontSize: 12,
    fontWeight: 600,
    padding: '6px 14px',
    cursor: 'pointer',
  },
  hint: {
    fontSize: 11,
    color: 'var(--text-dim)',
    lineHeight: 1.5,
  },
};

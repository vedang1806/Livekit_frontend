export const ROLES = [
  { id: 'doctor',      label: 'Doctor',      icon: '⚕️' },
  { id: 'patient',     label: 'Patient',     icon: '🏥' },
  { id: 'interpreter', label: 'Interpreter', icon: '🌐' },
];

export const ROLE_COLOR = {
  doctor:      'var(--doctor)',
  patient:     'var(--patient)',
  interpreter: 'var(--interpreter)',
};

export function parseParticipantIdentity(identity = '') {
  const parts = identity.split('_');
  const role = ROLES.some(r => r.id === parts[0]) ? parts[0] : null;
  if (!role || parts.length < 2) {
    return { role: null, name: identity || 'Guest' };
  }
  const nameParts = parts.length > 2 ? parts.slice(1, -1) : [parts[1]];
  const name = nameParts.filter(Boolean).join(' ').replace(/_/g, ' ') || identity;
  return { role, name };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[1-9]\d{6,14}$/;
const USERNAME_RE = /^[a-z0-9_.]{3,24}$/;

export const validators = {
  email: (v) => EMAIL_RE.test(String(v || '').trim()),
  phone: (v) => PHONE_RE.test(String(v || '').trim()),
  username: (v) => USERNAME_RE.test(String(v || '').trim()),
  identifier: (v) => {
    const s = String(v || '').trim();
    return EMAIL_RE.test(s) || PHONE_RE.test(s);
  },
  otp: (v, length = 6) => new RegExp(`^\\d{${length}}$`).test(String(v || '')),
  dateOfBirth: (v) => {
    const d = new Date(v);
    if (isNaN(d.getTime())) return false;
    const age = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return age >= 13;
  },
  required: (v) => v !== undefined && v !== null && String(v).trim().length > 0,
};

export function getRegisterErrors(form) {
  const e = {};
  if (!validators.required(form.fullName)) e.fullName = 'Full name is required';
  if (!validators.username(form.username)) e.username = '3-24 chars: a-z 0-9 _ .';
  if (!validators.email(form.email)) e.email = 'Valid email required';
  if (!validators.phone(form.phone)) e.phone = 'Valid phone required (e.g. +234...)';
  if (!validators.dateOfBirth(form.dateOfBirth)) e.dateOfBirth = 'Must be a valid date (13+)';
  return e;
}
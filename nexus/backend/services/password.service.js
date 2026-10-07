const bcrypt = require('bcryptjs');

const ROUNDS = 10;

exports.hash = (plain) => bcrypt.hash(plain, ROUNDS);

exports.compare = (plain, hash) => bcrypt.compare(plain, hash);

exports.validate = (password) => {
  if (!password || typeof password !== 'string') return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Za-z]/.test(password)) return 'Password must contain a letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain a number.';
  return null;
};
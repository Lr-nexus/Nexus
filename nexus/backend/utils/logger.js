const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const current = levels[process.env.LOG_LEVEL] ?? (process.env.NODE_ENV === 'production' ? 2 : 3);

const ts = () => new Date().toISOString();

module.exports = {
  error: (...a) => current >= 0 && console.error(`[${ts()}] ❌`, ...a),
  warn: (...a) => current >= 1 && console.warn(`[${ts()}] ⚠️`, ...a),
  info: (...a) => current >= 2 && console.log(`[${ts()}] ℹ️`, ...a),
  debug: (...a) => current >= 3 && console.log(`[${ts()}] 🔍`, ...a),
};
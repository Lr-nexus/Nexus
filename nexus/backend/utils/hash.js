const crypto = require('crypto');
exports.sha256 = (v) => crypto.createHash('sha256').update(String(v)).digest('hex');
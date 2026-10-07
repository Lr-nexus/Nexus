exports.addMinutes = (d, m) => new Date(d.getTime() + m * 60 * 1000);
exports.addDays = (d, days) => new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
exports.isPast = (d) => d && new Date(d).getTime() < Date.now();
exports.isFuture = (d) => d && new Date(d).getTime() > Date.now();
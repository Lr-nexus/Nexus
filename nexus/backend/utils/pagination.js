exports.parsePagination = (query) => {
  const limit = Math.min(parseInt(query.limit || '20', 10) || 20, 100);
  const cursor = query.cursor || null;
  const page = Math.max(parseInt(query.page || '1', 10) || 1, 1);
  return { limit, cursor, page };
};

exports.buildCursorQuery = (cursor, field = 'createdAt') => {
  if (!cursor) return {};
  return { [field]: { $lt: new Date(cursor) } };
};

exports.buildMeta = ({ limit, results, cursorField = 'createdAt' }) => {
  const hasMore = results.length === limit;
  const nextCursor = hasMore ? results[results.length - 1][cursorField] : null;
  return { hasMore, nextCursor, count: results.length };
};
import { useCallback, useRef, useState } from 'react';

export default function usePagination(fetcher, { limit = 20, cursorField = 'createdAt' } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef(null);

  const load = useCallback(
    async (reset = false) => {
      if (loading) return;
      setLoading(true);
      setError(null);
      try {
        const params = reset ? { limit } : { limit, cursor: cursorRef.current };
        const data = await fetcher(params);
        const list = data?.items || data?.posts || data?.vibes || data?.conversations || data?.notifications || [];
        if (reset) setItems(list);
        else setItems((prev) => [...prev, ...list]);
        const last = list[list.length - 1];
        cursorRef.current = list.length === limit && last ? last[cursorField] : null;
        setHasMore(list.length === limit);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    },
    [fetcher, limit, loading, cursorField]
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    cursorRef.current = null;
    await load(true);
    setRefreshing(false);
  }, [load]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    load(false);
  }, [hasMore, loading, load]);

  return { items, setItems, loading, refreshing, error, hasMore, refresh, loadMore, initial: load };
}
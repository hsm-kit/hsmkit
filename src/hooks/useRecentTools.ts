import { useState, useCallback } from 'react';

const STORAGE_KEY = 'hsmkit-recent-tools';
const MAX_RECENT = 6;
const EXPIRE_DAYS = 90;

interface RecentTool {
  path: string;
  timestamp: number;
}

type LegacyRecentTool = RecentTool & { title?: string; color?: string };

export function useRecentTools() {
  const [recentTools, setRecentTools] = useState<RecentTool[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed: LegacyRecentTool[] = JSON.parse(saved);
      const cutoff = Date.now() - EXPIRE_DAYS * 24 * 60 * 60 * 1000;
      return parsed
        .filter(tool => tool.path && tool.timestamp > cutoff)
        .map(({ path, timestamp }) => ({ path, timestamp }));
    } catch {
      return [];
    }
  });

  const addRecentTool = useCallback((path: string) => {
    setRecentTools(prev => {
      const filtered = prev.filter(tool => tool.path !== path);
      const updated = [{ path, timestamp: Date.now() }, ...filtered].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch { /* localStorage unavailable */ }
      return updated;
    });
  }, []);

  const clearRecentTools = useCallback(() => {
    setRecentTools([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* localStorage unavailable */ }
  }, []);

  return { recentTools, addRecentTool, clearRecentTools };
}

const FAVORITES_KEY = 'hsmkit-favorite-tools';

export function useFavoriteTools() {
  const [favoriteTools, setFavoriteTools] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
      return Array.isArray(saved) ? saved.filter(value => typeof value === 'string') : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = useCallback((path: string) => {
    setFavoriteTools(previous => {
      const updated = previous.includes(path)
        ? previous.filter(item => item !== path)
        : [...previous, path];
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      } catch { /* localStorage unavailable */ }
      return updated;
    });
  }, []);

  return { favoriteTools, toggleFavorite };
}

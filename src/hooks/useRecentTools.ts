import { useState, useCallback } from 'react';

const STORAGE_KEY = 'hsmkit-recent-tools';
const MAX_RECENT = 6;
const EXPIRE_DAYS = 7;

interface RecentTool {
  path: string;
  title: string;
  color: string;
  timestamp: number;
}

export function useRecentTools() {
  const [recentTools, setRecentTools] = useState<RecentTool[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed: RecentTool[] = JSON.parse(saved);
      // 过滤过期记录（超过 7 天）
      const cutoff = Date.now() - EXPIRE_DAYS * 24 * 60 * 60 * 1000;
      return parsed.filter(t => t.timestamp > cutoff);
    } catch {
      return [];
    }
  });

  const addRecentTool = useCallback((tool: Omit<RecentTool, 'timestamp'>) => {
    setRecentTools(prev => {
      const filtered = prev.filter(t => t.path !== tool.path);
      const updated = [{ ...tool, timestamp: Date.now() }, ...filtered].slice(0, MAX_RECENT);
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

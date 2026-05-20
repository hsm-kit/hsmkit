import { useCallback } from 'react';

const PREFIX = 'hsmkit-input-';

export function useInputHistory(toolKey: string) {
  const storageKey = `${PREFIX}${toolKey}`;

  const getSaved = useCallback((): Record<string, string> => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }, [storageKey]);

  const saveInputs = useCallback((inputs: Record<string, string>) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(inputs));
    } catch { /* localStorage unavailable */ }
  }, [storageKey]);

  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch { /* localStorage unavailable */ }
  }, [storageKey]);

  return { getSaved, saveInputs, clearHistory };
}

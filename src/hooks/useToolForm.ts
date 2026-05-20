import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from './useToast';

const INPUT_HISTORY_PREFIX = 'hsmkit-input-';

interface UseToolFormOptions<TInput> {
  defaultInputs: TInput;
  /** Tool key for persisting input history (e.g. 'aes', 'des', 'rsa') */
  toolKey?: string;
}

interface UseToolFormReturn<TInput> {
  inputs: TInput;
  setInputs: React.Dispatch<React.SetStateAction<TInput>>;
  updateInput: (key: keyof TInput, value: string) => void;
  result: string;
  error: string;
  isProcessing: boolean;
  process: (fn: () => string | Promise<string>) => Promise<void>;
  clear: () => void;
  copyResult: () => void;
  setResult: React.Dispatch<React.SetStateAction<string>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * 通用工具表单 Hook
 * 封装 result/error/isProcessing 状态 + process/clear/copyResult 操作
 * 可选 toolKey 启用输入历史持久化
 */
export function useToolForm<TInput extends Record<string, string>>({ 
  defaultInputs,
  toolKey,
}: UseToolFormOptions<TInput>): UseToolFormReturn<TInput> {
  const toast = useToast();
  const storageKey = toolKey ? `${INPUT_HISTORY_PREFIX}${toolKey}` : '';
  const skipSaveRef = useRef(true);

  // 初始化：从 localStorage 恢复输入历史
  const [inputs, setInputs] = useState<TInput>(() => {
    if (!toolKey) return defaultInputs;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultInputs, ...parsed };
      }
    } catch { /* ignore */ }
    return defaultInputs;
  });

  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 自动保存输入历史（跳过首次渲染）
  useEffect(() => {
    if (!toolKey || skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(inputs));
    } catch { /* localStorage unavailable */ }
  }, [inputs, toolKey, storageKey]);

  const updateInput = useCallback((key: keyof TInput, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  }, []);

  const process = useCallback(async (fn: () => string | Promise<string>) => {
    setError('');
    setResult('');
    setIsProcessing(true);
    
    try {
      const res = await fn();
      setResult(res);
      toast.operationSuccess();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(errMsg);
      toast.operationError(errMsg);
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const clear = useCallback(() => {
    setInputs(defaultInputs);
    setResult('');
    setError('');
    if (toolKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch { /* ignore */ }
    }
  }, [defaultInputs, toolKey, storageKey]);

  const copyResult = useCallback(() => {
    navigator.clipboard.writeText(result);
    toast.copySuccess();
  }, [result, toast]);

  return {
    inputs,
    setInputs,
    updateInput,
    result,
    error,
    isProcessing,
    process,
    clear,
    copyResult,
    setResult,
    setError,
  };
}

export default useToolForm;

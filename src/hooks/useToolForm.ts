import { useState, useCallback } from 'react';
import { message } from 'antd';
import { useLanguage } from './useLanguage';

interface UseToolFormOptions<TInput> {
  defaultInputs: TInput;
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
 */
export function useToolForm<TInput extends Record<string, string>>({ 
  defaultInputs 
}: UseToolFormOptions<TInput>): UseToolFormReturn<TInput> {
  const { t } = useLanguage();
  const [inputs, setInputs] = useState<TInput>(defaultInputs);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clear = useCallback(() => {
    setInputs(defaultInputs);
    setResult('');
    setError('');
  }, [defaultInputs]);

  const copyResult = useCallback(() => {
    navigator.clipboard.writeText(result);
    message.success(t.common.copied || 'Copied to clipboard!');
  }, [result, t.common.copied]);

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

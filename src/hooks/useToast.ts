import { useCallback } from 'react';
import { message } from 'antd';
import { useLanguage } from './useLanguage';
import { getToolByPath } from '../data/toolRelations';
import { trackToolEvent } from '../utils/analytics';

const trackCurrentTool = (eventName: 'calculation_success' | 'calculation_error' | 'result_copy') => {
  const tool = getToolByPath(window.location.pathname);
  if (tool) trackToolEvent(eventName, { toolId: tool.seoKey });
};

export function useToast() {
  const { t } = useLanguage();

  const success = useCallback((msg: string) => {
    message.success(msg);
  }, []);

  const error = useCallback((msg: string) => {
    message.error(msg);
  }, []);

  const info = useCallback((msg: string) => {
    message.info(msg);
  }, []);

  const warning = useCallback((msg: string) => {
    message.warning(msg);
  }, []);

  const copySuccess = useCallback(() => {
    trackCurrentTool('result_copy');
    message.success(t.common.copied || 'Copied to clipboard!');
  }, [t.common.copied]);

  const copyError = useCallback(() => {
    message.error(t.common.copyFailed || 'Failed to copy');
  }, [t.common.copyFailed]);

  const operationSuccess = useCallback((msg?: string) => {
    trackCurrentTool('calculation_success');
    message.success(msg || t.common.operationSuccess || 'Operation completed successfully');
  }, [t.common.operationSuccess]);

  const operationError = useCallback((msg?: string) => {
    trackCurrentTool('calculation_error');
    message.error(msg || t.common.operationFailed || 'Operation failed');
  }, [t.common.operationFailed]);

  return {
    success,
    error,
    info,
    warning,
    copySuccess,
    copyError,
    operationSuccess,
    operationError,
  } as const;
}

export default useToast;

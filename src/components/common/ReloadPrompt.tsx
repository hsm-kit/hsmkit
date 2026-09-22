import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button, Space, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';

export function ReloadPrompt() {
  const { t } = useLanguage();
  const [showPrompt, setShowPrompt] = useState(false);

  const {
    needRefresh: [, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        setInterval(() => {
          r.update();
        }, 30 * 60 * 1000);
      }
    },
    onNeedRefresh() {
      setShowPrompt(true);
    },
    onOfflineReady() {
      message.success(t.common?.offlineReady || 'App ready for offline use', 3);
    },
    onRegisterError() {
      // SW registration failed, silently ignore
    },
  });

  const close = () => {
    setShowPrompt(false);
    setNeedRefresh(false);
  };

  const reload = () => {
    updateServiceWorker(true);
  };

  if (!showPrompt) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 16,
      right: 16,
      left: 16,
      width: 'min(360px, calc(100vw - 32px))',
      marginLeft: 'auto',
      zIndex: 9999,
      background: 'var(--card-bg)',
      borderRadius: 8,
      padding: '16px 20px',
      boxShadow: 'var(--shadow-md)',
      border: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    }}>
      <div style={{ flex: 1, fontSize: 14, color: 'var(--text-primary)' }}>
        {t.common?.newVersionAvailable || 'New version available. Reload to update?'}
      </div>
      <Space>
        <Button size="small" onClick={close}>
          {t.common?.later || 'Later'}
        </Button>
        <Button
          type="primary"
          size="small"
          icon={<ReloadOutlined />}
          onClick={reload}
        >
          {t.common?.reload || 'Reload'}
        </Button>
      </Space>
    </div>
  );
}

export default ReloadPrompt;

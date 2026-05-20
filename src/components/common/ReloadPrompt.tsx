import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button, Space, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useState } from 'react';

export function ReloadPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  const {
    needRefresh: [, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Check for updates every 30 minutes
        setInterval(() => {
          r.update();
        }, 30 * 60 * 1000);
      }
    },
    onNeedRefresh() {
      setShowPrompt(true);
    },
    onOfflineReady() {
      message.success('App ready for offline use', 3);
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
      bottom: 24,
      right: 24,
      zIndex: 9999,
      background: '#fff',
      borderRadius: 12,
      padding: '16px 20px',
      boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
      border: '1px solid #e8e8e8',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      maxWidth: 360,
    }}>
      <div style={{ flex: 1, fontSize: 14, color: '#1f1f1f' }}>
        New version available. Reload to update?
      </div>
      <Space>
        <Button size="small" onClick={close}>
          Later
        </Button>
        <Button
          type="primary"
          size="small"
          icon={<ReloadOutlined />}
          onClick={reload}
        >
          Reload
        </Button>
      </Space>
    </div>
  );
}

export default ReloadPrompt;

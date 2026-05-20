import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button, Space, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Check for updates every hour
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError() {
      // SW registration failed, silently ignore
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (offlineReady) {
    message.success('App is ready for offline use', 3);
    close();
    return null;
  }

  if (needRefresh) {
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
            onClick={() => updateServiceWorker(true)}
          >
            Reload
          </Button>
        </Space>
      </div>
    );
  }

  return null;
}

export default ReloadPrompt;

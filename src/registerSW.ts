// PWA Service Worker 注册
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker 注册成功:', registration.scope);

          // 检查更新
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // 新版本可用
                  if (confirm('发现新版本！是否立即更新？')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ Service Worker 注册失败:', error);
        });
    });
  }
}

// 检查是否可以安装 PWA
export function checkInstallPrompt() {
  let deferredPrompt: any = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('💡 可以安装为应用');
    e.preventDefault();
    deferredPrompt = e;

    // 可以在这里显示自定义的安装按钮
    // 示例：显示一个"安装应用"的提示
  });

  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA 已安装');
    deferredPrompt = null;
  });

  return deferredPrompt;
}


interface PrerenderInjected {
  isPrerendering?: boolean;
}

declare global {
  interface Window {
    __PRERENDER_INJECTED?: PrerenderInjected;
  }
}

// 检测是否在预渲染环境（必须在运行时读取：注入标记可能在模块执行后才出现）
export const getIsPrerendering = (): boolean =>
  typeof window !== 'undefined' && !!window.__PRERENDER_INJECTED?.isPrerendering;

// 触发预渲染就绪事件（只触发一次）
let prerenderEventFired = false;
export const triggerPrerenderReady = (): void => {
  if (getIsPrerendering() && !prerenderEventFired) {
    prerenderEventFired = true;
    document.dispatchEvent(new Event('prerender-ready'));
  }
};

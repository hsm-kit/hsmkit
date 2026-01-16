import { useLayoutEffect, useRef } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  /**
   * 控制预渲染就绪时机
   * - true: 立即触发 prerender-ready 事件
   * - false: 不触发（页面需要手动触发或等待其他条件）
   * - undefined: 使用默认行为（立即触发）
   */
  prerenderReady?: boolean;
}

// 检测是否在预渲染环境（必须在运行时读取：注入标记可能在模块执行后才出现）
const getIsPrerendering = () =>
  typeof window !== 'undefined' && (window as any).__PRERENDER_INJECTED?.isPrerendering;

// 触发预渲染就绪事件（只触发一次）
let prerenderEventFired = false;
export const triggerPrerenderReady = () => {
  if (getIsPrerendering() && !prerenderEventFired) {
    prerenderEventFired = true;
    document.dispatchEvent(new Event('prerender-ready'));
  }
};

/**
 * SEO Component - Dynamically updates page metadata for search engines
 * 支持预渲染：在预渲染时直接操作 DOM，确保 meta 标签被正确捕获
 */
export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  prerenderReady = true,
}) => {
  const hasTriggeredRef = useRef(false);

  // 使用 useLayoutEffect 确保在渲染前执行（对预渲染更友好）
  const updateMetaTags = () => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Helper function to update or create meta tag
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Update meta tags
    updateMeta('description', description);
    if (keywords) {
      updateMeta('keywords', keywords);
    }
    
    // Open Graph tags
    updateMeta('og:title', ogTitle || title, true);
    updateMeta('og:description', ogDescription || description, true);
    
    // Twitter tags
    updateMeta('twitter:title', ogTitle || title);
    updateMeta('twitter:description', ogDescription || description);
    
    // Canonical URL
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    // 触发预渲染就绪事件
    if (prerenderReady && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      // 延迟触发，确保所有内容都已渲染
      setTimeout(() => {
        triggerPrerenderReady();
      }, 100);
    }
  };

  // 在预渲染环境使用 useLayoutEffect，否则使用 useEffect
  useLayoutEffect(() => {
    updateMetaTags();
  }, [title, description, keywords, canonical, ogTitle, ogDescription, prerenderReady]);

  return null;
};

export default SEO;

import { useLayoutEffect, useCallback } from 'react';
import { triggerPrerenderReady } from '../../utils/prerender';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  noindex?: boolean;
  /**
   * 控制预渲染就绪时机
   * - true: 立即触发 prerender-ready 事件
   * - false: 不触发（页面需要手动触发或等待其他条件）
   * - undefined: 使用默认行为（立即触发）
   */
  prerenderReady?: boolean;
}

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
  noindex,
  prerenderReady = true,
}) => {
  const updateMetaTags = useCallback(() => {
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

    // Helper to remove meta tag
    const removeMeta = (name: string) => {
      const meta = document.querySelector(`meta[name="${name}"]`);
      if (meta) meta.remove();
    };

    // noindex handling
    if (noindex) {
      updateMeta('robots', 'noindex, nofollow');
    } else {
      removeMeta('robots');
    }

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
    if (prerenderReady) {
      setTimeout(() => {
        triggerPrerenderReady();
      }, 100);
    }
  }, [title, description, keywords, canonical, ogTitle, ogDescription, noindex, prerenderReady]);

  useLayoutEffect(() => {
    updateMetaTags();
  }, [updateMetaTags]);

  return null;
};

export default SEO;

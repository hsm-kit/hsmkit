import { useLayoutEffect, useCallback } from 'react';
import { triggerPrerenderReady } from '../../utils/prerender';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: 'website' | 'article';
  ogLocale?: string;
  ogImage?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogImageAlt?: string;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleSection?: string;
  noindex?: boolean;
  alternates?: Array<{ lang: string; href: string }>;
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
  ogType = 'website',
  ogLocale = 'en_US',
  ogImage,
  ogImageWidth,
  ogImageHeight,
  ogImageAlt,
  articlePublishedTime,
  articleModifiedTime,
  articleSection,
  noindex,
  alternates = [],
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

    const removeProperty = (property: string) => {
      document.querySelector(`meta[property="${property}"]`)?.remove();
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
    } else {
      removeMeta('keywords');
    }
    
    // Open Graph tags
    updateMeta('og:title', ogTitle || title, true);
    updateMeta('og:description', ogDescription || description, true);
    updateMeta('og:url', canonical || window.location.href, true);
    updateMeta('og:type', ogType, true);
    updateMeta('og:locale', ogLocale, true);
    if (ogImage) {
      updateMeta('og:image', ogImage, true);
      updateMeta('twitter:image', ogImage);
      updateMeta('og:image:width', String(ogImageWidth || 1200), true);
      updateMeta('og:image:height', String(ogImageHeight || 630), true);
      updateMeta('og:image:alt', ogImageAlt || title, true);
      updateMeta('twitter:image:alt', ogImageAlt || title);
    }
    if (ogType === 'article') {
      if (articlePublishedTime) updateMeta('article:published_time', articlePublishedTime, true);
      if (articleModifiedTime) updateMeta('article:modified_time', articleModifiedTime, true);
      if (articleSection) updateMeta('article:section', articleSection, true);
    } else {
      removeProperty('article:published_time');
      removeProperty('article:modified_time');
      removeProperty('article:section');
    }
    
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
    } else {
      document.querySelector('link[rel="canonical"]')?.remove();
    }

    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(link => link.remove());
    alternates.forEach(({ lang, href }) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang;
      link.href = href;
      document.head.appendChild(link);
    });

    // 触发预渲染就绪事件
    if (prerenderReady) {
      setTimeout(() => {
        triggerPrerenderReady();
      }, 100);
    }
  }, [title, description, keywords, canonical, ogTitle, ogDescription, ogType, ogLocale, ogImage, ogImageWidth, ogImageHeight, ogImageAlt, articlePublishedTime, articleModifiedTime, articleSection, noindex, alternates, prerenderReady]);

  useLayoutEffect(() => {
    updateMetaTags();
  }, [updateMetaTags]);

  return null;
};

export default SEO;

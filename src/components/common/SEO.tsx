import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
}

/**
 * SEO Component - Dynamically updates page metadata for search engines
 * Since react-helmet-async doesn't support React 19, we use vanilla DOM manipulation
 */
export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;

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

    // Cleanup function
    return () => {
      // Optionally reset to default title on unmount
    };
  }, [title, description, keywords, canonical, ogTitle, ogDescription]);

  return null;
};

export default SEO;


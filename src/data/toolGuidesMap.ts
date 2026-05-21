import articlesEn from './guides/en.json';

interface RelatedGuide {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: number;
}

// 从 guides 数据自动生成 tool → guides 映射
const buildToolGuidesMap = (): Record<string, RelatedGuide[]> => {
  const map: Record<string, RelatedGuide[]> = {};

  for (const article of articlesEn) {
    const toolPath = (article as Record<string, unknown>).relatedTool as string | undefined;
    if (toolPath) {
      if (!map[toolPath]) {
        map[toolPath] = [];
      }
      map[toolPath].push({
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        category: article.category,
        readTime: article.readTime,
      });
    }
  }

  return map;
};

const toolGuidesMap = buildToolGuidesMap();

export const getRelatedGuides = (toolPath: string): RelatedGuide[] => {
  return toolGuidesMap[toolPath] || [];
};

export type { RelatedGuide };

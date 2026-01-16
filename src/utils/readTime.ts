/**
 * 计算 Markdown 文章的阅读时间
 * 
 * 阅读速度参考：
 * - 英文：200-275 词/分钟
 * - 中文：300-500 字/分钟
 * - 技术文章通常按较慢速度计算（需要思考）
 */

// 英文阅读速度（词/分钟）
const ENGLISH_WPM = 200;

// 中文阅读速度（字/分钟）
const CHINESE_CPM = 300;

/**
 * 计算阅读时间（分钟）
 * @param markdownText - Markdown 文本内容
 * @returns 阅读时间（分钟），最少 1 分钟
 */
export const calculateReadTime = (markdownText: string): number => {
  if (!markdownText) return 1;
  
  // 移除 Markdown 语法标记以获得纯文本
  const cleanText = markdownText
    // 移除代码块
    .replace(/```[\s\S]*?```/g, '')
    // 移除行内代码
    .replace(/`[^`]+`/g, '')
    // 移除链接 URL 部分，保留链接文字
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // 移除图片
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    // 移除 HTML 标签
    .replace(/<[^>]+>/g, '')
    // 移除标题标记
    .replace(/^#{1,6}\s+/gm, '')
    // 移除粗体/斜体标记
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
    // 移除引用标记
    .replace(/^>\s+/gm, '')
    // 移除列表标记
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    // 移除水平线
    .replace(/^[-*_]{3,}$/gm, '')
    .trim();

  // 统计中文字符数
  const chineseChars = (cleanText.match(/[\u4e00-\u9fa5]/g) || []).length;
  
  // 统计英文单词数（非中文部分按空格分割）
  const nonChineseText = cleanText.replace(/[\u4e00-\u9fa5]/g, ' ');
  const englishWords = nonChineseText.trim().split(/\s+/).filter(word => word.length > 0).length;
  
  // 计算总阅读时间
  const chineseMinutes = chineseChars / CHINESE_CPM;
  const englishMinutes = englishWords / ENGLISH_WPM;
  
  // 向上取整，最少 1 分钟
  const totalMinutes = Math.max(1, Math.ceil(chineseMinutes + englishMinutes));
  
  return totalMinutes;
};

export default calculateReadTime;

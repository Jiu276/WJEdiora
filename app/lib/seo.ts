// SEO 元数据自动生成工具

/**
 * 从纯文本中提取摘要（去除HTML标签）
 */
function extractTextFromHtml(html: string, maxLength: number = 200): string {
  const text = html
    .replace(/<[^>]*>/g, '') // 移除HTML标签
    .replace(/\s+/g, ' ') // 合并空白字符
    .trim()
  
  if (text.length <= maxLength) {
    return text
  }
  
  // 在最后一个完整句子处截断
  const truncated = text.substring(0, maxLength)
  const lastPeriod = truncated.lastIndexOf('。')
  const lastPeriodEn = truncated.lastIndexOf('.')
  const lastIndex = Math.max(lastPeriod, lastPeriodEn)
  
  if (lastIndex > maxLength * 0.7) {
    return truncated.substring(0, lastIndex + 1)
  }
  
  return truncated + '...'
}

/**
 * 自动生成SEO标题
 */
export function generateMetaTitle(title: string, customTitle?: string | null): string {
  if (customTitle && customTitle.trim()) {
    return customTitle.trim()
  }
  return title.trim()
}

/**
 * 自动生成SEO描述
 */
export function generateMetaDescription(
  excerpt: string | null,
  content: string,
  customDescription?: string | null
): string {
  if (customDescription && customDescription.trim()) {
    return customDescription.trim()
  }
  
  if (excerpt && excerpt.trim()) {
    return excerpt.trim().substring(0, 500)
  }
  
  // 从内容中提取
  return extractTextFromHtml(content, 500)
}

/**
 * 自动生成SEO关键词
 */
export function generateMetaKeywords(
  tags: string[],
  categoryName: string | null,
  title: string,
  customKeywords?: string | null
): string {
  if (customKeywords && customKeywords.trim()) {
    return customKeywords.trim()
  }
  
  const keywords: string[] = []
  
  // 添加标签
  if (tags.length > 0) {
    keywords.push(...tags)
  }
  
  // 添加类别
  if (categoryName) {
    keywords.push(categoryName)
  }
  
  // 从标题中提取关键词（中文分词简单处理）
  const titleWords = title
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 2)
    .slice(0, 3)
  
  keywords.push(...titleWords)
  
  // 去重并限制数量
  const uniqueKeywords = Array.from(new Set(keywords)).slice(0, 10)
  
  return uniqueKeywords.join(', ')
}



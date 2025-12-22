// Slug 生成工具函数

/**
 * 将中文标题转换为 URL 友好的 slug
 * Next.js 支持中文 URL，所以我们保留中文字符
 */
export function generateSlug(title: string): string {
  if (!title) return ''
  
  // 移除 HTML 标签
  let slug = title.replace(/<[^>]*>/g, '')
  
  // 替换空格和常见标点为连字符
  slug = slug
    .replace(/\s+/g, '-')           // 空格
    .replace(/[:：]/g, '-')         // 冒号
    .replace(/[，,]/g, '-')         // 逗号
    .replace(/[。.]/g, '-')         // 句号
    .replace(/[？?]/g, '-')         // 问号
    .replace(/[！!]/g, '-')         // 感叹号
    .replace(/[；;]/g, '-')         // 分号
  
  // 移除其他特殊字符，但保留中文字符、英文字母、数字和连字符
  slug = slug.replace(/[^\u4e00-\u9fa5a-zA-Z0-9-]/g, '')
  
  // 转换为小写（只影响英文字母）
  slug = slug.toLowerCase()
  
  // 移除连续的连字符
  slug = slug.replace(/-+/g, '-')
  
  // 移除开头和结尾的连字符
  slug = slug.replace(/^-+|-+$/g, '')
  
  // 限制长度（但保留中文字符）
  if (slug.length > 200) {
    slug = slug.substring(0, 200)
    // 确保不在单词中间截断
    const lastDash = slug.lastIndexOf('-')
    if (lastDash > 150) {
      slug = slug.substring(0, lastDash)
    }
  }
  
  return slug || 'article'
}

/**
 * 确保 slug 唯一性（添加数字后缀）
 */
export async function ensureUniqueSlug(
  baseSlug: string,
  checkUnique: (slug: string, excludeId?: string) => Promise<boolean>,
  excludeId?: string
): Promise<string> {
  let slug = baseSlug
  let counter = 1
  
  while (true) {
    const isUnique = await checkUnique(slug, excludeId)
    if (isUnique) {
      break
    }
    
    slug = `${baseSlug}-${counter}`
    counter++
    
    // 防止无限循环
    if (counter > 1000) {
      slug = `${baseSlug}-${Date.now()}`
      break
    }
  }
  
  return slug
}


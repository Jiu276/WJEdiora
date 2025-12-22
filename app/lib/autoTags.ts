import { prisma } from './prisma'
import { extractBestKeywordForTag } from './keywordExtractor'
import { findSimilarTag, validateTagName } from './similarity'
import { generateSlug } from './slug'

/**
 * 匹配结果接口
 */
export interface MatchResult {
  categoryIds: string[]
  confidence: number // 置信度 0-1
  suggestedTag?: {
    name: string
    confidence: number
    reason: string
  }
}

/**
 * 根据文章标题和内容自动匹配标签类别（增强版）
 * @param title 文章标题
 * @param content 文章内容（可选）
 * @returns 匹配结果
 */
export async function autoMatchTags(
  title: string,
  content?: string
): Promise<MatchResult> {
  try {
    // 获取所有可用的标签类别
    const categories = await prisma.category.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, slug: true },
    })

    if (categories.length === 0) {
      // 如果没有现有标签，建议创建新标签
      const suggestedTag = extractBestKeywordForTag(title, content)
      return {
        categoryIds: [],
        confidence: 0,
        suggestedTag: suggestedTag
          ? {
              name: suggestedTag,
              confidence: 0.5,
              reason: '没有现有标签类别，建议创建新标签',
            }
          : undefined,
      }
    }

    // 构建关键词匹配规则
    const keywordMap: Record<string, string[]> = {
      '生活': ['生活', '日常', '家居', '家庭', '生活方式', '生活品质', '生活技巧', '生活指南', '生活智慧', '生活美学'],
      '旅游': ['旅游', '旅行', '攻略', '景点', '目的地', '游记', '出行', '度假', '自由行', '跟团'],
      '科技': ['科技', '技术', 'AI', '人工智能', '互联网', '软件', '硬件', '创新', '数字化', '智能'],
      '美食': ['美食', '食物', '烹饪', '料理', '菜谱', '餐厅', '小吃', '甜品', '饮品', '食材'],
      '健康': ['健康', '养生', '保健', '运动', '健身', '饮食', '营养', '医疗', '疾病', '预防'],
      '教育': ['教育', '学习', '培训', '课程', '知识', '技能', '学校', '学生', '老师', '教学'],
      '娱乐': ['娱乐', '电影', '音乐', '游戏', '综艺', '明星', '八卦', '休闲', '放松', '消遣'],
      '财经': ['财经', '金融', '投资', '理财', '股票', '基金', '经济', '商业', '创业', '赚钱'],
      '体育': ['体育', '运动', '比赛', '健身', '足球', '篮球', '跑步', '训练', '竞技', '运动员'],
      '时尚': ['时尚', '穿搭', '服装', '美容', '化妆', '搭配', '潮流', '风格', '品牌', '设计'],
    }

    // 合并标题和内容进行匹配
    const text = `${title} ${content || ''}`.toLowerCase()
    const matchScores: Record<string, number> = {}

    // 计算每个类别的匹配分数
    for (const category of categories) {
      const keywords = keywordMap[category.name] || []
      let score = 0

      // 检查类别名称是否在文本中（高权重）
      if (text.includes(category.name.toLowerCase()) || text.includes(category.slug.toLowerCase())) {
        score += 10
      }

      // 检查关键词匹配
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          score += 1
        }
      }

      if (score > 0) {
        matchScores[category.id] = score
      }
    }

    // 计算最大分数（用于归一化）
    const maxScore = Math.max(...Object.values(matchScores), 1)
    const normalizedScores: Record<string, number> = {}
    for (const [id, score] of Object.entries(matchScores)) {
      normalizedScores[id] = score / maxScore
    }

    // 按分数排序，选择分数最高的类别（最多3个）
    const sortedCategories = Object.entries(normalizedScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)

    // 计算平均置信度
    const avgConfidence =
      sortedCategories.length > 0
        ? sortedCategories.reduce((sum, [, score]) => sum + score, 0) / sortedCategories.length
        : 0

    // 如果置信度 > 0.6，直接使用现有标签
    if (avgConfidence > 0.6) {
      return {
        categoryIds: sortedCategories.map(([id]) => id),
        confidence: avgConfidence,
      }
    }

    // 如果置信度 < 0.3，建议创建新标签（高置信度自动创建）
    if (avgConfidence < 0.3) {
      const suggestedTag = extractBestKeywordForTag(title, content)
      if (suggestedTag) {
        // 检查是否与现有标签相似
        const existingTagNames = categories.map((c) => c.name)
        const similarTag = findSimilarTag(suggestedTag, existingTagNames, 0.8)

        if (!similarTag) {
          // 验证标签名称
          const validation = validateTagName(suggestedTag)
          if (validation.valid) {
            return {
              categoryIds: sortedCategories.map(([id]) => id), // 仍然使用匹配到的标签（如果有）
              confidence: avgConfidence,
              suggestedTag: {
                name: suggestedTag,
                confidence: 0.7, // 高置信度，可以自动创建
                reason: '现有标签匹配度低，建议创建新标签',
              },
            }
          }
        } else {
          // 找到相似标签，使用相似标签
          const similarCategory = categories.find((c) => c.name === similarTag)
          if (similarCategory) {
            return {
              categoryIds: [similarCategory.id, ...sortedCategories.map(([id]) => id)],
              confidence: Math.max(avgConfidence, 0.8),
            }
          }
        }
      }
    }

    // 置信度在 0.3-0.6 之间，建议创建但需要审核
    const suggestedTag = extractBestKeywordForTag(title, content)
    if (suggestedTag) {
      const existingTagNames = categories.map((c) => c.name)
      const similarTag = findSimilarTag(suggestedTag, existingTagNames, 0.8)

      if (!similarTag) {
        const validation = validateTagName(suggestedTag)
        if (validation.valid) {
          return {
            categoryIds: sortedCategories.map(([id]) => id),
            confidence: avgConfidence,
            suggestedTag: {
              name: suggestedTag,
              confidence: 0.5, // 中等置信度，需要审核
              reason: '现有标签匹配度中等，建议创建新标签（需审核）',
            },
          }
        }
      }
    }

    // 如果没有任何匹配，使用默认标签（生活）
    if (sortedCategories.length === 0) {
      const defaultCategory = categories.find((c) => c.name === '生活' || c.slug === 'life')
      if (defaultCategory) {
        return {
          categoryIds: [defaultCategory.id],
          confidence: 0.3,
        }
      }
      // 如果没有默认标签，返回第一个类别
      return {
        categoryIds: categories.length > 0 ? [categories[0].id] : [],
        confidence: 0.2,
      }
    }

    return {
      categoryIds: sortedCategories.map(([id]) => id),
      confidence: avgConfidence,
    }
  } catch (error) {
    console.error('Error auto-matching tags:', error)
    // 出错时返回空结果
    return {
      categoryIds: [],
      confidence: 0,
    }
  }
}

/**
 * 智能创建新标签类别
 * @param tagName 标签名称
 * @param confidence 置信度
 * @param autoCreate 是否自动创建（true）还是标记为待审核（false）
 * @returns 创建的标签类别ID
 */
export async function createSmartTag(
  tagName: string,
  confidence: number,
  autoCreate: boolean = false
): Promise<string | null> {
  try {
    // 验证标签名称
    const validation = validateTagName(tagName)
    if (!validation.valid) {
      console.error('Invalid tag name:', validation.error)
      return null
    }

    // 检查是否已存在
    const existing = await prisma.category.findFirst({
      where: {
        name: tagName,
        deletedAt: null,
      },
    })

    if (existing) {
      return existing.id
    }

    // 检查相似标签
    const allCategories = await prisma.category.findMany({
      where: { deletedAt: null },
      select: { name: true },
    })
    const similarTag = findSimilarTag(tagName, allCategories.map((c) => c.name), 0.8)

    if (similarTag) {
      // 使用相似标签
      const similarCategory = await prisma.category.findFirst({
        where: {
          name: similarTag,
          deletedAt: null,
        },
      })
      if (similarCategory) {
        return similarCategory.id
      }
    }

    // 生成 slug
    let slug = generateSlug(tagName)
    
    // 如果生成的 slug 为空，使用标签名称
    if (!slug || slug.trim() === '') {
      slug = tagName.toLowerCase().replace(/\s+/g, '-')
    }
    
    // 确保 slug 唯一性
    let finalSlug = slug
    let counter = 1
    while (true) {
      const existing = await prisma.category.findFirst({
        where: {
          slug: finalSlug,
          deletedAt: null,
        },
      })
      
      if (!existing) {
        break
      }
      
      finalSlug = `${slug}-${counter}`
      counter++
      
      if (counter > 1000) {
        finalSlug = `${slug}-${Date.now()}`
        break
      }
    }

    // 创建新标签
    const newCategory = await prisma.category.create({
      data: {
        name: tagName,
        slug: finalSlug,
        autoCreated: autoCreate,
        confidenceScore: confidence,
        needsReview: !autoCreate, // 如果不是自动创建，标记为需要审核
      },
    })

    return newCategory.id
  } catch (error) {
    console.error('Error creating smart tag:', error)
    return null
  }
}

/**
 * 为文章创建标签关联（增强版）
 * @param articleId 文章ID
 * @param matchResult 匹配结果
 */
export async function createArticleTagsFromMatch(
  articleId: string,
  matchResult: MatchResult
): Promise<void> {
  try {
    let categoryIds = [...matchResult.categoryIds]

    // 如果有建议标签且置信度高，自动创建
    if (matchResult.suggestedTag && matchResult.suggestedTag.confidence >= 0.7) {
      const newTagId = await createSmartTag(
        matchResult.suggestedTag.name,
        matchResult.suggestedTag.confidence,
        true // 自动创建
      )
      if (newTagId) {
        categoryIds.push(newTagId)
      }
    }
    // 如果置信度中等，创建但标记为待审核
    else if (matchResult.suggestedTag && matchResult.suggestedTag.confidence >= 0.5) {
      const newTagId = await createSmartTag(
        matchResult.suggestedTag.name,
        matchResult.suggestedTag.confidence,
        false // 需要审核
      )
      if (newTagId) {
        categoryIds.push(newTagId)
      }
    }

    // 去重
    categoryIds = Array.from(new Set(categoryIds))

    if (categoryIds.length === 0) {
      return
    }

    // 获取类别名称作为标签
    const categories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
        deletedAt: null,
      },
      select: { id: true, name: true },
    })

    // 为每个匹配的类别创建标签
    const tagData = categories.map((category) => ({
      articleId,
      tag: category.name,
    }))

    // 批量创建标签（使用 createMany，忽略重复）
    if (tagData.length > 0) {
      await prisma.articleTag.createMany({
        data: tagData,
        skipDuplicates: true,
      })
    }
  } catch (error) {
    console.error('Error creating article tags from match:', error)
    // 不抛出错误，避免影响文章创建
  }
}

/**
 * 为文章创建标签关联（兼容旧版本）
 * @param articleId 文章ID
 * @param categoryIds 标签类别ID数组
 */
export async function createArticleTags(articleId: string, categoryIds: string[]): Promise<void> {
  try {
    if (categoryIds.length === 0) {
      return
    }

    // 获取类别名称作为标签
    const categories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
        deletedAt: null,
      },
      select: { id: true, name: true },
    })

    // 为每个匹配的类别创建标签
    const tagData = categories.map((category) => ({
      articleId,
      tag: category.name,
    }))

    // 批量创建标签（使用 createMany，忽略重复）
    if (tagData.length > 0) {
      await prisma.articleTag.createMany({
        data: tagData,
        skipDuplicates: true,
      })
    }
  } catch (error) {
    console.error('Error creating article tags:', error)
    // 不抛出错误，避免影响文章创建
  }
}

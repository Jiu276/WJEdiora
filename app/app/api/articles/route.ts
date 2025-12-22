import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  generateMetaTitle,
  generateMetaDescription,
  generateMetaKeywords,
} from '@/lib/seo'
import { generateSlug } from '@/lib/slug'
import { autoMatchTags, createArticleTags, createArticleTagsFromMatch } from '@/lib/autoTags'
import { getCurrentUser } from '@/lib/auth'

// GET /api/articles - 获取所有文章（支持状态筛选、搜索、排序）
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const categoryId = searchParams.get('categoryId')
    const titleId = searchParams.get('titleId')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'publishDate'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = searchParams.get('limit')
    const page = searchParams.get('page')
    
    const where: any = {
      deletedAt: null, // 软删除过滤
    }
    
    if (status) {
      where.status = status
    }
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    
    if (titleId) {
      where.titleId = titleId
    }
    
    // 日期范围筛选
    if (startDate || endDate) {
      where.publishDate = {}
      if (startDate) {
        where.publishDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.publishDate.lte = new Date(endDate)
      }
    }
    
    // 搜索功能（标题和内容）
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { excerpt: { contains: search } },
      ]
    }
    
    // 排序
    const orderBy: any = {}
    if (sortBy === 'title') {
      orderBy.title = sortOrder
    } else if (sortBy === 'author') {
      orderBy.author = sortOrder
    } else if (sortBy === 'publishDate') {
      orderBy.publishDate = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }
    
    // 分页参数
    const take = limit ? parseInt(limit) : undefined
    const skip = page && take ? (parseInt(page) - 1) * take : undefined
    
    const articles = await prisma.article.findMany({
      where,
      orderBy,
      take,
      skip,
    })
    
    // 获取所有标签类别，用于关联显示
    const categories = await prisma.category.findMany({
      where: { deletedAt: null },
    })
    const categoryMap = new Map(categories.map(c => [c.id, c]))
    
    // 为每篇文章添加标签类别信息
    const articlesWithCategory = articles.map(article => ({
      ...article,
      category: article.categoryId ? categoryMap.get(article.categoryId) : null,
    }))
    
    return NextResponse.json(articlesWithCategory)
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

// POST /api/articles - 创建文章
export async function POST(request: NextRequest) {
  try {
    // 获取当前登录用户
    const currentUser = await getCurrentUser()
    const defaultAuthor = currentUser?.username || 'Admin'
    
    const body = await request.json()
    const {
      title,
      content,
      excerpt,
      status = 'published',
      categoryId,
      titleId,
      author = defaultAuthor, // 使用当前登录用户的用户名作为默认作者
      publishDate,
      featuredImage,
      enableKeywordLinks = false,
      metaTitle,
      metaDescription,
      metaKeywords,
      images = [], // [{url, thumbnail, description, source}]
    } = body
    
    // 生成基础 slug（支持中文）
    let baseSlug = generateSlug(title)
    
    // 如果生成的 slug 为空（可能是纯中文标题），使用 ID 作为后备
    if (!baseSlug || baseSlug.trim() === '') {
      baseSlug = 'article'
    }
    
    // 确保 slug 唯一性
    let slug = baseSlug
    let counter = 1
    while (true) {
      const existing = await prisma.article.findFirst({
        where: {
          slug,
          deletedAt: null,
        },
      })
      
      if (!existing) {
        break // slug 可用
      }
      
      // 如果 slug 已存在，添加数字后缀
      slug = `${baseSlug}-${counter}`
      counter++
      
      // 防止无限循环
      if (counter > 1000) {
        // 如果尝试1000次都冲突，使用时间戳
        slug = `${baseSlug}-${Date.now()}`
        break
      }
    }
    
    // 获取类别信息用于自动生成SEO
    let categoryName: string | null = null
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, deletedAt: null },
      })
      categoryName = category?.name || null
    }
    
    // 自动生成SEO元数据（只有在明确提供了自定义值时才使用，否则自动生成）
    const autoMetaTitle = metaTitle !== undefined && metaTitle !== null && metaTitle.trim()
      ? metaTitle.trim()
      : generateMetaTitle(title, null)
    const autoMetaDescription = metaDescription !== undefined && metaDescription !== null && metaDescription.trim()
      ? metaDescription.trim()
      : generateMetaDescription(excerpt, content || '', null)
    const autoMetaKeywords = metaKeywords !== undefined && metaKeywords !== null && metaKeywords.trim()
      ? metaKeywords.trim()
      : generateMetaKeywords([], categoryName, title, null)
    
    // 如果状态为已发布且未提供发布日期，默认使用当前时间
    const finalPublishDate = publishDate 
      ? new Date(publishDate) 
      : (status === 'published' ? new Date() : null)

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content: content || '',
        excerpt: excerpt || '',
        status: status as 'draft' | 'published',
        categoryId,
        titleId: titleId || '1', // 默认标题
        author,
        publishDate: finalPublishDate,
        featuredImage: featuredImage || (images?.[0]?.url ?? null),
        enableKeywordLinks,
        // 自动生成SEO元数据
        metaTitle: autoMetaTitle,
        metaDescription: autoMetaDescription,
        metaKeywords: autoMetaKeywords,
      },
    })

    // 写入文章配图
    if (Array.isArray(images) && images.length > 0) {
      const imageData = images.slice(0, 5).map((img: any, idx: number) => ({
        articleId: article.id,
        url: img.url,
        thumbnail: img.thumbnail ?? null,
        description: img.description ?? null,
        source: img.source ?? null,
        sortOrder: idx,
      }))
      await prisma.articleImage.createMany({ data: imageData })
    }

    // 自动匹配并创建文章标签（智能模式）
    if (!categoryId) {
      // 如果没有手动指定类别，使用智能匹配
      const matchResult = await autoMatchTags(title, content || '')
      
      if (matchResult.categoryIds.length > 0) {
        // 使用第一个匹配的类别作为主类别
        await prisma.article.update({
          where: { id: article.id },
          data: { categoryId: matchResult.categoryIds[0] },
        })
      }
      
      // 使用智能标签创建（会自动创建新标签或标记为待审核）
      await createArticleTagsFromMatch(article.id, matchResult)
      
      // 如果有建议标签但置信度较低，记录日志供管理员查看
      if (matchResult.suggestedTag && matchResult.suggestedTag.confidence < 0.7) {
        console.log('Suggested tag (needs review):', {
          articleId: article.id,
          articleTitle: title,
          suggestedTag: matchResult.suggestedTag.name,
          confidence: matchResult.suggestedTag.confidence,
          reason: matchResult.suggestedTag.reason,
        })
      }
    } else {
      // 如果手动指定了类别，也创建对应的标签
      await createArticleTags(article.id, [categoryId])
    }
    
    return NextResponse.json(article, { status: 201 })
  } catch (error: any) {
    console.error('Error creating article:', {
      error: error?.message || error,
      code: error?.code,
      meta: error?.meta,
    })
    
    // 处理唯一性约束错误
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: '文章标题已存在，请修改标题', details: error?.meta },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create article', details: error?.message || String(error) },
      { status: 500 }
    )
  }
}


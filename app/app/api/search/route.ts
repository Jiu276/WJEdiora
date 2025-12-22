import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const keyword = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')

    if (!keyword.trim()) {
      return NextResponse.json({ articles: [], total: 0, page, limit })
    }

    // 搜索已发布的文章
    const where = {
      status: 'published' as const,
      deletedAt: null,
      OR: [
        { title: { contains: keyword, mode: 'insensitive' as const } },
        { excerpt: { contains: keyword, mode: 'insensitive' as const } },
        { content: { contains: keyword, mode: 'insensitive' as const } },
      ],
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { publishDate: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featuredImage: true,
          publishDate: true,
          categoryId: true,
          author: true,
        },
      }),
      prisma.article.count({ where }),
    ])

    // 获取分类信息
    const categoryIds = articles
      .map((a) => a.categoryId)
      .filter((id): id is string => id !== null)

    const categories =
      categoryIds.length > 0
        ? await prisma.category.findMany({
            where: { id: { in: categoryIds }, deletedAt: null },
            select: { id: true, name: true, slug: true },
          })
        : []

    const categoryMap = new Map(categories.map((c) => [c.id, c]))

    const articlesWithCategory = articles.map((article) => ({
      ...article,
      category: article.categoryId ? categoryMap.get(article.categoryId) || null : null,
      publishDate: article.publishDate?.toISOString() || null,
    }))

    return NextResponse.json({
      articles: articlesWithCategory,
      total,
      page,
      limit,
      keyword,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: '搜索失败' }, { status: 500 })
  }
}


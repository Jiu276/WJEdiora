import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')
    const days = parseInt(searchParams.get('days') || '30') // 最近N天的热门文章

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const articles = await prisma.article.findMany({
      where: {
        status: 'published',
        deletedAt: null,
        publishDate: {
          gte: startDate,
        },
      },
      orderBy: [
        { viewCount: 'desc' },
        { publishDate: 'desc' },
      ],
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        publishDate: true,
        viewCount: true,
        categoryId: true,
        author: true,
      },
    })

    // 获取分类信息
    const categoryIds = articles
      .map((a) => a.categoryId)
      .filter((id): id is string => id !== null)

    const categories = categoryIds.length > 0
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

    return NextResponse.json(articlesWithCategory)
  } catch (error) {
    console.error('Error fetching popular articles:', error)
    return NextResponse.json({ error: '获取热门文章失败' }, { status: 500 })
  }
}


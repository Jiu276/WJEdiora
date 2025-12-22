import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // 获取所有已发布文章使用的标签
    const articles = await prisma.article.findMany({
      where: {
        status: 'published',
        deletedAt: null,
      },
      select: {
        id: true,
      },
    })

    const articleIds = articles.map((a) => a.id)

    // 获取文章标签关联
    const articleTags = articleIds.length > 0
      ? await prisma.articleTag.findMany({
          where: {
            articleId: { in: articleIds },
          },
          select: {
            tag: true,
          },
        })
      : []

    const uniqueTagNames = Array.from(new Set(articleTags.map((at) => at.tag)))

    // 统计每个标签的使用次数
    const tagCounts = new Map<string, number>()
    articleTags.forEach((at) => {
      tagCounts.set(at.tag, (tagCounts.get(at.tag) || 0) + 1)
    })

    // 构建标签列表（tag 字段本身就是标签名称）
    const tagsWithCount = uniqueTagNames
      .map((tagName) => ({
        id: tagName,
        name: tagName,
        slug: tagName.toLowerCase().replace(/\s+/g, '-'),
        count: tagCounts.get(tagName) || 0,
      }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json(tagsWithCount)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json({ error: '获取标签失败' }, { status: 500 })
  }
}


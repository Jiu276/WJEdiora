import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/articles/[id]/tags - 获取文章的标签
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tags = await prisma.articleTag.findMany({
      where: {
        articleId: params.id,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    return NextResponse.json(tags)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}

// POST /api/articles/[id]/tags - 批量创建文章的标签
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { tags } = body // tags 是字符串数组
    
    if (!Array.isArray(tags)) {
      return NextResponse.json(
        { error: 'Tags must be an array' },
        { status: 400 }
      )
    }
    
    // 先删除该文章的所有现有标签（软删除）
    await prisma.articleTag.updateMany({
      where: {
        articleId: params.id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    })
    
    // 创建新的标签记录（去重）
    const uniqueTags = Array.from(new Set(tags.map((tag: string) => tag.trim()).filter(Boolean)))
    
    const createdTags = await Promise.all(
      uniqueTags.map((tag: string) =>
        prisma.articleTag.create({
          data: {
            articleId: params.id,
            tag: tag,
          },
        })
      )
    )
    
    return NextResponse.json(createdTags, { status: 201 })
  } catch (error) {
    console.error('Error creating tags:', error)
    return NextResponse.json(
      { error: 'Failed to create tags' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  generateMetaTitle,
  generateMetaDescription,
  generateMetaKeywords,
} from '@/lib/seo'
import { generateSlug } from '@/lib/slug'

// GET /api/articles/[id] - 获取单个文章
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const article = await prisma.article.findFirst({
      where: {
        id: params.id,
        deletedAt: null,
      },
    })
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(article)
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}

// PUT /api/articles/[id] - 更新文章
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      title,
      content,
      excerpt,
      status,
      categoryId,
      titleId,
      author,
      publishDate,
      featuredImage,
      enableKeywordLinks,
      metaTitle,
      metaDescription,
      metaKeywords,
      createVersion: _createVersion = false, // 版本快照功能暂不使用
    } = body

    // 读取当前文章，供后续自动补全字段使用
    const currentArticle = await prisma.article.findFirst({
      where: { id: params.id, deletedAt: null },
    })
    if (!currentArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }
    
    // 如果标题改变，更新 slug（确保唯一性）
    const slugUpdate: { slug?: string } = {}
    if (title) {
      let baseSlug = generateSlug(title)
      
      // 如果生成的 slug 为空，使用 ID 作为后备
      if (!baseSlug || baseSlug.trim() === '') {
        baseSlug = params.id.substring(0, 36)
      }
      
      let newSlug = baseSlug
      let counter = 1
      
      // 检查 slug 是否唯一（排除当前文章）
      while (true) {
        const existing = await prisma.article.findFirst({
          where: {
            slug: newSlug,
            id: { not: params.id }, // 排除当前文章
            deletedAt: null,
          },
        })
        
        if (!existing) {
          break
        }
        
        newSlug = `${baseSlug}-${counter}`
        counter++
        
        if (counter > 1000) {
          newSlug = `${baseSlug}-${Date.now()}`
          break
        }
      }
      
      slugUpdate.slug = newSlug
    }
    
    // 获取标签和类别信息用于自动生成SEO
    let tags: string[] = []
    let categoryName: string | null = null
    
    const articleTags = await prisma.articleTag.findMany({
      where: {
        articleId: params.id,
        deletedAt: null,
      },
    })
    tags = articleTags.map(t => t.tag)
    
    const finalCategoryId = categoryId !== undefined ? categoryId : currentArticle?.categoryId
    if (finalCategoryId) {
      const category = await prisma.category.findFirst({
        where: { id: finalCategoryId, deletedAt: null },
      })
      categoryName = category?.name || null
    }
    
    // 自动生成SEO元数据（只有在明确提供了自定义值时才使用，否则自动生成）
    const finalTitle = title || currentArticle?.title || ''
    const finalContent = content !== undefined ? content : currentArticle?.content || ''
    const finalExcerpt = excerpt !== undefined ? excerpt : currentArticle?.excerpt || null
    
    const autoMetaTitle = metaTitle !== undefined && metaTitle !== null && metaTitle.trim() 
      ? metaTitle.trim() 
      : generateMetaTitle(finalTitle, null)
    const autoMetaDescription = metaDescription !== undefined && metaDescription !== null && metaDescription.trim()
      ? metaDescription.trim()
      : generateMetaDescription(finalExcerpt, finalContent, null)
    const autoMetaKeywords = metaKeywords !== undefined && metaKeywords !== null && metaKeywords.trim()
      ? metaKeywords.trim()
      : generateMetaKeywords(tags, categoryName, finalTitle, null)
    
    const article = await prisma.article.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...slugUpdate,
        ...(content !== undefined && { content }),
        ...(excerpt !== undefined && { excerpt }),
        ...(status && { status: status as 'draft' | 'published' }),
        ...(categoryId !== undefined && { categoryId }),
        ...(titleId && { titleId }),
        ...(author && { author }),
        ...(publishDate && { publishDate: new Date(publishDate) }),
        // 如果设置为已发布且未传 publishDate，默认当前时间
        ...(status === 'published' && !publishDate && { publishDate: new Date() }),
        ...(featuredImage !== undefined && { featuredImage }),
        ...(enableKeywordLinks !== undefined && { enableKeywordLinks }),
        // 自动生成SEO元数据
        metaTitle: autoMetaTitle,
        metaDescription: autoMetaDescription,
        metaKeywords: autoMetaKeywords,
      },
    })
    
    return NextResponse.json(article)
  } catch (error) {
    console.error('Error updating article:', {
      error: (error as any)?.message || error,
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    })
    return NextResponse.json(
      { error: 'Failed to update article', details: (error as any)?.message || String(error) },
      { status: 500 }
    )
  }
}

// DELETE /api/articles/[id] - 软删除文章
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 物理删除：先清理关联数据
    await prisma.articleImage.deleteMany({ where: { articleId: params.id } })
    await prisma.articleTag.deleteMany({ where: { articleId: params.id } })
    await prisma.articleLink.deleteMany({ where: { articleId: params.id } })
    await prisma.articleCustomDomain.deleteMany({ where: { articleId: params.id } })
    // 版本表暂未启用，若无模型可忽略
    if ((prisma as any).articleVersion) {
      await (prisma as any).articleVersion.deleteMany({ where: { articleId: params.id } })
    }

    const deleted = await prisma.article.deleteMany({
      where: { id: params.id },
    })
    
    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    )
  }
}


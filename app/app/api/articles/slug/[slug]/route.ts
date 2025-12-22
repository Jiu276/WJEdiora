import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  generateMetaTitle,
  generateMetaDescription,
  generateMetaKeywords,
} from '@/lib/seo'

// GET /api/articles/slug/[slug] - 根据 slug 获取文章（前端用）
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const identifier = params.slug
    
    // 最简单的方案：同时支持 ID 和 slug 查找
    // 先尝试按 ID 查找（UUID 格式）
    let article = await prisma.article.findFirst({
      where: {
        OR: [
          { id: identifier },
          { slug: identifier },
        ],
        status: 'published',
        deletedAt: null,
      },
    })
    
    // 如果没找到，尝试 URL 解码后的 slug
    if (!article) {
      try {
        const decodedSlug = decodeURIComponent(identifier)
        if (decodedSlug !== identifier) {
          article = await prisma.article.findFirst({
            where: {
              slug: decodedSlug,
              status: 'published',
              deletedAt: null,
            },
          })
        }
      } catch {
        // 解码失败，忽略
      }
    }
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }
    
    // 获取标签类别信息
    let category = null
    if (article.categoryId) {
      category = await prisma.category.findFirst({
        where: {
          id: article.categoryId,
          deletedAt: null,
        },
      })
    }
    
    // 获取文章标签
    const tags = await prisma.articleTag.findMany({
      where: {
        articleId: article.id,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    // 如果SEO字段为空，自动生成
    if (!article.metaTitle || !article.metaDescription || !article.metaKeywords) {
      const tagNames = tags.map(t => t.tag)
      const categoryName = category?.name || null
      
      if (!article.metaTitle) {
        article.metaTitle = generateMetaTitle(article.title, null)
      }
      if (!article.metaDescription) {
        article.metaDescription = generateMetaDescription(article.excerpt, article.content, null)
      }
      if (!article.metaKeywords) {
        article.metaKeywords = generateMetaKeywords(tagNames, categoryName, article.title, null)
      }
    }
    
    // 获取文章的超链接（用于关键字自动超链接）
    const links = await prisma.articleLink.findMany({
      where: {
        articleId: article.id,
        deletedAt: null,
      },
    })
    
    // 如果启用了关键字自动超链接，处理文章内容
    let processedContent = article.content
    if (article.enableKeywordLinks && links.length > 0) {
      // 对每个关键字进行替换（避免重复替换已存在的链接）
      links.forEach(link => {
        const keyword = link.keyword
        const url = link.url
        // 使用正则表达式匹配关键字，但排除已经在<a>标签中的
        const regex = new RegExp(`(?<!<a[^>]*>)(?<!<[^>]*>)\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b(?![^<]*</a>)`, 'gi')
        processedContent = processedContent.replace(regex, (match) => {
          return `<a href="${url}" target="_blank" rel="noopener noreferrer">${match}</a>`
        })
      })
    }
    
    return NextResponse.json({
      ...article,
      content: processedContent,
      category,
      tags: tags.map(t => t.tag),
    })
  } catch (error) {
    console.error('Error fetching article by slug:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}


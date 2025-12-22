import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/articles/[id]/export - 导出文章为 Markdown 格式
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

    // 获取文章标签
    const tags = await prisma.articleTag.findMany({
      where: {
        articleId: article.id,
        deletedAt: null,
      },
    })

    // 转换为 Markdown 格式
    let markdown = `---\n`
    markdown += `title: ${article.title}\n`
    markdown += `slug: ${article.slug}\n`
    markdown += `status: ${article.status}\n`
    markdown += `author: ${article.author}\n`
    if (article.publishDate) {
      markdown += `publishDate: ${new Date(article.publishDate).toISOString()}\n`
    }
    if (article.excerpt) {
      markdown += `excerpt: ${article.excerpt.replace(/\n/g, ' ')}\n`
    }
    if (article.featuredImage) {
      markdown += `featuredImage: ${article.featuredImage}\n`
    }
    if (tags.length > 0) {
      markdown += `tags: [${tags.map(t => `"${t.tag}"`).join(', ')}]\n`
    }
    if (article.metaTitle) {
      markdown += `metaTitle: ${article.metaTitle}\n`
    }
    if (article.metaDescription) {
      markdown += `metaDescription: ${article.metaDescription}\n`
    }
    if (article.metaKeywords) {
      markdown += `metaKeywords: ${article.metaKeywords}\n`
    }
    markdown += `---\n\n`

    // 转换 HTML 内容为 Markdown（简单转换）
    const content = article.content
      // 移除 HTML 标签（简单处理）
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
      .replace(/<ul[^>]*>/gi, '')
      .replace(/<\/ul>/gi, '\n')
      .replace(/<ol[^>]*>/gi, '')
      .replace(/<\/ol>/gi, '\n')
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '') // 移除剩余的 HTML 标签
      .replace(/\n{3,}/g, '\n\n') // 清理多余的空行

    markdown += content

    // 设置响应头，触发下载
    const filename = `${article.slug || article.id}.md`
    
    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting article:', error)
    return NextResponse.json(
      { error: 'Failed to export article' },
      { status: 500 }
    )
  }
}



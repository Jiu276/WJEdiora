import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateArticle } from '@/lib/spark'
import { normalizeArticleContent } from '@/lib/normalizeArticleContent'

function containsCJK(input: unknown) {
  if (input == null) return false
  const text = String(input)
  return /[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u30FF\uAC00-\uD7AF]/.test(text)
}

// POST /api/generate-article - 生成文章内容（星火API，失败时回退模板）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, categoryId, domains = [], prompt, forceFallback = false } = body
    
    if (!title || !title.trim()) {
      return NextResponse.json({ error: '缺少标题' }, { status: 400 })
    }
    if (containsCJK(title)) {
      return NextResponse.json({ error: '标题必须为英文（不可包含中文字符）' }, { status: 400 })
    }

    // 获取类别信息
    let categoryName = ''
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          deletedAt: null,
        },
      })
      if (category) {
        // If DB category name is Chinese, avoid leaking it into generation prompt.
        categoryName = containsCJK(category.name) ? '' : category.name
      }
    }
    
    const generateContentByCategory = (catName: string, articleTitle: string) => {
      const domainText =
        Array.isArray(domains) && domains.length > 0 ? domains.join(', ') : ''

      return `
        <h2>${articleTitle}</h2>
        <p>${articleTitle} is a topic worth exploring. This article provides a clear, practical overview you can apply immediately.</p>
        <h3>1. Why it matters</h3>
        <p>Understanding ${articleTitle} helps you make better decisions and avoid common pitfalls.</p>
        <h3>2. Step-by-step approach</h3>
        <p>${domainText ? `In ${domainText}, ` : ''}start with the basics, validate assumptions quickly, and iterate with measurable improvements.</p>
        <h3>3. Common mistakes to avoid</h3>
        <p>Keep the process simple, focus on outcomes, and document what you learn so you can improve faster.</p>
        <h3>4. Summary</h3>
        <p>${articleTitle} is best mastered through practice. Use this as a starting point and refine your approach over time.</p>
      `
    }

    // 优先使用星火 API
    if (forceFallback) {
      const articleContent = normalizeArticleContent(
        generateContentByCategory(categoryName, title),
      )
      if (containsCJK(articleContent)) {
        return NextResponse.json(
          { error: '生成内容包含中文字符，请重试（仅英文）' },
          { status: 500 },
        )
      }

      const excerpt = articleContent
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 200)

      return NextResponse.json({ content: articleContent, excerpt })
    }

    try {
      const result = await generateArticle({
        title: title.trim(),
        userPrompt: `${prompt || ''}\n\nIMPORTANT: Output English only. Do not use any Chinese characters.`,
        category: categoryName,
        domains,
      })
      return NextResponse.json({
        ...result,
        content: normalizeArticleContent(result?.content),
        excerpt: normalizeArticleContent(result?.excerpt),
      })
    } catch (err) {
      console.warn('Spark generateArticle failed, fallback to template:', err)
    }

    const articleContent = normalizeArticleContent(
      generateContentByCategory(categoryName, title),
    )
    if (containsCJK(articleContent)) {
      return NextResponse.json({ error: '生成内容包含中文字符，请重试（仅英文）' }, { status: 500 })
    }

    const excerpt = articleContent
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 200)

    return NextResponse.json({ content: articleContent, excerpt })
  } catch (error) {
    console.error('Error generating article:', error)
    return NextResponse.json(
      { error: 'Failed to generate article' },
      { status: 500 }
    )
  }
}


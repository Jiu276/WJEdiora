import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/init-data - 初始化数据库预设数据
export async function POST(_request: NextRequest) {
  try {
    // 检查 Prisma Client 是否可用
    if (!prisma || !prisma.category) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 503 }
      )
    }

    const results = {
      categories: 0,
      articleTitles: 0,
      themes: 0,
    }

    // 1. 插入默认标签类别
    const categories = [
      { id: '1', name: '生活', slug: 'life', description: '生活相关文章' },
      { id: '2', name: '旅游', slug: 'travel', description: '旅游相关文章' },
      { id: '3', name: '科技', slug: 'tech', description: '科技相关文章' },
      { id: '4', name: '美食', slug: 'food', description: '美食相关文章' },
      { id: '5', name: '健康', slug: 'health', description: '健康相关文章' },
      { id: '6', name: '教育', slug: 'education', description: '教育相关文章' },
      { id: '7', name: '娱乐', slug: 'entertainment', description: '娱乐相关文章' },
      { id: '8', name: '财经', slug: 'finance', description: '财经相关文章' },
      { id: '9', name: '体育', slug: 'sports', description: '体育相关文章' },
      { id: '10', name: '时尚', slug: 'fashion', description: '时尚相关文章' },
    ]

    for (const cat of categories) {
      try {
        await prisma.category.upsert({
          where: { id: cat.id },
          update: { 
            name: cat.name, 
            slug: cat.slug, 
            description: cat.description,
            updatedAt: new Date(),
          },
          create: {
            ...cat,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
        results.categories++
      } catch (error) {
        console.error(`Error upserting category ${cat.id}:`, error)
      }
    }

    // 2. 插入默认文章标题
    const articleTitles = [
      { id: '1', name: '默认标题', slug: 'default-title', description: '默认文章标题' },
      { id: '2', name: '标准标题', slug: 'standard-title', description: '标准文章标题' },
    ]

    for (const title of articleTitles) {
      try {
        await prisma.articleTitle.upsert({
          where: { id: title.id },
          update: { 
            name: title.name, 
            slug: title.slug, 
            description: title.description,
            updatedAt: new Date(),
          },
          create: {
            ...title,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
        results.articleTitles++
      } catch (error) {
        console.error(`Error upserting article title ${title.id}:`, error)
      }
    }

    // 3. 插入默认主题
    const themes = [
      { id: '1', name: '默认主题', slug: 'default', description: '现代简洁风格，适合通用博客', isActive: true },
      { id: '2', name: '深色主题', slug: 'dark', description: '深色主题，护眼舒适', isActive: false },
      { id: '3', name: '简约主题', slug: 'minimal', description: '极简风格，专注内容本身', isActive: false },
      { id: '4', name: '杂志风格', slug: 'magazine', description: '杂志排版风格，适合内容丰富', isActive: false },
      { id: '5', name: '卡片风格', slug: 'card', description: '大卡片风格，视觉冲击力强', isActive: false },
    ]

    for (const theme of themes) {
      try {
        await prisma.theme.upsert({
          where: { id: theme.id },
          update: { 
            name: theme.name, 
            slug: theme.slug, 
            description: theme.description, 
            isActive: theme.isActive,
            updatedAt: new Date(),
          },
          create: {
            ...theme,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
        results.themes++
      } catch (error) {
        console.error(`Error upserting theme ${theme.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: '初始化数据成功',
      results,
    })
  } catch (error: any) {
    console.error('Error initializing data:', error)
    return NextResponse.json(
      { error: 'Failed to initialize data', details: error.message },
      { status: 500 }
    )
  }
}


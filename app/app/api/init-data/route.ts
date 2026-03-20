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
      { id: '1', name: 'Lifestyle', slug: 'life', description: 'Lifestyle articles' },
      { id: '2', name: 'Travel', slug: 'travel', description: 'Travel articles' },
      { id: '3', name: 'Technology', slug: 'tech', description: 'Tech and product updates' },
      { id: '4', name: 'Food', slug: 'food', description: 'Food and recipes' },
      { id: '5', name: 'Health', slug: 'health', description: 'Health and wellness' },
      { id: '6', name: 'Education', slug: 'education', description: 'Learning and education' },
      { id: '7', name: 'Entertainment', slug: 'entertainment', description: 'Movies, music, and culture' },
      { id: '8', name: 'Finance', slug: 'finance', description: 'Finance and business' },
      { id: '9', name: 'Sports', slug: 'sports', description: 'Sports and fitness' },
      { id: '10', name: 'Fashion', slug: 'fashion', description: 'Fashion and style' },
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
      { id: '1', name: 'Default Title', slug: 'default-title', description: 'Default article title' },
      { id: '2', name: 'Standard Title', slug: 'standard-title', description: 'Standard article title' },
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
      { id: '1', name: 'Default Theme', slug: 'default', description: 'Modern and minimal style for a general blog.', isActive: true },
      { id: '2', name: 'Dark Theme', slug: 'dark', description: 'A comfortable dark theme for easy reading.', isActive: false },
      { id: '3', name: 'Minimal Theme', slug: 'minimal', description: 'A minimal layout that keeps attention on the content.', isActive: false },
      { id: '4', name: 'Magazine Theme', slug: 'magazine', description: 'Magazine-style typography for content-rich posts.', isActive: false },
      { id: '5', name: 'Card Theme', slug: 'card', description: 'A bold card-based look with strong visual impact.', isActive: false },
      { id: '6', name: 'Bootstrap Blog', slug: 'bootstrap-blog', description: 'A classic Bootstrap-inspired blog layout.', isActive: false },
      { id: '7', name: 'Comprehensive Theme', slug: 'comprehensive', description: 'A well-structured theme for comprehensive information.', isActive: false },
      { id: '8', name: 'Magazine Multi', slug: 'magazine-multi', description: 'A multi-column magazine layout with higher information density.', isActive: false },
      { id: '9', name: 'Minimal Lifestyle', slug: 'minimal-lifestyle', description: 'A minimal lifestyle-focused presentation.', isActive: false },
      { id: '10', name: 'Travel Blog', slug: 'travel-blog', description: 'A clean and airy layout for travel stories and visuals.', isActive: false },
      { id: '11', name: 'Modern Magazine', slug: 'modern-magazine', description: 'A modern magazine look with layered readability.', isActive: false },
      { id: '12', name: 'Modern Simple', slug: 'modern-simple', description: 'A modern simple design optimized for long reads.', isActive: false },
      { id: '13', name: 'Lifestyle Daily', slug: 'lifestyle-daily', description: 'A lightweight daily lifestyle style for easy reading.', isActive: false },
      { id: '14', name: 'Zen Blog', slug: 'zen-blog', description: 'A calm whitespace-forward style that highlights the content.', isActive: false },
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


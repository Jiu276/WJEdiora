'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { ThemeConfig } from '@/lib/themeLoader'

interface Article {
  id: string
  title: string
  excerpt: string | null
  featuredImage: string | null
  publishDate: string | null
  slug: string
  category?: {
    id: string
    name: string
    slug: string
  } | null
}

// 动态加载主题组件映射
const themeBlogListComponents: Record<string, any> = {
  default: dynamic(() => import('@/themes/default/BlogListTemplate'), { ssr: true }),
  minimal: dynamic(() => import('@/themes/minimal/BlogListTemplate'), { ssr: true }),
  magazine: dynamic(() => import('@/themes/magazine/BlogListTemplate'), { ssr: true }),
  dark: dynamic(() => import('@/themes/dark/BlogListTemplate'), { ssr: true }),
  card: dynamic(() => import('@/themes/card/BlogListTemplate'), { ssr: true }),
  'bootstrap-blog': dynamic(() => import('@/themes/bootstrap-blog/BlogListTemplate'), { ssr: true }),
  comprehensive: dynamic(() => import('@/themes/comprehensive/BlogListTemplate'), { ssr: true }),
  'magazine-multi': dynamic(() => import('@/themes/magazine-multi/BlogListTemplate'), { ssr: true }),
  'minimal-lifestyle': dynamic(() => import('@/themes/minimal-lifestyle/BlogListTemplate'), { ssr: true }),
}

export default function BlogPageClient() {
  const _router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  // Frontend reader site is English-only; force default theme
  const themeSlug = 'default'
  const themeConfig: ThemeConfig | null = null
  const pageSize = 12

  useEffect(() => {
    fetchArticles()
  }, [currentPage])

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/articles?status=published&page=${currentPage}&limit=${pageSize}`)
      const data = await res.json()
      setArticles(data)

      // 获取总数（用于分页）
      const countRes = await fetch('/api/articles?status=published')
      const allArticles = await countRes.json()
      setTotal(allArticles.length)
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 获取对应的主题组件
  const BlogListTemplate = themeBlogListComponents[themeSlug] || themeBlogListComponents.default

  // 如果没有主题配置，使用默认配置
  const config: ThemeConfig = themeConfig || {
    layout: 'boxed' as const,
    colors: {
      primary: '#1890ff',
      accent: '#722ed1',
      background: '#f5f5f5',
      cardBackground: '#ffffff',
      text: '#0f172a',
      subtext: '#475569',
      border: '#e5e7eb',
    },
    fonts: {
      heading: 'inherit',
      body: 'inherit',
    },
    features: {
      showSidebar: false,
      showCategories: true,
      showTags: true,
      showAuthor: true,
      showDate: true,
      showExcerpt: true,
    },
  }

  return (
    <BlogListTemplate
      articles={articles}
      loading={loading}
      currentPage={currentPage}
      total={total}
      pageSize={pageSize}
      onPageChange={handlePageChange}
      config={config}
    />
  )
}


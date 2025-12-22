'use client'

import { useState, useEffect } from 'react'
import { Card, Tag, Typography, Empty, Skeleton } from 'antd'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { ThemeConfig } from '@/lib/themeLoader'

const { Title } = Typography

interface TagItem {
  id: string
  name: string
  slug: string
  count: number
}

// 动态加载主题组件映射（当前未使用，保留以备将来使用）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _themeArchiveComponents: Record<string, React.ComponentType<any>> = {
  default: dynamic(() => import('@/themes/default/ArchiveTemplate'), { ssr: true }),
  minimal: dynamic(() => import('@/themes/minimal/ArchiveTemplate'), { ssr: true }),
  magazine: dynamic(() => import('@/themes/magazine/ArchiveTemplate'), { ssr: true }),
  dark: dynamic(() => import('@/themes/dark/ArchiveTemplate'), { ssr: true }),
  card: dynamic(() => import('@/themes/card/ArchiveTemplate'), { ssr: true }),
  'bootstrap-blog': dynamic(() => import('@/themes/bootstrap-blog/ArchiveTemplate'), { ssr: true }),
  comprehensive: dynamic(() => import('@/themes/comprehensive/ArchiveTemplate'), { ssr: true }),
  'magazine-multi': dynamic(() => import('@/themes/magazine-multi/ArchiveTemplate'), { ssr: true }),
  'minimal-lifestyle': dynamic(() => import('@/themes/minimal-lifestyle/ArchiveTemplate'), { ssr: true }),
}

export default function TagsPage() {
  const [tags, setTags] = useState<TagItem[]>([])
  const [loading, setLoading] = useState(true)
  const [, setThemeSlug] = useState('default')
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null)

  useEffect(() => {
    fetchTheme()
    fetchTags()
  }, [])

  const fetchTheme = async () => {
    try {
      const res = await fetch('/api/theme/active', { cache: 'no-store' })
      if (res.ok) {
        const activeTheme = await res.json()
        if (activeTheme) {
          setThemeSlug(activeTheme.slug)
          setThemeConfig(activeTheme.config || null)
        }
      }
    } catch (error) {
      console.error('Error fetching theme:', error)
    }
  }

  const fetchTags = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tags')
      if (res.ok) {
        const data = await res.json()
        setTags(data)
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    } finally {
      setLoading(false)
    }
  }

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

  // 根据使用次数计算标签大小
  const getTagSize = (count: number, maxCount: number) => {
    if (maxCount === 0) return 14
    const ratio = count / maxCount
    if (ratio > 0.7) return 24
    if (ratio > 0.4) return 20
    if (ratio > 0.2) return 16
    return 14
  }

  const maxCount = tags.length > 0 ? Math.max(...tags.map((t) => t.count)) : 0

  return (
    <div style={{ minHeight: '100vh', background: config.colors.background }}>
      {/* Header */}
      <div
        style={{
          background: config.colors.cardBackground,
          borderBottom: `1px solid ${config.colors.border}`,
          padding: '16px 0',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Link href="/" style={{ fontSize: '20px', fontWeight: 'bold', color: config.colors.primary, textDecoration: 'none' }}>
            Ediora
          </Link>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Link href="/blog" style={{ color: config.colors.subtext, textDecoration: 'none', fontSize: '14px' }}>
              Articles
            </Link>
            <Link href="/archive" style={{ color: config.colors.subtext, textDecoration: 'none', fontSize: '14px' }}>
              Archive
            </Link>
            <Link href="/tags" style={{ color: config.colors.primary, textDecoration: 'none', fontSize: '14px' }}>
              Tags
            </Link>
            <Link href="/admin" style={{ color: config.colors.subtext, textDecoration: 'none', fontSize: '14px' }}>
              Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
        <Title level={1} style={{ textAlign: 'center', marginBottom: 48, color: config.colors.text, fontSize: 'clamp(24px, 5vw, 32px)' }}>
          Tag Cloud
        </Title>

        {loading ? (
          <Card style={{ background: config.colors.cardBackground, borderColor: config.colors.border }}>
            <Skeleton active paragraph={{ rows: 10 }} />
          </Card>
        ) : tags.length === 0 ? (
          <Empty description="No tags yet" />
        ) : (
          <Card
            style={{
              background: config.colors.cardBackground,
              borderColor: config.colors.border,
              minHeight: 300,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px',
              }}
            >
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/blog?tag=${tag.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Tag
                    color={config.colors.primary}
                    style={{
                      fontSize: getTagSize(tag.count, maxCount),
                      padding: '8px 16px',
                      margin: 0,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    {tag.name} ({tag.count})
                  </Tag>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* 页脚 */}
      <div
        style={{
          textAlign: 'center',
          padding: '48px 24px',
          color: config.colors.subtext,
          background: config.colors.cardBackground,
          marginTop: 48,
        }}
      >
        <p>© {new Date().getFullYear()} Ediora. All rights reserved.</p>
      </div>
    </div>
  )
}


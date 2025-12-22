'use client'

import { Card, List, Typography, Tag, Space, Skeleton } from 'antd'
import { FireOutlined, EyeOutlined, CalendarOutlined } from '@ant-design/icons'
import Link from 'next/link'
import LazyImage from '@/components/LazyImage'
import type { ThemeConfig } from '@/lib/themeLoader'

const { Title } = Typography

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featuredImage: string | null
  publishDate: string | null
  viewCount: number
  category?: {
    id: string
    name: string
    slug: string
  } | null
}

interface PopularArticlesProps {
  articles: Article[]
  loading?: boolean
  config: ThemeConfig
  title?: string
}

export default function PopularArticles({
  articles,
  loading = false,
  config,
  title = 'Popular Articles',
}: PopularArticlesProps) {
  if (loading) {
    return (
      <Card
        title={
          <Space>
            <FireOutlined />
            <span>{title}</span>
          </Space>
        }
        style={{
          background: config.colors.cardBackground,
          borderColor: config.colors.border,
        }}
      >
        <Skeleton active paragraph={{ rows: 5 }} />
      </Card>
    )
  }

  if (articles.length === 0) {
    return null
  }

  return (
    <Card
      title={
        <Space>
          <FireOutlined style={{ color: config.colors.primary }} />
          <span style={{ color: config.colors.text }}>{title}</span>
        </Space>
      }
      style={{
        background: config.colors.cardBackground,
        borderColor: config.colors.border,
      }}
    >
      <List
        dataSource={articles}
        renderItem={(article, index) => (
          <List.Item
            style={{
              padding: '12px 0',
              borderBottom: index < articles.length - 1 ? `1px solid ${config.colors.border}` : 'none',
            }}
          >
            <Link
              href={`/blog/${article.slug || article.id}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'flex', width: '100%', gap: 12 }}
            >
              {article.featuredImage && (
                <LazyImage
                  src={article.featuredImage}
                  alt={article.title}
                  style={{
                    width: 80,
                    height: 60,
                    objectFit: 'cover',
                    borderRadius: 4,
                    flexShrink: 0,
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <Title
                  level={5}
                  style={{
                    margin: 0,
                    marginBottom: 4,
                    color: config.colors.text,
                    fontSize: 14,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {article.title}
                </Title>
                <Space size="small" style={{ fontSize: 12, color: config.colors.subtext }}>
                  {article.viewCount > 0 && (
                    <span>
                      <EyeOutlined style={{ marginRight: 4 }} />
                      {article.viewCount}
                    </span>
                  )}
                  {article.publishDate && (
                    <span>
                      <CalendarOutlined style={{ marginRight: 4 }} />
                      {new Date(article.publishDate).toLocaleDateString('en-US')}
                    </span>
                  )}
                  {article.category && (
                    <Tag color={config.colors.primary} style={{ fontSize: 11, margin: 0 }}>
                      {article.category.name}
                    </Tag>
                  )}
                </Space>
              </div>
            </Link>
          </List.Item>
        )}
      />
    </Card>
  )
}


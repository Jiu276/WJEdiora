'use client'

import { Card, Row, Col, Typography, Empty, Skeleton, Pagination, Tag, Space, Input } from 'antd'
import { CalendarOutlined, FolderOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons'
import Link from 'next/link'
import LazyImage from '@/components/LazyImage'
import BackToTop from '@/components/BackToTop'
import type { ThemeConfig } from '@/lib/themeLoader'

const { Title, Paragraph } = Typography
const { Search } = Input

interface Article {
  id: string
  title: string
  excerpt: string | null
  slug: string
  featuredImage: string | null
  publishDate: string | null
  category?: {
    id: string
    name: string
    slug: string
  } | null
  author: string
  viewCount?: number
}

interface BlogListTemplateProps {
  articles: Article[]
  loading: boolean
  currentPage: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  config: ThemeConfig
}

export default function BlogListTemplate({
  articles,
  loading,
  currentPage,
  total,
  pageSize,
  onPageChange,
  config,
}: BlogListTemplateProps) {
  const handleSearch = (value: string) => {
    window.location.href = `/search?q=${encodeURIComponent(value)}`
  }

  return (
    <div style={{ minHeight: '100vh', background: config.colors.background }}>
      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: config.colors.cardBackground,
          borderBottom: `1px solid ${config.colors.border}`,
          padding: '20px 0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '28px', fontWeight: 'bold', color: config.colors.primary, textDecoration: 'none' }}>
            Ediora
          </Link>
          <nav style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <Link href="/" style={{ color: config.colors.text, textDecoration: 'none', fontSize: '15px' }}>Home</Link>
            <Link href="/blog" style={{ color: config.colors.primary, textDecoration: 'none', fontSize: '15px', fontWeight: 500 }}>Articles</Link>
            <Link href="/archive" style={{ color: config.colors.text, textDecoration: 'none', fontSize: '15px' }}>Archive</Link>
            <Search
              placeholder="Search articles..."
              onSearch={handleSearch}
              style={{ width: 250 }}
              allowClear
              prefix={<SearchOutlined />}
            />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <Title level={1} style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 'bold', marginBottom: 16, color: config.colors.text }}>
            Articles
          </Title>
          <Paragraph style={{ fontSize: '16px', color: config.colors.subtext }}>
            Browse all published articles and discover great content.
          </Paragraph>
        </div>

        {loading ? (
          <Row gutter={[24, 24]}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Col xs={24} sm={12} lg={8} key={i}>
                <Skeleton.Image active style={{ width: '100%', height: 200 }} />
                <Skeleton active paragraph={{ rows: 3 }} style={{ marginTop: 16 }} />
              </Col>
            ))}
          </Row>
        ) : articles.length === 0 ? (
          <Empty description="No published articles yet" />
        ) : (
          <>
            <Row gutter={[24, 24]}>
              {articles.map((article, index) => (
                <Col xs={24} sm={12} lg={8} key={article.id}>
                  <Link href={`/blog/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Card
                      hoverable
                      className="fade-in"
                      style={{
                        height: '100%',
                        borderRadius: 12,
                        overflow: 'hidden',
                        border: `1px solid ${config.colors.border}`,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        transition: 'all 0.3s ease',
                        animationDelay: `${index * 0.05}s`,
                      }}
                      bodyStyle={{ padding: 0 }}
                      cover={
                        article.featuredImage ? (
                          <div 
                            className="image-container"
                            style={{ height: 200, overflow: 'hidden' }}
                          >
                            <LazyImage
                              src={article.featuredImage}
                              alt={article.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        ) : (
                          <div
                            style={{
                              height: 200,
                              background: `linear-gradient(135deg, ${config.colors.primary}20, ${config.colors.accent}20)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: config.colors.primary,
                              fontSize: 36,
                              fontWeight: 700,
                            }}
                          >
                            {article.title.charAt(0)}
                          </div>
                        )
                      }
                    >
                      <div style={{ padding: 24 }}>
                        {article.category && (
                          <Tag
                            icon={<FolderOutlined />}
                            color={config.colors.primary}
                            style={{ marginBottom: 12, fontSize: 11 }}
                          >
                            {article.category.name}
                          </Tag>
                        )}
                        <Title
                          level={4}
                          style={{
                            marginBottom: 12,
                            fontSize: 18,
                            fontWeight: 'bold',
                            color: config.colors.text,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            minHeight: 54,
                            lineHeight: 1.4,
                          }}
                        >
                          {article.title}
                        </Title>
                        <Paragraph
                          style={{
                            color: config.colors.subtext,
                            fontSize: 14,
                            lineHeight: 1.6,
                            marginBottom: 16,
                            minHeight: 44,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {article.excerpt
                            ? article.excerpt.replace(/<[^>]*>/g, '').substring(0, 80) + '...'
                            : 'Read more...'}
                        </Paragraph>
                        <Space size="small" style={{ fontSize: 12, color: config.colors.subtext }}>
                          <span><CalendarOutlined style={{ marginRight: 4 }} />{article.publishDate ? new Date(article.publishDate).toLocaleDateString('en-US') : ''}</span>
                          {article.viewCount !== undefined && (
                            <span><EyeOutlined style={{ marginRight: 4 }} />{article.viewCount}</span>
                          )}
                        </Space>
                      </div>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
            <div style={{ marginTop: 40, textAlign: 'center' }}>
              <Pagination
                current={currentPage}
                total={total}
                pageSize={pageSize}
                onChange={onPageChange}
                showSizeChanger={false}
                showQuickJumper
              />
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{ background: config.colors.text, color: '#fff', padding: '60px 24px 20px', marginTop: 80 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: 0 }}>
            © {new Date().getFullYear()} Ediora. All rights reserved.
          </p>
        </div>
      </footer>

      <BackToTop color={config.colors.primary} />
    </div>
  )
}


'use client'

import { Card, Row, Col, Typography, Empty, Skeleton, Pagination, Tag, Space } from 'antd'
import { CalendarOutlined, FolderOutlined } from '@ant-design/icons'
import Link from 'next/link'
import LazyImage from '@/components/LazyImage'
import BackToTop from '@/components/BackToTop'
import type { ThemeConfig } from '@/lib/themeLoader'

const { Title, Paragraph } = Typography

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
            <Link href="/blog" style={{ color: config.colors.primary, textDecoration: 'none', fontSize: '14px' }}>
              Articles
            </Link>
            <Link href="/archive" style={{ color: config.colors.subtext, textDecoration: 'none', fontSize: '14px' }}>
              Archive
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
          Articles
        </Title>

        {loading ? (
          <Row gutter={[16, 16]}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Col xs={24} sm={12} lg={8} key={i}>
                <Card style={{ background: config.colors.cardBackground, borderColor: config.colors.border }}>
                  <Skeleton.Image active style={{ width: '100%', height: 200 }} />
                  <Skeleton active paragraph={{ rows: 2 }} />
                </Card>
              </Col>
            ))}
          </Row>
        ) : articles.length === 0 ? (
          <Empty description="No published articles" />
        ) : (
          <Row gutter={[16, 16]}>
            {articles.map((article) => (
              <Col xs={24} sm={12} lg={8} key={article.id}>
                <Link
                  href={`/blog/${article.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Card
                    hoverable
                    style={{
                      height: '100%',
                      borderRadius: 8,
                      background: config.colors.cardBackground,
                      borderColor: config.colors.border,
                    }}
                    cover={
                      article.featuredImage ? (
                        <LazyImage
                          src={article.featuredImage}
                          alt={article.title}
                          style={{ width: '100%', height: 200, objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: 200,
                            background: `linear-gradient(135deg, ${config.colors.primary} 0%, ${config.colors.accent} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '16px',
                          }}
                        >
                          {article.title.charAt(0)}
                        </div>
                      )
                    }
                  >
                    <Card.Meta
                      title={
                        <Title level={4} style={{ marginBottom: 8, color: config.colors.text }}>
                          {article.title}
                        </Title>
                      }
                      description={
                        <div>
                          <Paragraph
                            ellipsis={{ rows: 2 }}
                            style={{ marginBottom: 8, color: config.colors.subtext }}
                          >
                            {article.excerpt
                              ? article.excerpt.replace(/<[^>]*>/g, '').substring(0, 100) + '...'
                              : 'No excerpt'}
                          </Paragraph>
                          <Space size="small">
                            {article.category && (
                              <Tag icon={<FolderOutlined />} color={config.colors.primary}>
                                {article.category.name}
                              </Tag>
                            )}
                            {article.publishDate && (
                              <Tag icon={<CalendarOutlined />} color="default">
                              {new Date(article.publishDate).toLocaleDateString('en-US')}
                              </Tag>
                            )}
                          </Space>
                        </div>
                      }
                    />
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        )}

        {/* 分页 */}
        {total > pageSize && (
          <div style={{ marginTop: 48, textAlign: 'center' }}>
            <Pagination
              current={currentPage}
              total={total}
              pageSize={pageSize}
              onChange={(page) => {
                onPageChange(page)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              showSizeChanger={false}
              showTotal={(total) => `Total ${total} articles`}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: 'center',
          padding: '48px 24px',
          color: config.colors.subtext,
          background: config.colors.cardBackground,
          marginTop: 48,
        }}
      >
        <p>© 2025 Ediora. All rights reserved.</p>
      </div>

      <BackToTop color={config.colors.primary} />
    </div>
  )
}


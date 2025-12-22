'use client'

import { Card, Row, Col, Typography, Empty, Skeleton, Pagination, Tag, Space } from 'antd'
import { CalendarOutlined, FolderOutlined, MoonOutlined } from '@ant-design/icons'
import Link from 'next/link'
import LazyImage from '@/components/LazyImage'
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

export default function DarkBlogListTemplate({
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
      {/* 深色主题头部 */}
      <header
        style={{
          background: config.colors.cardBackground,
          borderBottom: `1px solid ${config.colors.border}`,
          padding: '20px 0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Space>
                <MoonOutlined style={{ color: config.colors.primary, fontSize: 24 }} />
                <Title level={3} style={{ margin: 0, color: config.colors.text }}>
                  Ediora
                </Title>
              </Space>
            </Link>
            <div>
              <Link href="/blog" style={{ marginRight: 24, color: config.colors.text, textDecoration: 'none' }}>
                文章列表
              </Link>
              <Link href="/archive" style={{ marginRight: 24, color: config.colors.subtext, textDecoration: 'none' }}>
                归档
              </Link>
              <Link href="/admin" style={{ color: config.colors.subtext, textDecoration: 'none' }}>
                管理后台
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
        <Title level={1} style={{ textAlign: 'center', marginBottom: 48, color: config.colors.text }}>
          文章列表
        </Title>

        {loading ? (
          <Row gutter={[24, 24]}>
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
          <Empty description="暂无已发布的文章" />
        ) : (
          <Row gutter={[24, 24]}>
            {articles.map((article) => (
              <Col xs={24} sm={12} lg={8} key={article.id}>
                <Link href={`/blog/${article.id}`} style={{ textDecoration: 'none' }}>
                  <Card
                    hoverable
                    style={{
                      height: '100%',
                      borderRadius: 12,
                      overflow: 'hidden',
                      background: config.colors.cardBackground,
                      borderColor: config.colors.border,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    }}
                    cover={
                      article.featuredImage ? (
                        <LazyImage
                          src={article.featuredImage}
                          alt={article.title}
                          style={{
                            width: '100%',
                            height: 200,
                            objectFit: 'cover',
                            filter: 'brightness(0.9)',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            height: 200,
                            background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.accent})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: 48,
                            fontWeight: 600,
                          }}
                        >
                          {article.title.charAt(0)}
                        </div>
                      )
                    }
                  >
                    <Title
                      level={4}
                      style={{
                        marginBottom: 12,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: 64,
                        color: config.colors.text,
                      }}
                    >
                      {article.title}
                    </Title>
                    <Paragraph
                      style={{
                        color: config.colors.subtext,
                        minHeight: 60,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {article.excerpt
                        ? article.excerpt.replace(/<[^>]*>/g, '').substring(0, 120) + '...'
                        : '点击阅读完整文章...'}
                    </Paragraph>
                    <Space size="small" style={{ marginTop: 16 }}>
                      {article.category && (
                        <Tag
                          icon={<FolderOutlined />}
                          color={config.colors.primary}
                          style={{
                            background: `${config.colors.primary}20`,
                            borderColor: config.colors.primary,
                            color: config.colors.primary,
                          }}
                        >
                          {article.category.name}
                        </Tag>
                      )}
                      {article.publishDate && (
                        <Tag
                          icon={<CalendarOutlined />}
                          style={{
                            background: config.colors.background,
                            borderColor: config.colors.border,
                            color: config.colors.subtext,
                          }}
                        >
                          {new Date(article.publishDate).toLocaleDateString('zh-CN')}
                        </Tag>
                      )}
                    </Space>
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
              showTotal={(total) => `共 ${total} 篇文章`}
            />
          </div>
        )}
      </div>

      {/* 页脚 */}
      <footer
        style={{
          background: config.colors.cardBackground,
          borderTop: `1px solid ${config.colors.border}`,
          padding: '32px 0',
          marginTop: 64,
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <Paragraph style={{ color: config.colors.subtext, margin: 0 }}>
            © {new Date().getFullYear()} Ediora. All rights reserved.
          </Paragraph>
        </div>
      </footer>
    </div>
  )
}


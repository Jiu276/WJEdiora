'use client'

import { Card, Row, Col, Typography, Empty, Skeleton, Pagination, Tag, Space } from 'antd'
import { CalendarOutlined, FolderOutlined } from '@ant-design/icons'
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

export default function CardBlogListTemplate({
  articles,
  loading,
  currentPage,
  total,
  pageSize,
  onPageChange,
  config,
}: BlogListTemplateProps) {
  return (
    <div style={{ minHeight: '100vh', background: config.colors.background, padding: '24px' }}>
      {/* 头部导航 */}
      <header
        style={{
          background: config.colors.cardBackground,
          borderRadius: 16,
          padding: '20px 32px',
          marginBottom: 32,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Title level={2} style={{ margin: 0, color: config.colors.primary, fontWeight: 700 }}>
                Ediora
              </Title>
            </Link>
            <div>
              <Link href="/blog" style={{ marginRight: 24, color: config.colors.text, textDecoration: 'none', fontWeight: 500 }}>
                文章列表
              </Link>
              <Link href="/archive" style={{ marginRight: 24, color: config.colors.subtext, textDecoration: 'none' }}>
                归档
              </Link>
              <Link href="/admin" style={{ color: config.colors.subtext, textDecoration: 'none' }}>
                管理
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <Title level={1} style={{ textAlign: 'center', marginBottom: 48, color: config.colors.text }}>
          文章列表
        </Title>

        {loading ? (
          <Row gutter={[32, 32]}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Col xs={24} sm={12} lg={8} key={i}>
                <Card style={{ background: config.colors.cardBackground, borderRadius: 20, border: 'none' }}>
                  <Skeleton.Image active style={{ width: '100%', height: 280 }} />
                  <Skeleton active paragraph={{ rows: 3 }} />
                </Card>
              </Col>
            ))}
          </Row>
        ) : articles.length === 0 ? (
          <Empty description="暂无已发布的文章" />
        ) : (
          <Row gutter={[32, 32]}>
            {articles.map((article) => (
              <Col xs={24} sm={12} lg={8} key={article.id}>
                <Link href={`/blog/${article.id}`} style={{ textDecoration: 'none' }}>
                  <Card
                    hoverable
                    style={{
                      height: '100%',
                      borderRadius: 20,
                      overflow: 'hidden',
                      background: config.colors.cardBackground,
                      border: 'none',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      transition: 'all 0.3s ease',
                    }}
                    bodyStyle={{ padding: 0 }}
                    cover={
                      article.featuredImage ? (
                        <LazyImage
                          src={article.featuredImage}
                          alt={article.title}
                          style={{
                            width: '100%',
                            height: 280,
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            height: 280,
                            background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.accent})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: 64,
                            fontWeight: 700,
                          }}
                        >
                          {article.title.charAt(0)}
                        </div>
                      )
                    }
                  >
                    <div style={{ padding: '24px' }}>
                      <Space size="small" style={{ marginBottom: 12 }}>
                        {article.category && (
                          <Tag
                            icon={<FolderOutlined />}
                            color={config.colors.primary}
                            style={{
                              borderRadius: 20,
                              padding: '4px 12px',
                              fontSize: 12,
                              fontWeight: 500,
                            }}
                          >
                            {article.category.name}
                          </Tag>
                        )}
                        {article.publishDate && (
                          <Tag
                            icon={<CalendarOutlined />}
                            style={{
                              borderRadius: 20,
                              padding: '4px 12px',
                              fontSize: 12,
                              background: config.colors.background,
                              borderColor: config.colors.border,
                              color: config.colors.subtext,
                            }}
                          >
                            {new Date(article.publishDate).toLocaleDateString('zh-CN')}
                          </Tag>
                        )}
                      </Space>
                      <Title
                        level={3}
                        style={{
                          marginBottom: 12,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: 64,
                          color: config.colors.text,
                          fontSize: 22,
                          fontWeight: 600,
                          lineHeight: 1.3,
                        }}
                      >
                        {article.title}
                      </Title>
                      <Paragraph
                        style={{
                          color: config.colors.subtext,
                          minHeight: 72,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          fontSize: 15,
                          lineHeight: 1.6,
                        }}
                      >
                        {article.excerpt
                          ? article.excerpt.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
                          : '点击阅读完整文章，获取更多精彩内容...'}
                      </Paragraph>
                    </div>
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
          borderRadius: 16,
          padding: '40px 0',
          marginTop: 64,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px', textAlign: 'center' }}>
          <Paragraph style={{ color: config.colors.subtext, margin: 0, fontSize: 15 }}>
            © {new Date().getFullYear()} Ediora. All rights reserved.
          </Paragraph>
        </div>
      </footer>
    </div>
  )
}


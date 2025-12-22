'use client'

import { Card, Row, Col, Typography, Empty, Skeleton, Pagination, Tag, Space } from 'antd'
import { CalendarOutlined, FolderOutlined, FireOutlined } from '@ant-design/icons'
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

export default function MagazineBlogListTemplate({
  articles,
  loading,
  currentPage,
  total,
  pageSize,
  onPageChange,
  config,
}: BlogListTemplateProps) {
  // 杂志风格：第一篇文章大图展示
  const featuredArticle = articles[0]
  const otherArticles = articles.slice(1)

  return (
    <div style={{ minHeight: '100vh', background: config.colors.background }}>
      {/* 头部导航 */}
      <header
        style={{
          background: config.colors.cardBackground,
          borderBottom: `2px solid ${config.colors.primary}`,
          padding: '20px 0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
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
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px' }}>
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
          <>
            {/* 特色文章 - 大图展示 */}
            {featuredArticle && (
              <div style={{ marginBottom: 60 }}>
                <Link href={`/blog/${featuredArticle.id}`} style={{ textDecoration: 'none' }}>
                  <Card
                    hoverable
                    style={{
                      borderRadius: 12,
                      overflow: 'hidden',
                      border: 'none',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      background: config.colors.cardBackground,
                    }}
                    cover={
                      featuredArticle.featuredImage ? (
                        <LazyImage
                          src={featuredArticle.featuredImage}
                          alt={featuredArticle.title}
                          style={{ width: '100%', height: 400, objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            height: 400,
                            background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.accent})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: 64,
                            fontWeight: 700,
                          }}
                        >
                          {featuredArticle.title.charAt(0)}
                        </div>
                      )
                    }
                  >
                    <div style={{ padding: '24px' }}>
                      <Space style={{ marginBottom: 12 }}>
                        <Tag icon={<FireOutlined />} color={config.colors.primary} style={{ fontSize: 12 }}>
                          精选
                        </Tag>
                        {featuredArticle.category && (
                          <Tag icon={<FolderOutlined />} color="default">
                            {featuredArticle.category.name}
                          </Tag>
                        )}
                      </Space>
                      <Title
                        level={1}
                        style={{
                          marginBottom: 16,
                          color: config.colors.text,
                          fontSize: 36,
                          fontWeight: 700,
                          lineHeight: 1.2,
                        }}
                      >
                        {featuredArticle.title}
                      </Title>
                      {featuredArticle.excerpt && (
                        <Paragraph
                          style={{
                            color: config.colors.subtext,
                            fontSize: 18,
                            lineHeight: 1.6,
                            marginBottom: 16,
                          }}
                        >
                          {featuredArticle.excerpt.replace(/<[^>]*>/g, '').substring(0, 150)}...
                        </Paragraph>
                      )}
                      <Space>
                        {featuredArticle.publishDate && (
                          <span style={{ color: config.colors.subtext }}>
                            <CalendarOutlined style={{ marginRight: 4 }} />
                            {new Date(featuredArticle.publishDate).toLocaleDateString('zh-CN')}
                          </span>
                        )}
                      </Space>
                    </div>
                  </Card>
                </Link>
              </div>
            )}

            {/* 其他文章 - 网格布局 */}
            {otherArticles.length > 0 && (
              <>
                <Title level={3} style={{ marginBottom: 24, color: config.colors.text }}>
                  更多文章
                </Title>
                <Row gutter={[24, 24]}>
                  {otherArticles.map((article) => (
                    <Col xs={24} sm={12} lg={8} key={article.id}>
                      <Link href={`/blog/${article.id}`} style={{ textDecoration: 'none' }}>
                        <Card
                          hoverable
                          style={{
                            height: '100%',
                            borderRadius: 8,
                            overflow: 'hidden',
                            background: config.colors.cardBackground,
                            borderColor: config.colors.border,
                          }}
                          cover={
                            article.featuredImage ? (
                              <LazyImage
                                src={article.featuredImage}
                                alt={article.title}
                                style={{ width: '100%', height: 180, objectFit: 'cover' }}
                              />
                            ) : (
                              <div
                                style={{
                                  height: 180,
                                  background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.accent})`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#fff',
                                  fontSize: 32,
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
                              minHeight: 56,
                              color: config.colors.text,
                              fontSize: 18,
                            }}
                          >
                            {article.title}
                          </Title>
                          <Paragraph
                            style={{
                              color: config.colors.subtext,
                              minHeight: 48,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              fontSize: 14,
                            }}
                          >
                            {article.excerpt
                              ? article.excerpt.replace(/<[^>]*>/g, '').substring(0, 80) + '...'
                              : '点击阅读...'}
                          </Paragraph>
                          <Space size="small" style={{ marginTop: 12 }}>
                            {article.category && (
                              <Tag icon={<FolderOutlined />} color={config.colors.primary} style={{ fontSize: 12 }}>
                                {article.category.name}
                              </Tag>
                            )}
                            {article.publishDate && (
                              <Tag icon={<CalendarOutlined />} color="default" style={{ fontSize: 12 }}>
                                {new Date(article.publishDate).toLocaleDateString('zh-CN')}
                              </Tag>
                            )}
                          </Space>
                        </Card>
                      </Link>
                    </Col>
                  ))}
                </Row>
              </>
            )}
          </>
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
          borderTop: `2px solid ${config.colors.primary}`,
          padding: '40px 0',
          marginTop: 80,
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <Paragraph style={{ color: config.colors.subtext, margin: 0, fontSize: 14 }}>
            © {new Date().getFullYear()} Ediora. All rights reserved.
          </Paragraph>
        </div>
      </footer>
    </div>
  )
}


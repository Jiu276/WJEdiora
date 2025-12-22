'use client'

import { Card, Col, Row, Space, Tag, Typography, Input, Button } from 'antd'
import { SearchOutlined, CalendarOutlined, FolderOutlined } from '@ant-design/icons'
import Link from 'next/link'
import LazyImage from '@/components/LazyImage'
import BackToTop from '@/components/BackToTop'
import type { ThemeConfig } from '@/lib/themeLoader'

const { Title, Paragraph, Text } = Typography
const { Search } = Input

interface Article {
  id: string
  title: string
  excerpt: string | null
  slug: string
  featuredImage: string | null
  publishDate: string | null
  category?: {
    name: string
  } | null
  author: string
}

interface HomeTemplateProps {
  articles: Article[]
  config: ThemeConfig
  searchKeyword?: string
  onSearch?: (keyword: string) => void
}

export default function HomeTemplate({ articles, config, searchKeyword = '', onSearch }: HomeTemplateProps) {
  const handleSearch = (value: string) => {
    if (onSearch) {
      onSearch(value)
    } else {
      window.location.href = `/search?q=${encodeURIComponent(value)}`
    }
  }

  const filteredArticles = searchKeyword
    ? articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          (article.excerpt && article.excerpt.toLowerCase().includes(searchKeyword.toLowerCase()))
      )
    : articles

  return (
    <div style={{ minHeight: '100vh', background: config.colors.background }}>
      {/* Header */}
      <header
        style={{
          background: config.colors.cardBackground,
          borderBottom: `1px solid ${config.colors.border}`,
          padding: '16px 0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Title level={3} style={{ margin: 0, color: config.colors.primary }}>
                  My Blog
                </Title>
              </Link>
            </Col>
            <Col flex="auto" style={{ maxWidth: 400, margin: '0 24px' }}>
              <Search
                placeholder="Search articles..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                value={searchKeyword}
                onChange={(e) => {
                  if (onSearch) onSearch(e.target.value)
                }}
                onSearch={handleSearch}
              />
            </Col>
            <Col>
              <Space>
                <Button type="link" href="/blog" style={{ color: config.colors.text }}>
                  Articles
                </Button>
                <Button type="link" href="/admin" style={{ color: config.colors.text }}>
                  Admin
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Title level={1} style={{ marginBottom: 16, color: config.colors.text }}>
            Welcome to my blog
          </Title>
          <Paragraph style={{ fontSize: 16, color: config.colors.subtext, maxWidth: 600, margin: '0 auto' }}>
            Sharing life, tech, thoughts and inspiration.
          </Paragraph>
        </div>

        {/* Article list */}
        {filteredArticles.length > 0 ? (
          <Row gutter={[24, 24]}>
            {filteredArticles.map((article) => (
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
                      overflow: 'hidden',
                      background: config.colors.cardBackground,
                      borderColor: config.colors.border,
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
                        : 'Read more...'}
                    </Paragraph>
                    <Space size="small" style={{ marginTop: 16 }}>
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
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Title level={3} style={{ color: config.colors.subtext }}>
              {searchKeyword ? 'No articles found' : 'No articles yet'}
            </Title>
            <Paragraph style={{ color: config.colors.subtext }}>
              {searchKeyword ? 'Try another keyword.' : 'Go publish the first article!'}
            </Paragraph>
            {!searchKeyword && (
              <Button type="primary" size="large" href="/admin">
                Publish an article
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
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
            © {new Date().getFullYear()} My Blog · Crafted with care
          </Paragraph>
        </div>
      </footer>

      <BackToTop color={config.colors.primary} />
    </div>
  )
}


'use client'

import { Card, Col, Row, Space, Tag, Typography, Input, Button } from 'antd'
import { SearchOutlined, CalendarOutlined, FolderOutlined } from '@ant-design/icons'
import Link from 'next/link'
import LazyImage from '@/components/LazyImage'
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

export default function CardHomeTemplate({ articles, config, searchKeyword = '', onSearch }: HomeTemplateProps) {
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
          <Row justify="space-between" align="middle">
            <Col>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Title level={2} style={{ margin: 0, color: config.colors.primary, fontWeight: 700 }}>
                  我的博客
                </Title>
              </Link>
            </Col>
            <Col flex="auto" style={{ maxWidth: 500, margin: '0 24px' }}>
              <Search
                placeholder="搜索文章..."
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
                <Button type="link" href="/blog" style={{ color: config.colors.text, fontWeight: 500 }}>
                  所有文章
                </Button>
                <Button type="link" href="/admin" style={{ color: config.colors.text }}>
                  管理
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      </header>

      <main style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* 欢迎区域 */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Title level={1} style={{ marginBottom: 16, color: config.colors.text }}>
            欢迎来到我的博客
          </Title>
          <Paragraph style={{ fontSize: 18, color: config.colors.subtext, maxWidth: 600, margin: '0 auto' }}>
            发现精彩内容，探索无限可能
          </Paragraph>
        </div>

        {/* 大卡片式文章列表 */}
        {filteredArticles.length > 0 ? (
          <Row gutter={[32, 32]}>
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
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Title level={3} style={{ color: config.colors.subtext }}>
              {searchKeyword ? '未找到相关文章' : '暂无文章'}
            </Title>
            <Paragraph style={{ color: config.colors.subtext }}>
              {searchKeyword ? '请尝试其他关键词' : '快去发布第一篇文章吧！'}
            </Paragraph>
          </div>
        )}
      </main>

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
            © {new Date().getFullYear()} 我的博客 · 用心记录生活
          </Paragraph>
        </div>
      </footer>
    </div>
  )
}


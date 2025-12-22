'use client'

import { useState, useEffect } from 'react'
import { Card, Col, Row, Space, Tag, Typography, Input, Button } from 'antd'
import { SearchOutlined, CalendarOutlined, FolderOutlined, FireOutlined } from '@ant-design/icons'
import Link from 'next/link'
import LazyImage from '@/components/LazyImage'
import PopularArticles from '@/components/PopularArticles'
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

export default function MagazineHomeTemplate({ articles, config, searchKeyword = '', onSearch }: HomeTemplateProps) {
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

  // 杂志风格：第一篇文章大图展示
  const featuredArticle = filteredArticles[0]
  const otherArticles = filteredArticles.slice(1)

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

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px' }}>
        <Row gutter={[32, 32]}>
          {/* 主内容区 */}
          <Col xs={24} lg={config.features.showSidebar ? 16 : 24}>
            {/* 特色文章 - 大图展示 */}
            {featuredArticle && !searchKeyword && (
          <div style={{ marginBottom: 60 }}>
            <Link
              href={`/blog/${featuredArticle.id}`}
              style={{ textDecoration: 'none' }}
            >
              <Card
                hoverable
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: 'none',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                }}
                cover={
                  featuredArticle.featuredImage ? (
                    <LazyImage
                      src={featuredArticle.featuredImage}
                      alt={featuredArticle.title}
                      style={{
                        width: '100%',
                        height: 400,
                        objectFit: 'cover',
                      }}
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
                      <Text style={{ color: config.colors.subtext }}>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {new Date(featuredArticle.publishDate).toLocaleDateString('zh-CN')}
                      </Text>
                    )}
                  </Space>
                </div>
              </Card>
            </Link>
          </div>
        )}

        {/* 其他文章 - 网格布局 */}
        {otherArticles.length > 0 ? (
          <>
            <Title level={3} style={{ marginBottom: 24, color: config.colors.text }}>
              {searchKeyword ? '搜索结果' : '最新文章'}
            </Title>
            <Row gutter={[24, 24]}>
              {otherArticles.map((article) => (
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
                              height: 180,
                              objectFit: 'cover',
                            }}
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
        ) : filteredArticles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Title level={3} style={{ color: config.colors.subtext }}>
              {searchKeyword ? '未找到相关文章' : '暂无文章'}
            </Title>
            <Paragraph style={{ color: config.colors.subtext }}>
              {searchKeyword ? '请尝试其他关键词' : '快去发布第一篇文章吧！'}
            </Paragraph>
          </div>
        ) : null}
          </Col>

          {/* 侧边栏 */}
          {config.features.showSidebar && (
            <Col xs={24} lg={8}>
              <MagazineSidebar config={config} />
            </Col>
          )}
        </Row>
      </main>

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
            © {new Date().getFullYear()} 我的博客 · 用心记录生活
          </Paragraph>
        </div>
      </footer>

      <BackToTop color={config.colors.primary} />
    </div>
  )
}

// 杂志主题侧边栏组件
function MagazineSidebar({ config }: { config: ThemeConfig }) {
  const [popularArticles, setPopularArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPopularArticles()
  }, [])

  const fetchPopularArticles = async () => {
    try {
      const res = await fetch('/api/articles/popular?limit=5')
      if (res.ok) {
        const data = await res.json()
        setPopularArticles(data)
      }
    } catch (error) {
      console.error('Error fetching popular articles:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PopularArticles articles={popularArticles} loading={loading} config={config} />
    </div>
  )
}


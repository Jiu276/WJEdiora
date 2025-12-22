'use client'

import { useState } from 'react'
import { Input, Button, Card, Row, Col, Typography, Tag, Space, Divider } from 'antd'
import { SearchOutlined, CalendarOutlined, UserOutlined, EyeOutlined, FolderOutlined, RightOutlined } from '@ant-design/icons'
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
  viewCount?: number
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

  // 特色文章（第一篇作为大图展示）
  const featuredArticle = filteredArticles[0]
  // 其他文章
  const otherArticles = filteredArticles.slice(1, 7)
  // 更多文章
  const moreArticles = filteredArticles.slice(7)

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
            <Link href="/" style={{ color: config.colors.text, textDecoration: 'none', fontSize: '15px', fontWeight: 500 }}>Home</Link>
            <Link href="/blog" style={{ color: config.colors.text, textDecoration: 'none', fontSize: '15px' }}>Articles</Link>
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

      {/* Hero Section - Featured Article */}
      {!searchKeyword && featuredArticle && (
        <section 
          className="fade-in"
          style={{ 
            padding: '60px 24px', 
            background: `linear-gradient(135deg, ${config.colors.primary}15, ${config.colors.accent}15)` 
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Row gutter={[32, 32]} align="middle">
              <Col xs={24} lg={12}>
                {featuredArticle.featuredImage ? (
                  <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                    <LazyImage
                      src={featuredArticle.featuredImage}
                      alt={featuredArticle.title}
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      height: 400,
                      background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.accent})`,
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 48,
                      fontWeight: 700,
                    }}
                  >
                    {featuredArticle.title.charAt(0)}
                  </div>
                )}
              </Col>
              <Col xs={24} lg={12}>
                <div style={{ padding: '0 0 0 24px' }}>
                  {featuredArticle.category && (
                    <Tag color={config.colors.primary} style={{ marginBottom: 16, fontSize: 12, padding: '4px 12px' }}>
                      {featuredArticle.category.name}
                    </Tag>
                  )}
                  <Title
                    level={1}
                    style={{
                      fontSize: 'clamp(28px, 4vw, 42px)',
                      fontWeight: 'bold',
                      marginBottom: 20,
                      color: config.colors.text,
                      lineHeight: 1.3,
                    }}
                  >
                    {featuredArticle.title}
                  </Title>
                  <Paragraph
                    style={{
                      fontSize: '16px',
                      lineHeight: 1.8,
                      color: config.colors.subtext,
                      marginBottom: 24,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {featuredArticle.excerpt
                      ? featuredArticle.excerpt.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
                      : '点击阅读完整内容...'}
                  </Paragraph>
                  <Space size="large" style={{ marginBottom: 24, fontSize: '14px', color: config.colors.subtext }}>
                    <span><UserOutlined style={{ marginRight: 4 }} />{featuredArticle.author}</span>
                    {featuredArticle.publishDate && (
                      <span><CalendarOutlined style={{ marginRight: 4 }} />{new Date(featuredArticle.publishDate).toLocaleDateString('zh-CN')}</span>
                    )}
                    {featuredArticle.viewCount !== undefined && (
                      <span><EyeOutlined style={{ marginRight: 4 }} />{featuredArticle.viewCount}</span>
                    )}
                  </Space>
                  <Link href={`/blog/${featuredArticle.id}`}>
                    <Button
                      type="primary"
                      size="large"
                      style={{
                        background: config.colors.primary,
                        borderColor: config.colors.primary,
                        height: 48,
                        padding: '0 32px',
                        fontSize: 16,
                        fontWeight: 500,
                      }}
                    >
                      阅读全文 <RightOutlined />
                    </Button>
                  </Link>
                </div>
              </Col>
            </Row>
          </div>
        </section>
      )}

      {/* Articles Grid */}
      {otherArticles.length > 0 && (
        <section style={{ padding: '80px 24px', background: config.colors.background }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {!searchKeyword && (
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <Title level={2} style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: 16, color: config.colors.text }}>
                  最新文章
                </Title>
                <Paragraph style={{ fontSize: '16px', color: config.colors.subtext }}>
                  发现精彩内容，探索无限可能
                </Paragraph>
              </div>
            )}
            <Row gutter={[24, 24]}>
              {otherArticles.map((article) => (
                <Col xs={24} sm={12} lg={8} key={article.id}>
                  <Card
                    hoverable
                    onClick={() => window.location.href = `/blog/${article.id}`}
                    className="fade-in"
                    style={{
                      height: '100%',
                      borderRadius: 12,
                      overflow: 'hidden',
                      border: `1px solid ${config.colors.border}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
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
                      <Link href={`/blog/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
                      </Link>
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
                          : '点击阅读更多...'}
                      </Paragraph>
                      <Space size="small" style={{ fontSize: 12, color: config.colors.subtext }}>
                        <span><CalendarOutlined style={{ marginRight: 4 }} />{article.publishDate ? new Date(article.publishDate).toLocaleDateString('zh-CN') : ''}</span>
                        {article.viewCount !== undefined && (
                          <span><EyeOutlined style={{ marginRight: 4 }} />{article.viewCount}</span>
                        )}
                      </Space>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>
      )}

      {/* More Articles List */}
      {moreArticles.length > 0 && (
        <section style={{ padding: '60px 24px', background: config.colors.cardBackground }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Title level={3} style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: 32, color: config.colors.text }}>
              更多文章
            </Title>
            <Row gutter={[24, 16]}>
              {moreArticles.map((article, index) => (
                <Col xs={24} key={article.id}>
                  <Card
                    hoverable
                    onClick={() => window.location.href = `/blog/${article.id}`}
                    className="fade-in"
                    style={{
                      borderRadius: 8,
                      border: `1px solid ${config.colors.border}`,
                      transition: 'all 0.3s ease',
                      animationDelay: `${index * 0.1}s`,
                      cursor: 'pointer',
                    }}
                    bodyStyle={{ padding: 20 }}
                  >
                    <Row gutter={16} align="middle">
                      {article.featuredImage && (
                        <Col xs={24} sm={6}>
                          <div style={{ height: 120, borderRadius: 8, overflow: 'hidden' }}>
                            <LazyImage
                              src={article.featuredImage}
                              alt={article.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        </Col>
                      )}
                      <Col xs={24} sm={article.featuredImage ? 18 : 24}>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                          {article.category && (
                            <Tag
                              icon={<FolderOutlined />}
                              color={config.colors.primary}
                              style={{ marginBottom: 8, fontSize: 11, width: 'fit-content' }}
                            >
                              {article.category.name}
                            </Tag>
                          )}
                          <Link href={`/blog/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Title
                              level={4}
                              style={{
                                margin: 0,
                                marginBottom: 8,
                                fontSize: 18,
                                fontWeight: 'bold',
                                color: config.colors.text,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {article.title}
                            </Title>
                          </Link>
                          <Paragraph
                            style={{
                              color: config.colors.subtext,
                              fontSize: 14,
                              lineHeight: 1.6,
                              marginBottom: 8,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {article.excerpt
                              ? article.excerpt.replace(/<[^>]*>/g, '').substring(0, 100) + '...'
                              : '点击阅读更多...'}
                          </Paragraph>
                          <Space size="middle" style={{ fontSize: 12, color: config.colors.subtext }}>
                            <span><UserOutlined style={{ marginRight: 4 }} />{article.author}</span>
                            {article.publishDate && (
                              <span><CalendarOutlined style={{ marginRight: 4 }} />{new Date(article.publishDate).toLocaleDateString('zh-CN')}</span>
                            )}
                            {article.viewCount !== undefined && (
                              <span><EyeOutlined style={{ marginRight: 4 }} />{article.viewCount}</span>
                            )}
                          </Space>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))}
            </Row>
            {moreArticles.length >= 5 && (
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <Link href="/blog">
                  <Button
                    type="primary"
                    size="large"
                    style={{
                      background: config.colors.primary,
                      borderColor: config.colors.primary,
                      height: 44,
                      padding: '0 40px',
                      fontSize: 15,
                    }}
                  >
                    查看更多文章 <RightOutlined />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{ background: config.colors.text, color: '#fff', padding: '60px 24px 20px', marginTop: 80 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Row gutter={[40, 40]}>
            <Col xs={24} sm={12} md={8}>
              <Title level={4} style={{ color: '#fff', marginBottom: 20, fontSize: 18 }}>
                关于我们
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, fontSize: 14 }}>
                Ediora 是一个综合类博客平台，致力于分享优质内容，探索生活的无限可能。
              </Paragraph>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Title level={4} style={{ color: '#fff', marginBottom: 20, fontSize: 18 }}>
                快速链接
              </Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Link href="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 14 }}>
                  Home
                </Link>
                <Link href="/blog" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 14 }}>
                  Articles
                </Link>
                <Link href="/archive" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 14 }}>
                  Archive
                </Link>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Title level={4} style={{ color: '#fff', marginBottom: 20, fontSize: 18 }}>
                联系方式
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, fontSize: 14 }}>
                Email: info@ediora.com<br />
                关注我们获取最新内容
              </Paragraph>
            </Col>
          </Row>
          <Divider style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '40px 0 20px' }} />
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
            © {new Date().getFullYear()} Ediora. All rights reserved.
          </div>
        </div>
      </footer>

      <BackToTop color={config.colors.primary} />
    </div>
  )
}


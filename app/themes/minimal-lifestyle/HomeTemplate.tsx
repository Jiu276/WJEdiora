'use client'

import { useState } from 'react'
import { Input, Button, Card, Row, Col, Typography, Tag, Space, List } from 'antd'
import { SearchOutlined, CalendarOutlined, UserOutlined, RightOutlined, DownloadOutlined, TwitterOutlined, InstagramOutlined, FacebookOutlined } from '@ant-design/icons'
import Link from 'next/link'
import LazyImage from '@/components/LazyImage'
import BackToTop from '@/components/BackToTop'
import type { ThemeConfig } from '@/lib/themeLoader'

const { Title, Paragraph, Text } = Typography

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

export default function MinimalLifestyleHomeTemplate({ articles, config, searchKeyword = '', onSearch }: HomeTemplateProps) {
  const [email, setEmail] = useState('')

  const handleSearch = (value: string) => {
    if (onSearch) {
      onSearch(value)
    } else {
      window.location.href = `/search?q=${encodeURIComponent(value)}`
    }
  }

  const handleSubscribe = () => {
    // TODO: 实现订阅功能
    alert('订阅功能待实现')
  }

  const filteredArticles = searchKeyword
    ? articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          (article.excerpt && article.excerpt.toLowerCase().includes(searchKeyword.toLowerCase()))
      )
    : articles

  // 最新文章（前3篇用于 Recent News）
  const recentArticles = filteredArticles.slice(0, 3)
  // 热门文章（6篇用于 Popular News）
  const popularArticles = filteredArticles.slice(3, 9)

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7' }}>
      {/* Top Header */}
      <header style={{ background: '#2c2c2c', padding: '16px 0', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 24, height: 24, background: '#d4a574', borderRadius: 4, transform: 'rotate(45deg)' }} />
            <Text strong style={{ fontSize: 18, color: '#fff', letterSpacing: '2px' }}>EDiora</Text>
          </Link>
          <nav style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/blog" style={{ color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>POPULAR NEWS</Link>
            <Link href="/blog" style={{ color: '#fff', textDecoration: 'none', fontSize: '13px' }}>BLOG</Link>
            <Link href="/archive" style={{ color: '#fff', textDecoration: 'none', fontSize: '13px' }}>PAGES</Link>
            <Link href="/admin" style={{ color: '#fff', textDecoration: 'none', fontSize: '13px' }}>CONTACTS</Link>
            <SearchOutlined style={{ color: '#fff', fontSize: 18, cursor: 'pointer' }} onClick={() => handleSearch('')} />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      {!searchKeyword && (
        <section
          style={{
            background: '#f5f3f0',
            padding: '80px 24px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <Row gutter={[48, 48]} align="middle">
              <Col xs={24} lg={12}>
                <div style={{ marginBottom: 32 }}>
                  <Title
                    level={1}
                    style={{
                      fontSize: 'clamp(32px, 5vw, 56px)',
                      fontWeight: 300,
                      color: '#2c2c2c',
                      marginBottom: 32,
                      lineHeight: 1.2,
                      letterSpacing: '-1px',
                    }}
                  >
                    Essential Tips for Happiness and Productivity
                  </Title>
                </div>
                <div style={{ background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <Text strong style={{ fontSize: 14, color: '#2c2c2c', marginBottom: 16, display: 'block' }}>
                    Enter Your E-mail
                  </Text>
                  <Space.Compact style={{ width: '100%', marginBottom: 12 }}>
                    <Input
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      size="large"
                      style={{ borderRadius: '4px 0 0 4px' }}
                    />
                    <Button
                      type="primary"
                      size="large"
                      onClick={handleSubscribe}
                      style={{
                        background: '#d4a574',
                        borderColor: '#d4a574',
                        borderRadius: '0 4px 4px 0',
                        fontWeight: 500,
                      }}
                    >
                      SUBSCRIBE
                    </Button>
                  </Space.Compact>
                  <Text style={{ fontSize: 13, color: '#666' }}>Subscribe to my newsletter to get fresh articles.</Text>
                </div>
              </Col>
              <Col xs={24} lg={12}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 13, color: '#666', fontStyle: 'italic' }}>Check out my latest articles</Text>
                  </div>
                  <div
                    style={{
                      width: 200,
                      height: 200,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      margin: '0 auto',
                      border: '8px solid #fff',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    }}
                  >
                    {filteredArticles[0]?.featuredImage ? (
                      <LazyImage
                        src={filteredArticles[0].featuredImage}
                        alt="Author"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(135deg, #d4a574, #c49564)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: 48,
                        }}
                      >
                        {filteredArticles[0]?.author?.charAt(0) || 'A'}
                      </div>
                    )}
                  </div>
                  <Title level={3} style={{ marginTop: 24, marginBottom: 8, fontSize: 24, fontWeight: 400, color: '#2c2c2c' }}>
                    {filteredArticles[0]?.author || 'Ediora'}
                  </Title>
                  <Text style={{ fontSize: 14, color: '#666' }}>Creative blogger from the USA</Text>
                </div>
              </Col>
            </Row>
          </div>
          {/* Decorative background elements */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '40%',
              height: '100%',
              background: 'radial-gradient(circle, rgba(212,165,116,0.1) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
        </section>
      )}

      {/* Main Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        {/* Recent News Section */}
        {recentArticles.length > 0 && (
          <section style={{ marginBottom: 80 }}>
            <Title level={2} style={{ fontSize: 32, fontWeight: 300, marginBottom: 48, color: '#2c2c2c', textAlign: 'center', letterSpacing: '-1px' }}>
              Recent News
            </Title>
            <Row gutter={[32, 32]}>
              {recentArticles.map((article, index) => (
                <Col xs={24} md={8} key={article.id}>
                  <Card
                    hoverable
                    onClick={() => window.location.href = `/blog/${article.id}`}
                    style={{
                      background: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      height: '100%',
                      cursor: 'pointer',
                    }}
                    bodyStyle={{ padding: 0 }}
                    cover={
                      article.featuredImage ? (
                        <div style={{ height: 250, overflow: 'hidden' }}>
                          <LazyImage
                            src={article.featuredImage}
                            alt={article.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            height: 250,
                            background: 'linear-gradient(135deg, #f5f3f0, #e8e5e0)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#d4a574',
                            fontSize: 36,
                          }}
                        >
                          {article.title.charAt(0)}
                        </div>
                      )
                    }
                  >
                    <div style={{ padding: 24 }}>
                      {article.publishDate && (
                        <Text style={{ fontSize: 12, color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {new Date(article.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </Text>
                      )}
                      <Link href={`/blog/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Title
                          level={4}
                          style={{
                            marginTop: 12,
                            marginBottom: 0,
                            fontSize: 18,
                            fontWeight: 400,
                            color: '#2c2c2c',
                            lineHeight: 1.4,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {article.title}
                        </Title>
                      </Link>
                      <Link href={`/blog/${article.id}`} style={{ marginTop: 16, display: 'inline-block' }}>
                        <Text style={{ fontSize: 12, color: '#d4a574', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          EXPLORE <RightOutlined style={{ fontSize: 10 }} />
                        </Text>
                      </Link>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </section>
        )}

        {/* Popular News Section */}
        {popularArticles.length > 0 && (
          <section style={{ marginBottom: 80 }}>
            <Title level={2} style={{ fontSize: 32, fontWeight: 300, marginBottom: 16, color: '#2c2c2c', textAlign: 'center', letterSpacing: '-1px' }}>
              Popular News
            </Title>
            <Paragraph style={{ textAlign: 'center', marginBottom: 48, fontSize: 15, color: '#666', maxWidth: 600, margin: '0 auto 48px' }}>
              From lifestyle tips to useful and simple recipes, my blog encompasses a wide variety of topics and publications. Here are the most popular ones.
            </Paragraph>
            <Row gutter={[24, 24]}>
              {popularArticles.map((article) => (
                <Col xs={24} sm={12} md={8} key={article.id}>
                  <Card
                    hoverable
                    onClick={() => window.location.href = `/blog/${article.id}`}
                    style={{
                      background: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      height: '100%',
                      cursor: 'pointer',
                    }}
                    bodyStyle={{ padding: 0 }}
                    cover={
                      article.featuredImage ? (
                        <div style={{ height: 200, overflow: 'hidden' }}>
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
                            background: 'linear-gradient(135deg, #f5f3f0, #e8e5e0)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#d4a574',
                            fontSize: 32,
                          }}
                        >
                          {article.title.charAt(0)}
                        </div>
                      )
                    }
                  >
                    <div style={{ padding: 20 }}>
                      {article.category && (
                        <Tag
                          style={{
                            background: '#f5f3f0',
                            color: '#d4a574',
                            border: 'none',
                            fontSize: 11,
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            marginBottom: 12,
                            padding: '4px 12px',
                          }}
                        >
                          {article.category.name.toUpperCase()}
                        </Tag>
                      )}
                      <Link href={`/blog/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Title
                          level={5}
                          style={{
                            marginBottom: 12,
                            fontSize: 16,
                            fontWeight: 400,
                            color: '#2c2c2c',
                            lineHeight: 1.4,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            minHeight: 44,
                          }}
                        >
                          {article.title}
                        </Title>
                      </Link>
                      {article.publishDate && (
                        <Text style={{ fontSize: 12, color: '#999' }}>
                          {new Date(article.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </Text>
                      )}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </section>
        )}

        {/* Mobile App Section */}
        <section
          style={{
            background: '#fff',
            padding: '60px 24px',
            borderRadius: 8,
            marginBottom: 80,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} md={12}>
              <Title level={2} style={{ fontSize: 32, fontWeight: 300, marginBottom: 24, color: '#2c2c2c', letterSpacing: '-1px' }}>
                Get Ediora mobile app
              </Title>
              <Button
                type="primary"
                size="large"
                icon={<DownloadOutlined />}
                style={{
                  background: '#d4a574',
                  borderColor: '#d4a574',
                  borderRadius: 4,
                  height: 48,
                  padding: '0 32px',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                DOWNLOAD
              </Button>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <Text style={{ fontSize: 32, color: '#d4a574' }}>"</Text>
                <Paragraph style={{ fontSize: 16, color: '#666', lineHeight: 1.8, margin: 0, fontStyle: 'italic' }}>
                  Stay in the know of my latest articles and publications with the Ediora mobile app that is available worldwide on iOS and Android.
                </Paragraph>
              </div>
            </Col>
          </Row>
          {/* Decorative image placeholder */}
          <div
            style={{
              position: 'absolute',
              bottom: -20,
              left: -20,
              width: 200,
              height: 200,
              background: 'linear-gradient(135deg, rgba(212,165,116,0.1), rgba(212,165,116,0.05))',
              borderRadius: '50%',
              zIndex: 0,
            }}
          />
        </section>

        {/* Social Media Section */}
        <section style={{ textAlign: 'center', marginBottom: 80 }}>
          <Text style={{ fontSize: 14, color: '#999', marginBottom: 24, display: 'block' }}>Read Me on:</Text>
          <Space size="large" style={{ fontSize: 14, color: '#666' }}>
            <Link href="#" style={{ color: '#666', textDecoration: 'none' }}>twitter</Link>
            <Link href="#" style={{ color: '#666', textDecoration: 'none' }}>Instagram</Link>
            <Link href="#" style={{ color: '#666', textDecoration: 'none' }}>Medium</Link>
            <Link href="#" style={{ color: '#666', textDecoration: 'none' }}>facebook</Link>
          </Space>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ background: '#2c2c2c', color: '#fff', padding: '60px 24px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Row gutter={[48, 48]}>
            <Col xs={24} md={12}>
              <div style={{ marginBottom: 32 }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 24 }}>
                  <div style={{ width: 24, height: 24, background: '#d4a574', borderRadius: 4, transform: 'rotate(45deg)' }} />
                  <Text strong style={{ fontSize: 18, color: '#fff', letterSpacing: '2px' }}>EDiora</Text>
                </Link>
                <Space.Compact style={{ width: '100%', marginBottom: 12 }}>
                  <Input
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    size="large"
                    style={{ background: '#333', borderColor: '#444', color: '#fff', borderRadius: '4px 0 0 4px' }}
                  />
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleSubscribe}
                    style={{
                      background: '#d4a574',
                      borderColor: '#d4a574',
                      borderRadius: '0 4px 4px 0',
                    }}
                  >
                    SUBSCRIBE
                  </Button>
                </Space.Compact>
                <div style={{ marginTop: 24 }}>
                  <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 8 }}>
                    800.567.1234
                  </Text>
                  <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 8 }}>
                    info@ediora.com
                  </Text>
                  <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                    101 Silver Spear Ave. Brooklyn, NY 11223
                  </Text>
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <Row gutter={[32, 32]}>
                <Col xs={12}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Link href="/admin" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13 }}>
                      About
                    </Link>
                    <Link href="/blog" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13 }}>
                      Trending News
                    </Link>
                    <Link href="/blog" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13 }}>
                      Popular News
                    </Link>
                    <Link href="/blog" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13 }}>
                      Recently Published
                    </Link>
                  </div>
                </Col>
                <Col xs={12}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Link href="/admin" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13 }}>
                      Send Your Article
                    </Link>
                    <Link href="/admin" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13 }}>
                      Contacts
                    </Link>
                    <Link href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13 }}>
                      Privacy Policy
                    </Link>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              © {new Date().getFullYear()}. All rights reserved. Privacy Policy.
            </Text>
          </div>
        </div>
      </footer>

      <BackToTop color="#d4a574" />
    </div>
  )
}


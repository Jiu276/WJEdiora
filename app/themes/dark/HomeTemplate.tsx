'use client'

import { useState } from 'react'
import { Input, Button, Card, Row, Col, Typography, Tag, Space, List, Divider } from 'antd'
import { SearchOutlined, CalendarOutlined, UserOutlined, EyeOutlined, FolderOutlined, PlayCircleOutlined, RightOutlined } from '@ant-design/icons'
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

export default function DarkHomeTemplate({ articles, config, searchKeyword = '', onSearch }: HomeTemplateProps) {
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

  // 特色文章（第一篇作为大图）
  const featuredArticle = filteredArticles[0]
  // 其他特色文章（2-3篇）
  const otherFeatured = filteredArticles.slice(1, 3)
  // 按分类分组
  const articlesByCategory = new Map<string, Article[]>()
  filteredArticles.forEach((article) => {
    const category = article.category?.name || 'Uncategorized'
    if (!articlesByCategory.has(category)) {
      articlesByCategory.set(category, [])
    }
    articlesByCategory.get(category)!.push(article)
  })

  // 最新文章（取前6篇）
  const recentArticles = filteredArticles.slice(0, 6)
  // 技术文章（取6-9篇）
  const techArticles = filteredArticles.slice(6, 9)

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a' }}>
      {/* Top Navigation Bar */}
      <div style={{ background: '#2c2c2c', borderBottom: '1px solid #333', padding: '12px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', fontSize: '13px' }}>
            <Link href="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500 }}>HOME</Link>
            <Link href="/admin" style={{ color: '#fff', textDecoration: 'none' }}>ABOUT</Link>
            <Link href="/blog" style={{ color: '#fff', textDecoration: 'none' }}>LIFESTYLE</Link>
            <Link href="/blog" style={{ color: '#fff', textDecoration: 'none' }}>FOOD</Link>
            <Link href="/blog" style={{ color: '#fff', textDecoration: 'none' }}>TRAVEL</Link>
            <Link href="/blog" style={{ color: '#fff', textDecoration: 'none' }}>FEATURES</Link>
            <Link href="/archive" style={{ color: '#fff', textDecoration: 'none' }}>PAGES</Link>
            <Link href="/admin" style={{ color: '#fff', textDecoration: 'none' }}>CONTACT US</Link>
          </div>
        </div>
      </div>

      {/* Logo Section */}
      <header style={{ background: '#1a1a1a', padding: '40px 0', textAlign: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Title level={1} style={{ fontSize: '64px', fontWeight: 'bold', color: '#ff6b35', margin: 0, letterSpacing: '4px' }}>
            EDiora
          </Title>
        </Link>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <Row gutter={[24, 24]}>
          {/* Left Column - Main Content */}
          <Col xs={24} lg={16}>
            {/* Hero Section - Slider */}
            {!searchKeyword && featuredArticle && (
              <div style={{ marginBottom: 60 }}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Link href={`/blog/${featuredArticle.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div
                        style={{
                          position: 'relative',
                          height: 500,
                          borderRadius: 8,
                          overflow: 'hidden',
                          background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${featuredArticle.featuredImage || '/api/placeholder/600/500'})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          padding: 32,
                        }}
                      >
                        <Title level={2} style={{ color: '#fff', marginBottom: 16, fontSize: 28, fontWeight: 'bold', lineHeight: 1.3 }}>
                          {featuredArticle.title}
                        </Title>
                        <Space style={{ color: '#fff', fontSize: 13 }}>
                          <span><UserOutlined /> {featuredArticle.author}</span>
                          {featuredArticle.publishDate && (
                            <span><CalendarOutlined /> Posted on {new Date(featuredArticle.publishDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                          )}
                        </Space>
                        {/* Slider dots */}
                        <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 8 }}>
                          {[1, 2, 3].map((dot) => (
                            <div key={dot} style={{ width: 8, height: 8, borderRadius: '50%', background: dot === 1 ? '#ff6b35' : 'rgba(255,255,255,0.5)' }} />
                          ))}
                        </div>
                      </div>
                    </Link>
                  </Col>
                  <Col xs={24} md={12}>
                    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
                      {otherFeatured.map((article) => (
                        <Link key={article.id} href={`/blog/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <Card
                            hoverable
                            style={{ background: '#2c2c2c', borderColor: '#333', borderRadius: 8, overflow: 'hidden' }}
                            bodyStyle={{ padding: 0 }}
                            cover={
                              <div style={{ height: 220, position: 'relative' }}>
                                {article.featuredImage ? (
                                  <LazyImage
                                    src={article.featuredImage}
                                    alt={article.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      background: `linear-gradient(135deg, #ff6b35, #f7931e)`,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#fff',
                                      fontSize: 24,
                                    }}
                                  >
                                    {article.title.charAt(0)}
                                  </div>
                                )}
                                {article.category && (
                                  <Tag color="#ff6b35" style={{ position: 'absolute', top: 12, left: 12, fontSize: 11, fontWeight: 'bold', border: 'none' }}>
                                    {article.category.name.toUpperCase()}
                                  </Tag>
                                )}
                              </div>
                            }
                          >
                            <div style={{ padding: 20 }}>
                              <Title level={5} style={{ marginBottom: 8, fontSize: 16, fontWeight: 'bold', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {article.title}
                              </Title>
                              <Space size="small" style={{ fontSize: 12, color: '#999' }}>
                                <span><UserOutlined /> {article.author}</span>
                                {article.publishDate && (
                                  <span><CalendarOutlined /> {new Date(article.publishDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                                )}
                              </Space>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </Space>
                  </Col>
                </Row>
              </div>
            )}

            {/* LIFESTYLE Section */}
            {(articlesByCategory.has('Lifestyle') || articlesByCategory.has('生活')) && (
              <section style={{ marginBottom: 60 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                  <div style={{ width: 4, height: 24, background: '#ff6b35', marginRight: 12 }} />
                  <Title level={3} style={{ fontSize: 20, fontWeight: 'bold', textTransform: 'uppercase', margin: 0, color: '#fff' }}>
                    Lifestyle
                  </Title>
                </div>
                <Row gutter={[16, 16]}>
                  {(articlesByCategory.get('Lifestyle') || articlesByCategory.get('生活') || filteredArticles.slice(0, 6)).slice(0, 6).map((article) => (
                    <Col xs={24} sm={12} key={article.id}>
                      <Link href={`/blog/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Card
                          hoverable
                          style={{ background: '#2c2c2c', borderColor: '#333', borderRadius: 8, overflow: 'hidden', height: '100%' }}
                          bodyStyle={{ padding: 0 }}
                          cover={
                            article.featuredImage ? (
                              <div style={{ height: 200, position: 'relative' }}>
                                <LazyImage
                                  src={article.featuredImage}
                                  alt={article.title}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 8 }}>
                                  {article.category && (
                                    <Tag color="#ff6b35" style={{ fontSize: 10, fontWeight: 'bold', border: 'none' }}>
                                      {article.category.name.toUpperCase()}
                                    </Tag>
                                  )}
                                </div>
                              </div>
                            ) : null
                          }
                        >
                          <div style={{ padding: 20 }}>
                            <Title level={5} style={{ marginBottom: 12, fontSize: 16, fontWeight: 'bold', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: 48 }}>
                              {article.title}
                            </Title>
                            <Paragraph style={{ marginBottom: 16, color: '#999', fontSize: 13, lineHeight: 1.6, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              {article.excerpt
                                ? article.excerpt.replace(/<[^>]*>/g, '').substring(0, 100) + '...'
                                : '点击阅读更多...'}
                            </Paragraph>
                            <Space size="small" style={{ fontSize: 12, color: '#999' }}>
                              <span><UserOutlined /> {article.author}</span>
                              {article.publishDate && (
                                <span><CalendarOutlined /> Posted on {new Date(article.publishDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                              )}
                            </Space>
                          </div>
                        </Card>
                      </Link>
                    </Col>
                  ))}
                </Row>
              </section>
            )}

            {/* Category Sections */}
            {Array.from(articlesByCategory.entries()).slice(0, 3).map(([category, categoryArticles]) => {
              if (category === 'Lifestyle' || category === '生活') return null
              return (
                <section key={category} style={{ marginBottom: 60 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                    <div style={{ width: 4, height: 24, background: '#ff6b35', marginRight: 12 }} />
                    <Title level={3} style={{ fontSize: 20, fontWeight: 'bold', textTransform: 'uppercase', margin: 0, color: '#fff' }}>
                      {category.toUpperCase()} NEWS
                    </Title>
                  </div>
                  {categoryArticles.length > 0 && (
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <Link href={`/blog/${categoryArticles[0].slug || categoryArticles[0].id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <Card
                            hoverable
                            style={{ background: '#2c2c2c', borderColor: '#333', borderRadius: 8, overflow: 'hidden', height: '100%' }}
                            bodyStyle={{ padding: 0 }}
                            cover={
                              categoryArticles[0].featuredImage ? (
                                <div style={{ height: 300, position: 'relative' }}>
                                  <LazyImage
                                    src={categoryArticles[0].featuredImage}
                                    alt={categoryArticles[0].title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                  <Tag color="#ff6b35" style={{ position: 'absolute', top: 16, left: 16, fontSize: 12, fontWeight: 'bold', border: 'none' }}>
                                    {category.toUpperCase()}
                                  </Tag>
                                </div>
                              ) : null
                            }
                          >
                            <div style={{ padding: 24 }}>
                              <Title level={4} style={{ marginBottom: 12, fontSize: 20, fontWeight: 'bold', color: '#fff' }}>
                                {categoryArticles[0].title}
                              </Title>
                              <Paragraph style={{ marginBottom: 16, color: '#999', fontSize: 14, lineHeight: 1.6 }}>
                                {categoryArticles[0].excerpt
                                  ? categoryArticles[0].excerpt.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
                                  : '点击阅读更多...'}
                              </Paragraph>
                              <Space size="small" style={{ fontSize: 12, color: '#999' }}>
                                <span><UserOutlined /> {categoryArticles[0].author}</span>
                                {categoryArticles[0].publishDate && (
                                  <span><CalendarOutlined /> Posted on {new Date(categoryArticles[0].publishDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                                )}
                              </Space>
                            </div>
                          </Card>
                        </Link>
                      </Col>
                      <Col xs={24} md={12}>
                        <Space orientation="vertical" size={16} style={{ width: '100%' }}>
                          {categoryArticles.slice(1, 4).map((article) => (
                            <Link key={article.id} href={`/blog/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                              <Card
                                hoverable
                                style={{ background: '#2c2c2c', borderColor: '#333', borderRadius: 8, overflow: 'hidden' }}
                                bodyStyle={{ padding: 0 }}
                                cover={
                                  article.featuredImage ? (
                                    <div style={{ height: 120, position: 'relative' }}>
                                      <LazyImage
                                        src={article.featuredImage}
                                        alt={article.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      />
                                      <Tag color="#ff6b35" style={{ position: 'absolute', top: 8, left: 8, fontSize: 10, fontWeight: 'bold', border: 'none' }}>
                                        {category.toUpperCase()}
                                      </Tag>
                                    </div>
                                  ) : null
                                }
                              >
                                <div style={{ padding: 16 }}>
                                  <Title level={5} style={{ marginBottom: 8, fontSize: 14, fontWeight: 'bold', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {article.title}
                                  </Title>
                                  <Space size="small" style={{ fontSize: 11, color: '#999' }}>
                                    <span><UserOutlined /> {article.author}</span>
                                    {article.publishDate && (
                                      <span><CalendarOutlined /> {new Date(article.publishDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                                    )}
                                  </Space>
                                </div>
                              </Card>
                            </Link>
                          ))}
                        </Space>
                      </Col>
                    </Row>
                  )}
                </section>
              )
            })}
          </Col>

          {/* Right Sidebar */}
          <Col xs={24} lg={8}>
            <div style={{ position: 'sticky', top: 20 }}>
              {/* Newsletter */}
              <Card
                style={{
                  marginBottom: 24,
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/api/placeholder/400/300')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: 'none',
                }}
                bodyStyle={{ padding: 24 }}
              >
                <Title level={4} style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#fff' }}>
                  Subscribe Our Newsletter
                </Title>
                <Paragraph style={{ marginBottom: 20, color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 1.6 }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </Paragraph>
                <Space orientation="vertical" style={{ width: '100%' }} size="middle">
                  <Input
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    size="large"
                    style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}
                  />
                  <Button type="primary" block size="large" onClick={handleSubscribe} style={{ background: '#ff6b35', borderColor: '#ff6b35' }}>
                    Subscribe
                  </Button>
                </Space>
              </Card>

              {/* Recent Posts */}
              <Card style={{ marginBottom: 24, background: '#2c2c2c', borderColor: '#333', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ width: 4, height: 20, background: '#ff6b35', marginRight: 12 }} />
                  <Title level={4} style={{ fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', margin: 0, color: '#fff' }}>
                    Recent Posts
                  </Title>
                </div>
                <List
                  dataSource={recentArticles.slice(0, 3)}
                  renderItem={(article) => (
                    <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #333' }}>
                      <Link href={`/blog/${article.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: 12 }}>
                        {article.featuredImage && (
                          <div style={{ width: 80, height: 60, borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
                            <LazyImage
                              src={article.featuredImage}
                              alt={article.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {article.category && (
                            <Tag color="#ff6b35" style={{ fontSize: 10, marginBottom: 4, border: 'none' }}>
                              {article.category.name.toUpperCase()}
                            </Tag>
                          )}
                          <Text strong style={{ fontSize: 13, color: '#fff', display: 'block', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {article.title}
                          </Text>
                        </div>
                      </Link>
                    </List.Item>
                  )}
                />
              </Card>

              {/* Technology */}
              <Card style={{ marginBottom: 24, background: '#2c2c2c', borderColor: '#333', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ width: 4, height: 20, background: '#ff6b35', marginRight: 12 }} />
                  <Title level={4} style={{ fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', margin: 0, color: '#fff' }}>
                    Technology
                  </Title>
                </div>
                <List
                  dataSource={techArticles}
                  renderItem={(article) => (
                    <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #333' }}>
                      <Link href={`/blog/${article.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: 12 }}>
                        {article.featuredImage && (
                          <div style={{ width: 80, height: 60, borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
                            <LazyImage
                              src={article.featuredImage}
                              alt={article.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {article.category && (
                            <Tag color="#ff6b35" style={{ fontSize: 10, marginBottom: 4, border: 'none' }}>
                              {article.category.name.toUpperCase()}
                            </Tag>
                          )}
                          <Text strong style={{ fontSize: 13, color: '#fff', display: 'block', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {article.title}
                          </Text>
                        </div>
                      </Link>
                    </List.Item>
                  )}
                />
              </Card>
            </div>
          </Col>
        </Row>
      </main>

      {/* Footer */}
      <footer style={{ background: '#2c2c2c', color: '#fff', padding: '60px 24px 20px', marginTop: 60 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Footer Images */}
          <Row gutter={[16, 16]} style={{ marginBottom: 40 }}>
            {[1, 2, 3].map((i) => (
              <Col xs={24} sm={8} key={i}>
                <div style={{ height: 200, background: '#1a1a1a', borderRadius: 8, overflow: 'hidden' }}>
                  {filteredArticles[i]?.featuredImage && (
                    <LazyImage
                      src={filteredArticles[i].featuredImage}
                      alt={filteredArticles[i].title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </div>
              </Col>
            ))}
          </Row>

          {/* Footer Links */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
            {['ABOUT', 'LIFESTYLE', 'FOOD', 'TECH', 'TRAVEL', 'CONTACT US'].map((link) => (
              <Link key={link} href="#" style={{ color: '#fff', textDecoration: 'none', fontSize: '13px' }}>
                {link}
              </Link>
            ))}
          </div>

          <Divider style={{ borderColor: '#333', margin: '20px 0' }} />

          {/* Copyright */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
              © {new Date().getFullYear()} All Rights Reserved.
            </Text>
            <div style={{ display: 'flex', gap: 12 }}>
              {/* Social icons placeholder */}
            </div>
          </div>
        </div>
      </footer>

      <BackToTop color="#ff6b35" />
    </div>
  )
}

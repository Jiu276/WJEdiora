'use client'

import { useState } from 'react'
import { Input, Button, Card, Row, Col, Typography, Tag, Space, List, Divider } from 'antd'
import { SearchOutlined, CalendarOutlined, UserOutlined, EyeOutlined, FolderOutlined, RightOutlined, FacebookOutlined, TwitterOutlined, InstagramOutlined, YoutubeOutlined, LinkedinOutlined, GlobalOutlined } from '@ant-design/icons'
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
  // 最新文章
  const latestArticles = filteredArticles.slice(3, 7)
  // 按分类分组
  const articlesByCategory = new Map<string, Article[]>()
  filteredArticles.forEach((article) => {
    const category = article.category?.name || 'Uncategorized'
    if (!articlesByCategory.has(category)) {
      articlesByCategory.set(category, [])
    }
    articlesByCategory.get(category)!.push(article)
  })

  // 热门文章（取前5篇）
  const popularArticles = filteredArticles.slice(0, 5)
  // 趋势文章（取6-11篇）
  const trendingArticles = filteredArticles.slice(5, 11)

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Top Bar */}
      <div style={{ background: '#2c2c2c', color: '#fff', padding: '8px 0', fontSize: '12px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Link href="/admin" style={{ color: '#fff', textDecoration: 'none' }}>LOGIN</Link>
            <span>|</span>
            <Link href="/admin" style={{ color: '#fff', textDecoration: 'none' }}>REGISTER</Link>
            <span style={{ marginLeft: 16 }}>ENGLISH</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <FacebookOutlined style={{ cursor: 'pointer' }} />
            <TwitterOutlined style={{ cursor: 'pointer' }} />
            <InstagramOutlined style={{ cursor: 'pointer' }} />
            <YoutubeOutlined style={{ cursor: 'pointer' }} />
            <SearchOutlined style={{ cursor: 'pointer', marginLeft: 8 }} />
          </div>
        </div>
      </div>

      {/* Header with Logo and Ad */}
      <header style={{ background: '#2c2c2c', padding: '20px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Link href="/" style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📰</span>
            <span>Ediora Blog & Magazine</span>
          </Link>
          <div style={{ background: '#fff', padding: '12px 24px', borderRadius: 4, minWidth: 300, textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>PLACE YOUR ADS HERE 728x90 AD</Text>
            <Button type="primary" danger size="small" style={{ marginLeft: 8 }}>KNOW MORE</Button>
          </div>
        </div>
      </header>

      {/* Main Navigation */}
      <nav style={{ background: '#2c2c2c', borderTop: '1px solid #444', padding: '0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: '#fff', textDecoration: 'none', padding: '16px 0', fontSize: '14px', fontWeight: 500 }}>HOME</Link>
            <Link href="/admin" style={{ color: '#fff', textDecoration: 'none', padding: '16px 0', fontSize: '14px' }}>ABOUT US</Link>
            <Link href="/blog" style={{ color: '#fff', textDecoration: 'none', padding: '16px 0', fontSize: '14px' }}>SPORTS</Link>
            <Link href="/blog" style={{ color: '#fff', textDecoration: 'none', padding: '16px 0', fontSize: '14px' }}>VIDEO</Link>
            <Link href="/blog" style={{ color: '#fff', textDecoration: 'none', padding: '16px 0', fontSize: '14px' }}>FEATURES</Link>
            <Link href="/archive" style={{ color: '#fff', textDecoration: 'none', padding: '16px 0', fontSize: '14px' }}>PAGES</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <Row gutter={[24, 24]}>
          {/* Left Column - Main Content */}
          <Col xs={24} lg={16}>
            {/* Featured Section */}
            {!searchKeyword && featuredArticle && (
              <div style={{ marginBottom: 40 }}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <div
                      onClick={() => window.location.href = `/blog/${featuredArticle.id}`}
                      style={{
                        position: 'relative',
                        height: 400,
                        borderRadius: 8,
                        overflow: 'hidden',
                        background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${featuredArticle.featuredImage || '/api/placeholder/600/400'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: 24,
                        cursor: 'pointer',
                      }}
                    >
                      {featuredArticle.category && (
                        <Tag color="#dc2626" style={{ position: 'absolute', top: 16, left: 16, fontSize: 12, fontWeight: 'bold' }}>
                          {featuredArticle.category.name.toUpperCase()}
                        </Tag>
                      )}
                      <Link href={`/blog/${featuredArticle.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Title level={2} style={{ color: '#fff', marginBottom: 12, fontSize: 24, fontWeight: 'bold' }}>
                          {featuredArticle.title}
                        </Title>
                      </Link>
                      <Space style={{ color: '#fff', fontSize: 12 }}>
                        <span><UserOutlined /> {featuredArticle.author}</span>
                        {featuredArticle.publishDate && (
                          <span><CalendarOutlined /> {new Date(featuredArticle.publishDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        )}
                      </Space>
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
                      {otherFeatured.map((article) => (
                        <Card
                          key={article.id}
                          hoverable
                          onClick={() => window.location.href = `/blog/${article.id}`}
                          style={{ borderRadius: 8, overflow: 'hidden', cursor: 'pointer' }}
                          bodyStyle={{ padding: 0 }}
                          cover={
                            <div style={{ height: 180, position: 'relative' }}>
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
                                    background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.accent})`,
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
                                <Tag color="#dc2626" style={{ position: 'absolute', top: 8, left: 8, fontSize: 11, fontWeight: 'bold' }}>
                                  {article.category.name.toUpperCase()}
                                </Tag>
                              )}
                            </div>
                          }
                        >
                          <div style={{ padding: 16 }}>
                            <Link href={`/blog/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                              <Title level={5} style={{ marginBottom: 8, fontSize: 14, fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {article.title}
                              </Title>
                            </Link>
                            <Space size="small" style={{ fontSize: 11, color: '#999' }}>
                              <span><UserOutlined /> {article.author}</span>
                              {article.publishDate && (
                                <span><CalendarOutlined /> {new Date(article.publishDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                              )}
                            </Space>
                          </div>
                        </Card>
                      ))}
                    </Space>
                  </Col>
                </Row>
              </div>
            )}

            {/* Latest Posts Section */}
            <section style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={3} style={{ fontSize: 20, fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>
                  Latest Posts
                </Title>
              </div>
              {latestArticles.length > 0 && (
                <>
                  <Card
                    hoverable
                    style={{ marginBottom: 24, borderRadius: 8, overflow: 'hidden' }}
                    bodyStyle={{ padding: 0 }}
                    cover={
                      latestArticles[0].featuredImage ? (
                        <div style={{ height: 300, position: 'relative' }}>
                          <LazyImage
                            src={latestArticles[0].featuredImage}
                            alt={latestArticles[0].title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          {latestArticles[0].category && (
                            <Tag color="#dc2626" style={{ position: 'absolute', top: 16, left: 16, fontSize: 12, fontWeight: 'bold' }}>
                              {latestArticles[0].category.name.toUpperCase()}
                            </Tag>
                          )}
                        </div>
                      ) : null
                    }
                  >
                    <div style={{ padding: 24 }}>
                      <Title level={4} style={{ marginBottom: 12, fontSize: 20, fontWeight: 'bold' }}>
                        {latestArticles[0].title}
                      </Title>
                      <Paragraph style={{ marginBottom: 16, color: '#666', fontSize: 14 }}>
                        {latestArticles[0].excerpt
                          ? latestArticles[0].excerpt.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
                          : '点击阅读更多...'}
                      </Paragraph>
                      <Space size="small" style={{ fontSize: 12, color: '#999' }}>
                        <span><UserOutlined /> {latestArticles[0].author}</span>
                        {latestArticles[0].publishDate && (
                          <span><CalendarOutlined /> {new Date(latestArticles[0].publishDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        )}
                      </Space>
                    </div>
                  </Card>
                  <Row gutter={[16, 16]}>
                    {latestArticles.slice(1, 4).map((article) => (
                      <Col xs={24} sm={8} key={article.id}>
                        <Card
                          hoverable
                          onClick={() => window.location.href = `/blog/${article.id}`}
                          style={{ borderRadius: 8, overflow: 'hidden', height: '100%', cursor: 'pointer' }}
                          bodyStyle={{ padding: 0 }}
                          cover={
                            article.featuredImage ? (
                              <div style={{ height: 150, position: 'relative' }}>
                                <LazyImage
                                  src={article.featuredImage}
                                  alt={article.title}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                {article.category && (
                                  <Tag color="#dc2626" style={{ position: 'absolute', top: 8, left: 8, fontSize: 10, fontWeight: 'bold' }}>
                                    {article.category.name.toUpperCase()}
                                  </Tag>
                                )}
                              </div>
                            ) : null
                          }
                        >
                          <div style={{ padding: 16 }}>
                            <Link href={`/blog/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                              <Title level={5} style={{ marginBottom: 8, fontSize: 14, fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {article.title}
                              </Title>
                            </Link>
                            <Space size="small" style={{ fontSize: 11, color: '#999' }}>
                              <span><UserOutlined /> {article.author}</span>
                              {article.publishDate && (
                                <span><CalendarOutlined /> {new Date(article.publishDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                              )}
                            </Space>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </>
              )}
            </section>

            {/* Category Sections */}
            {Array.from(articlesByCategory.entries()).slice(0, 3).map(([category, categoryArticles]) => (
              <section key={category} style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <Title level={3} style={{ fontSize: 20, fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>
                    {category.toUpperCase()} NEWS
                  </Title>
                  <Link href={`/blog?category=${category}`}>
                    <Button type="link" style={{ padding: 0 }}>MORE <RightOutlined /></Button>
                  </Link>
                </div>
                {categoryArticles.length > 0 && (
                  <>
                    <Card
                      hoverable
                      style={{ marginBottom: 24, borderRadius: 8, overflow: 'hidden' }}
                      bodyStyle={{ padding: 0 }}
                      cover={
                        categoryArticles[0].featuredImage ? (
                          <div style={{ height: 300, position: 'relative' }}>
                            <LazyImage
                              src={categoryArticles[0].featuredImage}
                              alt={categoryArticles[0].title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <Tag color="#dc2626" style={{ position: 'absolute', top: 16, left: 16, fontSize: 12, fontWeight: 'bold' }}>
                              {category.toUpperCase()}
                            </Tag>
                          </div>
                        ) : null
                      }
                    >
                      <div style={{ padding: 24 }}>
                        <Title level={4} style={{ marginBottom: 12, fontSize: 20, fontWeight: 'bold' }}>
                          {categoryArticles[0].title}
                        </Title>
                        <Space size="small" style={{ fontSize: 12, color: '#999' }}>
                          <span><UserOutlined /> {categoryArticles[0].author}</span>
                          {categoryArticles[0].publishDate && (
                            <span><CalendarOutlined /> {new Date(categoryArticles[0].publishDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          )}
                        </Space>
                      </div>
                    </Card>
                    <Row gutter={[16, 16]}>
                      {categoryArticles.slice(1, 5).map((article) => (
                        <Col xs={24} sm={12} md={6} key={article.id}>
                          <Card
                            hoverable
                            onClick={() => window.location.href = `/blog/${article.id}`}
                            style={{ borderRadius: 8, overflow: 'hidden', height: '100%', cursor: 'pointer' }}
                            bodyStyle={{ padding: 0 }}
                            cover={
                              article.featuredImage ? (
                                <div style={{ height: 120, position: 'relative' }}>
                                  <LazyImage
                                    src={article.featuredImage}
                                    alt={article.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                </div>
                              ) : null
                            }
                          >
                            <div style={{ padding: 12 }}>
                              <Link href={`/blog/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Title level={5} style={{ marginBottom: 8, fontSize: 13, fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: 40 }}>
                                  {article.title}
                                </Title>
                              </Link>
                              <Space size="small" style={{ fontSize: 10, color: '#999' }}>
                                <span><UserOutlined /> {article.author}</span>
                                {article.publishDate && (
                                  <span><CalendarOutlined /> {new Date(article.publishDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                )}
                              </Space>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </>
                )}
              </section>
            ))}
          </Col>

          {/* Right Sidebar */}
          <Col xs={24} lg={8}>
            <div style={{ position: 'sticky', top: 20 }}>
              {/* About Us */}
              <Card style={{ marginBottom: 24, borderRadius: 8 }}>
                <Title level={4} style={{ fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 16 }}>
                  About Us
                </Title>
                <Paragraph style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </Paragraph>
              </Card>

              {/* Follow Us */}
              <Card style={{ marginBottom: 24, borderRadius: 8 }}>
                <Title level={4} style={{ fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 16 }}>
                  Follow Us
                </Title>
                <Row gutter={[8, 8]}>
                  {[
                    { icon: <FacebookOutlined />, name: 'Facebook' },
                    { icon: <TwitterOutlined />, name: 'X' },
                    { icon: <InstagramOutlined />, name: 'Pinterest' },
                    { icon: <LinkedinOutlined />, name: 'Google Plus' },
                    { icon: <InstagramOutlined />, name: 'Instagram' },
                    { icon: <LinkedinOutlined />, name: 'LinkedIn' },
                  ].map((social, index) => (
                    <Col xs={8} key={index}>
                      <Button
                        block
                        style={{
                          height: 60,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderColor: '#ddd',
                        }}
                      >
                        <div style={{ fontSize: 20, marginBottom: 4 }}>{social.icon}</div>
                        <Text style={{ fontSize: 11 }}>{social.name}</Text>
                      </Button>
                    </Col>
                  ))}
                </Row>
              </Card>

              {/* Popular Posts */}
              <Card style={{ marginBottom: 24, borderRadius: 8 }}>
                <Title level={4} style={{ fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 16 }}>
                  Popular Posts
                </Title>
                <List
                  dataSource={popularArticles}
                  renderItem={(article) => (
                    <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
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
                          <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {article.title}
                          </Text>
                          <Space size="small" style={{ fontSize: 11, color: '#999' }}>
                            <span><UserOutlined /> {article.author}</span>
                            {article.publishDate && (
                              <span><CalendarOutlined /> {new Date(article.publishDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            )}
                          </Space>
                        </div>
                      </Link>
                    </List.Item>
                  )}
                />
              </Card>

              {/* Newsletter */}
              <Card style={{ marginBottom: 24, borderRadius: 8 }}>
                <Title level={4} style={{ fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 16 }}>
                  Subscribe to Newsletter
                </Title>
                <Space orientation="vertical" style={{ width: '100%' }} size="middle">
                  <Input
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    size="large"
                  />
                  <Button type="primary" danger block size="large" onClick={handleSubscribe}>
                    SUBSCRIBE
                  </Button>
                </Space>
              </Card>

              {/* Trending */}
              <Card style={{ marginBottom: 24, borderRadius: 8 }}>
                <Title level={4} style={{ fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 16 }}>
                  Trending
                </Title>
                <List
                  dataSource={trendingArticles}
                  renderItem={(article) => (
                    <List.Item style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <Link href={`/blog/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Text style={{ fontSize: 12, display: 'block', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {article.title}
                        </Text>
                        <Space size="small" style={{ fontSize: 10, color: '#999' }}>
                          <span><UserOutlined /> {article.author}</span>
                          {article.publishDate && (
                            <span><CalendarOutlined /> {new Date(article.publishDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          )}
                        </Space>
                      </Link>
                    </List.Item>
                  )}
                />
              </Card>

              {/* Tags */}
              <Card style={{ marginBottom: 24, borderRadius: 8 }}>
                <Title level={4} style={{ fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 16 }}>
                  Tags
                </Title>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['Fashion', 'Food', 'Mobile', 'Technology', 'Travel', 'Video', 'Watch', 'Sports', 'Life Style', 'Event', 'Business', 'Culture'].map((tag) => (
                    <Tag key={tag} color="default" style={{ margin: 0, borderColor: '#ddd', color: '#dc2626', cursor: 'pointer' }}>
                      {tag}
                    </Tag>
                  ))}
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </main>

      {/* Footer */}
      <footer style={{ background: '#2c2c2c', color: '#fff', padding: '60px 24px 20px', marginTop: 60 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Row gutter={[40, 40]}>
            <Col xs={24} sm={8}>
              <Title level={5} style={{ color: '#fff', marginBottom: 16, fontSize: 14, fontWeight: 'bold' }}>
                Address
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 1.8, margin: 0 }}>
                Lorem ipsum dolor sit,<br />
                New York
              </Paragraph>
              <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 12, marginBottom: 0 }}>
                Phone: +(0123) 456-7891<br />
                Email: info@ediora.com
              </Paragraph>
            </Col>
            <Col xs={24} sm={8}>
              <Title level={5} style={{ color: '#fff', marginBottom: 16, fontSize: 14, fontWeight: 'bold' }}>
                Links
              </Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Home', 'About Us', 'Services', 'Privacy Notice', 'Feedback', 'Project', 'Blog', 'Contact Us', 'Lifestyle', 'Travel Tips'].map((link) => (
                  <Link key={link} href="#" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 13 }}>
                    {link}
                  </Link>
                ))}
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <Title level={5} style={{ color: '#fff', marginBottom: 16, fontSize: 14, fontWeight: 'bold' }}>
                About Us
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 1.8, marginBottom: 16 }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </Paragraph>
              <Space size="middle">
                <FacebookOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
                <TwitterOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
                <InstagramOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
                <YoutubeOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
              </Space>
            </Col>
          </Row>
          <Divider style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '40px 0 20px' }} />
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
            © {new Date().getFullYear()} All Rights Reserved.
          </div>
        </div>
      </footer>

      <BackToTop color="#dc2626" />
    </div>
  )
}


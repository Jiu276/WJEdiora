'use client'

import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Typography, Button, Tag, Space, Divider, Card, Row, Col, List } from 'antd'
import { ArrowLeftOutlined, CalendarOutlined, EyeOutlined, LinkOutlined } from '@ant-design/icons'
import ReadingProgress from '@/components/ReadingProgress'
import BackToTop from '@/components/BackToTop'
import ShareButtons from '@/components/ShareButtons'
import LazyImage from '@/components/LazyImage'
import type { ThemeConfig } from '@/lib/themeLoader'
import { addHeadingIdsAndExtractToc } from '@/components/articleToc'
import ArticleTocCard from '@/components/ArticleTocCard'

const { Title, Paragraph } = Typography

interface Article {
  id: string
  title: string
  content: string
  excerpt: string | null
  author: string
  publishDate: string | null
  featuredImage: string | null
  viewCount?: number
  category?: {
    id: string
    name: string
    slug: string
  } | null
  tags?: string[]
}

interface ArticleDetailTemplateProps {
  article: Article
  customDomains: any[]
  links: any[]
  relatedArticles: any[]
  config: ThemeConfig
}

export default function ModernSimpleArticleDetailTemplate({ article, customDomains, links, relatedArticles, config }: ArticleDetailTemplateProps) {
  const router = useRouter()

  const { htmlWithIds, headings } = useMemo(() => addHeadingIdsAndExtractToc(article.content), [article.content])

  const scrollToHeading = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: config.colors.background }}>
      <ReadingProgress color={config.colors.primary} />
      
      {/* Header */}
      <header style={{ 
        background: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('https://picsum.photos/seed/iridium-header/1920/300')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        color: '#fff'
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Title level={2} style={{ margin: 0, color: '#fff', fontWeight: 300, letterSpacing: '4px', fontSize: 32 }}>
            IRIDIUM
          </Title>
        </Link>
      </header>

      {/* Article Content */}
      <article style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/blog')}
            style={{ marginBottom: 32, color: config.colors.subtext }}
          >
            Back to Blog
          </Button>

          {article.featuredImage && (
            <div style={{ marginBottom: 40, borderRadius: 8, overflow: 'hidden' }}>
              <LazyImage src={article.featuredImage} alt={article.title} style={{ width: '100%', height: 'auto', maxHeight: 500, objectFit: 'cover' }} />
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            {article.category && <Tag color={config.colors.primary} style={{ marginBottom: 16 }}>{article.category.name}</Tag>}
            <Title level={1} style={{ marginBottom: 24, color: config.colors.text, fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 300 }}>
              {article.title}
            </Title>
          </div>

          <div style={{ marginBottom: 32, color: config.colors.subtext, fontSize: 14 }}>
            <Space size="middle" split={<span>·</span>}>
              <span>By {article.author}</span>
              {article.publishDate && (
                <span>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  {new Date(article.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
              {article.viewCount !== undefined && (
                <span>
                  <EyeOutlined style={{ marginRight: 4 }} />
                  {article.viewCount} views
                </span>
              )}
            </Space>
          </div>

          {headings.length > 0 && <ArticleTocCard headings={headings} config={config} onNavigate={scrollToHeading} />}

          {article.excerpt && (
            <Paragraph style={{ fontSize: '18px', color: config.colors.subtext, marginBottom: 40, fontStyle: 'italic', borderLeft: `4px solid ${config.colors.primary}`, paddingLeft: 20 }}>
              {article.excerpt}
            </Paragraph>
          )}

          <div
            dangerouslySetInnerHTML={{ __html: htmlWithIds }}
            style={{ lineHeight: 1.9, fontSize: 'clamp(16px, 4vw, 18px)', color: config.colors.text }}
            className="article-content"
          />

          {article.tags && article.tags.length > 0 && (
            <div style={{ marginTop: 40 }}>
              <Space wrap>
                {article.tags.map((tag, index) => (
                  <Tag key={index} style={{ fontSize: 14, padding: '4px 12px' }}>#{tag}</Tag>
                ))}
              </Space>
            </div>
          )}

          <Divider style={{ margin: '40px 0' }} />

          <div style={{ marginTop: 24 }}>
            <Typography.Text strong style={{ color: config.colors.text, marginRight: 16, fontSize: 14 }}>Share:</Typography.Text>
            <ShareButtons title={article.title} url={`/blog/${article.id}`} description={article.excerpt || undefined} image={article.featuredImage || undefined} />
          </div>

          {/* Related domains */}
          {customDomains.length > 0 && (
            <Card
              title="Related domains"
              style={{ marginTop: 24, borderRadius: 8, background: config.colors.cardBackground, borderColor: config.colors.border }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {customDomains.map((domain: any) => (
                  <Tag key={domain.id} color={config.colors.primary}>
                    {domain.domain}
                  </Tag>
                ))}
              </div>
            </Card>
          )}

          {/* Related links */}
          {links.length > 0 && (
            <Card
              title="Related links"
              style={{ marginTop: 24, borderRadius: 8, background: config.colors.cardBackground, borderColor: config.colors.border }}
            >
              <List
                dataSource={links}
                renderItem={(link: any) => (
                  <List.Item style={{ border: 'none', padding: '8px 0' }}>
                    <LinkOutlined style={{ marginRight: 8, color: config.colors.primary }} />
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: config.colors.primary, textDecoration: 'none' }}
                    >
                      {link.keyword}
                    </a>
                  </List.Item>
                )}
              />
            </Card>
          )}

          {/* Related articles */}
          {relatedArticles.length > 0 && (
            <Card
              title="Related articles"
              style={{ marginTop: 24, borderRadius: 8, background: config.colors.cardBackground, borderColor: config.colors.border }}
            >
              <Row gutter={[16, 16]}>
                {relatedArticles.map((related: any) => (
                  <Col xs={24} sm={12} lg={8} key={related.id}>
                    <Card
                      hoverable
                      cover={
                        related.featuredImage ? (
                          <img alt={related.title} src={related.featuredImage} style={{ height: 150, objectFit: 'cover' }} />
                        ) : (
                          <div
                            style={{
                              height: 150,
                              background: `linear-gradient(135deg, ${config.colors.primary} 0%, ${config.colors.accent} 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontSize: '24px',
                            }}
                          >
                            {related.title.charAt(0)}
                          </div>
                        )
                      }
                      onClick={() => router.push(`/blog/${related.slug || related.id}`)}
                      style={{ cursor: 'pointer', height: '100%', background: config.colors.cardBackground, borderColor: config.colors.border }}
                    >
                      <Card.Meta
                        title={<Typography.Text ellipsis style={{ fontSize: '14px', color: config.colors.text }}>{related.title}</Typography.Text>}
                        description={
                          <div>
                            {related.excerpt && (
                              <Paragraph ellipsis={{ rows: 2 }} style={{ fontSize: '12px', color: config.colors.subtext, marginBottom: 8 }}>
                                {related.excerpt}
                              </Paragraph>
                            )}
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )}
        </div>
      </article>

      <BackToTop color={config.colors.primary} />
    </div>
  )
}

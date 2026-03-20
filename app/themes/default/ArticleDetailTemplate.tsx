'use client'

import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Typography, Button, Card, Tag, Space, Row, Col, List, Divider } from 'antd'
import { ArrowLeftOutlined, LinkOutlined, EyeOutlined } from '@ant-design/icons'
import LazyImage from '@/components/LazyImage'
import ReadingProgress from '@/components/ReadingProgress'
import BackToTop from '@/components/BackToTop'
import ShareButtons from '@/components/ShareButtons'
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

interface CustomDomain {
  id: string
  domain: string
}

interface ArticleLink {
  id: string
  keyword: string
  url: string
}

interface RelatedArticle {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featuredImage: string | null
  publishDate: string | null
}

interface ArticleDetailTemplateProps {
  article: Article
  customDomains: CustomDomain[]
  links: ArticleLink[]
  relatedArticles: RelatedArticle[]
  config: ThemeConfig
}

export default function ArticleDetailTemplate({
  article,
  customDomains,
  links,
  relatedArticles,
  config,
}: ArticleDetailTemplateProps) {
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
      <div
        style={{
          background: config.colors.cardBackground,
          borderBottom: `1px solid ${config.colors.border}`,
          padding: '16px 0',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/blog" style={{ fontSize: '20px', fontWeight: 'bold', color: config.colors.primary, textDecoration: 'none' }}>
            Ediora
          </Link>
          <div>
            <Link href="/blog" style={{ marginRight: 16, color: config.colors.subtext, textDecoration: 'none' }}>
              Articles
            </Link>
            <Link href="/archive" style={{ marginRight: 16, color: config.colors.subtext, textDecoration: 'none' }}>
              Archive
            </Link>
            <Link href="/admin" style={{ color: config.colors.subtext, textDecoration: 'none' }}>
              Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(24px, 5vw, 48px) clamp(16px, 4vw, 24px)' }}>
        <Row gutter={[24, 24]} align="top">
          <Col xs={24} lg={16}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/blog')}
              style={{ marginBottom: 24 }}
            >
              Back to list
            </Button>

            <Card
              style={{
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                background: config.colors.cardBackground,
                borderColor: config.colors.border,
              }}
            >
              {article.featuredImage && (
                <LazyImage
                  src={article.featuredImage}
                  alt={article.title}
                  style={{
                    width: '100%',
                    height: 400,
                    objectFit: 'cover',
                    borderRadius: 8,
                    marginBottom: 32,
                  }}
                />
              )}

              <Title level={1} style={{ marginBottom: 16, color: config.colors.text, fontSize: 'clamp(24px, 5vw, 32px)', lineHeight: 1.3 }}>
                {article.title}
              </Title>

              <div
                style={{
                  marginBottom: 24,
                  color: config.colors.subtext,
                  paddingBottom: 16,
                  borderBottom: `1px solid ${config.colors.border}`,
                }}
              >
                <Space size="middle" style={{ marginBottom: 8 }}>
                  <span>✍️ Author: {article.author}</span>
                  {article.publishDate && (
                    <span>📅 Published: {new Date(article.publishDate).toLocaleString('en-US')}</span>
                  )}
                  {article.viewCount !== undefined && (
                    <Space>
                      <EyeOutlined />
                      <span>{article.viewCount} views</span>
                    </Space>
                  )}
                  {article.category && (
                    <Tag color={config.colors.primary}>{article.category.name}</Tag>
                  )}
                </Space>
                {article.tags && article.tags.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    {article.tags.map((tag, index) => (
                      <Tag key={index} style={{ marginBottom: 4 }}>
                        {tag}
                      </Tag>
                    ))}
                  </div>
                )}
              </div>

              {article.excerpt && (
                <Paragraph
                  style={{
                    fontSize: '18px',
                    color: config.colors.subtext,
                    marginBottom: 32,
                    fontStyle: 'italic',
                    borderLeft: `4px solid ${config.colors.primary}`,
                    paddingLeft: 16,
                  }}
                >
                  {article.excerpt}
                </Paragraph>
              )}

              <div
                dangerouslySetInnerHTML={{ __html: htmlWithIds }}
                style={{
                  lineHeight: 1.8,
                  fontSize: 'clamp(14px, 4vw, 16px)',
                  color: config.colors.text,
                }}
                className="article-content"
              />

              <Divider />

              <div style={{ marginTop: 24 }}>
                <Typography.Text strong style={{ color: config.colors.text, marginRight: 16 }}>
                  Share:
                </Typography.Text>
                <ShareButtons
                  title={article.title}
                  url={`/blog/${(article as any).slug || article.id}`}
                  description={article.excerpt || undefined}
                  image={article.featuredImage || undefined}
                />
              </div>
            </Card>

            {/* Related domains */}
            {customDomains.length > 0 && (
              <Card
                title="Related domains"
                style={{ marginTop: 24, borderRadius: 8, background: config.colors.cardBackground, borderColor: config.colors.border }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {customDomains.map((domain) => (
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
                  renderItem={(link) => (
                    <List.Item>
                      <LinkOutlined style={{ marginRight: 8, color: config.colors.primary }} />
                      <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: config.colors.primary }}>
                        {link.keyword}
                      </a>
                      <span style={{ marginLeft: 8, color: config.colors.subtext, fontSize: '12px' }}>
                        ({link.url})
                      </span>
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {/* Related articles */}
            {relatedArticles.length > 0 && (
              <Card
                title="Related Articles"
                style={{ marginTop: 24, borderRadius: 8, background: config.colors.cardBackground, borderColor: config.colors.border }}
              >
                <Row gutter={[16, 16]}>
                  {relatedArticles.map((related) => (
                    <Col xs={24} sm={12} lg={8} key={related.id}>
                      <Card
                        hoverable
                        cover={
                          related.featuredImage ? (
                            <img
                              alt={related.title}
                              src={related.featuredImage}
                              style={{ height: 150, objectFit: 'cover' }}
                            />
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
                          title={
                            <Typography.Text ellipsis style={{ fontSize: '14px', color: config.colors.text }}>
                              {related.title}
                            </Typography.Text>
                          }
                          description={
                            <div>
                              {related.excerpt && (
                                <Paragraph
                                  ellipsis={{ rows: 2 }}
                                  style={{ fontSize: '12px', color: config.colors.subtext, marginBottom: 8 }}
                                >
                                  {related.excerpt}
                                </Paragraph>
                              )}
                              {related.publishDate && (
                                <span style={{ color: config.colors.subtext, fontSize: '12px' }}>
                                  {new Date(related.publishDate).toLocaleDateString('en-US')}
                                </span>
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
          </Col>

          <Col xs={24} lg={8}>
            {headings.length > 0 && (
              <div style={{ position: 'sticky', top: 96 }}>
                <ArticleTocCard headings={headings} config={config} onNavigate={scrollToHeading} />
              </div>
            )}
          </Col>
        </Row>
      </div>

      {/* 页脚 */}
      <div
        style={{
          textAlign: 'center',
          padding: '48px 24px',
          color: config.colors.subtext,
          background: config.colors.cardBackground,
          marginTop: 48,
        }}
      >
        <p>© 2025 Ediora. All rights reserved.</p>
      </div>

      <BackToTop color={config.colors.primary} />
    </div>
  )
}


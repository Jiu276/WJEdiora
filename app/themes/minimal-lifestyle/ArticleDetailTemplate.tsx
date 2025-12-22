'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Typography, Button, Tag, Space, Row, Col, Divider, Card } from 'antd'
import { ArrowLeftOutlined, CalendarOutlined, UserOutlined, FolderOutlined, EyeOutlined } from '@ant-design/icons'
import LazyImage from '@/components/LazyImage'
import ReadingProgress from '@/components/ReadingProgress'
import BackToTop from '@/components/BackToTop'
import ShareButtons from '@/components/ShareButtons'
import type { ThemeConfig } from '@/lib/themeLoader'

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
  relatedArticles: RelatedArticle[]
  config: ThemeConfig
}

export default function ArticleDetailTemplate({
  article,
  relatedArticles,
  config,
}: ArticleDetailTemplateProps) {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: config.colors.background }}>
      <ReadingProgress color={config.colors.primary} />

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
            <Link href="/" style={{ color: config.colors.text, textDecoration: 'none', fontSize: '15px' }}>Home</Link>
            <Link href="/blog" style={{ color: config.colors.text, textDecoration: 'none', fontSize: '15px' }}>Articles</Link>
            <Link href="/archive" style={{ color: config.colors.text, textDecoration: 'none', fontSize: '15px' }}>Archive</Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px' }}>
        {/* Back Button */}
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/blog')}
          style={{ marginBottom: 32, border: 'none', boxShadow: 'none' }}
        >
          Back to list
        </Button>

        {/* Article Header */}
        <article>
          {article.category && (
            <Tag color={config.colors.primary} style={{ marginBottom: 16, fontSize: 12, padding: '4px 12px' }}>
              {article.category.name}
            </Tag>
          )}

          <Title
            level={1}
            style={{
              marginBottom: 24,
              color: config.colors.text,
              fontSize: 'clamp(32px, 5vw, 42px)',
              lineHeight: 1.3,
              fontWeight: 'bold',
            }}
          >
            {article.title}
          </Title>

          {/* Meta Information */}
          <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: `1px solid ${config.colors.border}` }}>
            <Space size="large" style={{ fontSize: '14px', color: config.colors.subtext }}>
              <span><UserOutlined style={{ marginRight: 4 }} />{article.author}</span>
              {article.publishDate && (
                <span><CalendarOutlined style={{ marginRight: 4 }} />{new Date(article.publishDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              )}
              {article.viewCount !== undefined && (
                <span><EyeOutlined style={{ marginRight: 4 }} />{article.viewCount} 次阅读</span>
              )}
              {article.category && (
                <Tag icon={<FolderOutlined />} color={config.colors.primary} style={{ fontSize: 12 }}>
                  {article.category.name}
                </Tag>
              )}
            </Space>
            {article.tags && article.tags.length > 0 && (
              <div style={{ marginTop: 16 }}>
                {article.tags.map((tag, index) => (
                  <Tag key={index} style={{ marginRight: 8, marginBottom: 8 }}>
                    {tag}
                  </Tag>
                ))}
              </div>
            )}
          </div>

          {/* Featured Image */}
          {article.featuredImage && (
            <div style={{ marginBottom: 40, borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
              <LazyImage
                src={article.featuredImage}
                alt={article.title}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          )}

          {/* Excerpt */}
          {article.excerpt && (
            <Paragraph
              style={{
                fontSize: '20px',
                color: config.colors.subtext,
                marginBottom: 40,
                fontStyle: 'italic',
                lineHeight: 1.6,
                paddingLeft: 20,
                borderLeft: `4px solid ${config.colors.primary}`,
              }}
            >
              {article.excerpt.replace(/<[^>]*>/g, '')}
            </Paragraph>
          )}

          {/* Article Content */}
          <div
            dangerouslySetInnerHTML={{ __html: article.content }}
            style={{
              lineHeight: 1.8,
              fontSize: 'clamp(16px, 4vw, 18px)',
              color: config.colors.text,
            }}
            className="article-content fade-in"
          />

          {/* Share Section */}
          <Divider style={{ margin: '40px 0' }} />
          <div style={{ marginBottom: 40 }}>
            <Typography.Text strong style={{ color: config.colors.text, marginRight: 16, fontSize: 16 }}>
              分享文章：
            </Typography.Text>
            <ShareButtons
              title={article.title}
              url={`/blog/${article.id}`}
              description={article.excerpt || undefined}
              image={article.featuredImage || undefined}
            />
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section style={{ marginTop: 60, paddingTop: 40, borderTop: `1px solid ${config.colors.border}` }}>
            <Title level={3} style={{ marginBottom: 32, fontSize: 28, fontWeight: 'bold', color: config.colors.text }}>
              相关文章
            </Title>
            <Row gutter={[24, 24]}>
              {relatedArticles.map((related) => (
                <Col xs={24} sm={12} key={related.id}>
                  <Link href={`/blog/${related.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Card
                      hoverable
                      style={{
                        borderRadius: 8,
                        border: `1px solid ${config.colors.border}`,
                        transition: 'all 0.3s ease',
                      }}
                      bodyStyle={{ padding: 20 }}
                    >
                      {related.featuredImage && (
                        <div style={{ height: 150, borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
                          <LazyImage
                            src={related.featuredImage}
                            alt={related.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      <Title
                        level={5}
                        style={{
                          margin: 0,
                          marginBottom: 8,
                          fontSize: 16,
                          fontWeight: 'bold',
                          color: config.colors.text,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {related.title}
                      </Title>
                      {related.publishDate && (
                        <div style={{ fontSize: 12, color: config.colors.subtext }}>
                          {new Date(related.publishDate).toLocaleDateString('zh-CN')}
                        </div>
                      )}
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer style={{ background: config.colors.text, color: '#fff', padding: '60px 24px 20px', marginTop: 80 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: 0 }}>
            © {new Date().getFullYear()} Ediora. All rights reserved.
          </p>
        </div>
      </footer>

      <BackToTop color={config.colors.primary} />
    </div>
  )
}


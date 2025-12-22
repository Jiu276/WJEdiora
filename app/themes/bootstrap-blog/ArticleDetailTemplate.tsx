'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Typography, Button, Tag, Space, Row, Col, Divider } from 'antd'
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
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <ReadingProgress color="#000" />

      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 0',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '24px', fontWeight: 'bold', color: '#000', textDecoration: 'none' }}>
            Bootstrap Blog
          </Link>
          <nav style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <Link href="/" style={{ color: '#000', textDecoration: 'none', fontSize: '14px' }}>Home</Link>
            <Link href="/blog" style={{ color: '#000', textDecoration: 'none', fontSize: '14px' }}>Blog</Link>
            <Link href="/archive" style={{ color: '#000', textDecoration: 'none', fontSize: '14px' }}>Archive</Link>
            <Link href="/admin" style={{ color: '#000', textDecoration: 'none', fontSize: '14px' }}>Admin</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
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
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: config.colors.primary, marginBottom: 16, letterSpacing: '1px' }}>
              {article.category.name.toUpperCase()}
            </div>
          )}
          
          <Title
            level={1}
            style={{
              marginBottom: 24,
              color: '#000',
              fontSize: 'clamp(32px, 5vw, 48px)',
              lineHeight: 1.2,
              fontWeight: 'bold',
            }}
          >
            {article.title}
          </Title>

          {/* Meta Information */}
          <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #e5e7eb' }}>
            <Space size="large" style={{ fontSize: '14px', color: '#666' }}>
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
            <div style={{ marginBottom: 40, borderRadius: 8, overflow: 'hidden' }}>
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
                color: '#666',
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
              color: '#333',
            }}
            className="article-content"
          />

          {/* Share Section */}
          <Divider style={{ margin: '40px 0' }} />
          <div style={{ marginBottom: 40 }}>
            <Typography.Text strong style={{ color: '#000', marginRight: 16, fontSize: 16 }}>
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
          <section style={{ marginTop: 60, paddingTop: 40, borderTop: '1px solid #e5e7eb' }}>
            <Title level={3} style={{ marginBottom: 32, fontSize: 28, fontWeight: 'bold' }}>
              相关文章
            </Title>
            <Row gutter={[24, 24]}>
              {relatedArticles.map((related) => (
                <Col xs={24} sm={12} key={related.id}>
                  <Link href={`/blog/${related.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ display: 'flex', gap: 16, padding: 16, borderRadius: 8, border: '1px solid #e5e7eb', transition: 'all 0.3s', cursor: 'pointer' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      {related.featuredImage && (
                        <div style={{ width: 120, height: 80, borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
                          <LazyImage
                            src={related.featuredImage}
                            alt={related.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Title
                          level={5}
                          style={{
                            margin: 0,
                            marginBottom: 8,
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: '#000',
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
                          <div style={{ fontSize: 12, color: '#999' }}>
                            {new Date(related.publishDate).toLocaleDateString('zh-CN')}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </Col>
              ))}
            </Row>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer style={{ background: '#1a1a1a', color: '#fff', padding: '60px 24px 20px', marginTop: 80 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#999', fontSize: '14px', margin: 0 }}>
            © {new Date().getFullYear()}. All rights reserved. Bootstrap Blog.
          </p>
        </div>
      </footer>

      <BackToTop color="#000" />
    </div>
  )
}


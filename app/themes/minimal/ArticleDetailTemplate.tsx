'use client'

import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Typography, Button, Tag, Space, List, Divider, Card } from 'antd'
import { ArrowLeftOutlined, LinkOutlined, EyeOutlined } from '@ant-design/icons'
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
  publishDate: string | null
}

interface ArticleDetailTemplateProps {
  article: Article
  customDomains: CustomDomain[]
  links: ArticleLink[]
  relatedArticles: RelatedArticle[]
  config: ThemeConfig
}

export default function MinimalArticleDetailTemplate({
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
    <div style={{ minHeight: '100vh', background: config.colors.background, padding: 'clamp(30px, 8vw, 60px) clamp(16px, 4vw, 20px)' }}>
      <ReadingProgress color={config.colors.primary} />
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* 极简头部 */}
        <header style={{ textAlign: 'center', marginBottom: 60, borderBottom: `1px solid ${config.colors.border}`, paddingBottom: 40 }}>
          <Link href="/blog" style={{ textDecoration: 'none' }}>
            <Title
              level={1}
              style={{
                marginBottom: 16,
                color: config.colors.text,
                fontWeight: 300,
                letterSpacing: '2px',
              }}
            >
              Ediora
            </Title>
          </Link>
          <div style={{ marginTop: 20 }}>
            <Link href="/blog" style={{ marginRight: 24, color: config.colors.subtext, textDecoration: 'none', fontSize: 14 }}>
              Articles
            </Link>
            <Link href="/archive" style={{ marginRight: 24, color: config.colors.subtext, textDecoration: 'none', fontSize: 14 }}>
              Archive
            </Link>
            <Link href="/admin" style={{ color: config.colors.subtext, textDecoration: 'none', fontSize: 14 }}>
              Admin
            </Link>
          </div>
        </header>

        {/* Back button */}
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/blog')}
          style={{ marginBottom: 40, color: config.colors.subtext }}
        >
          Back to list
        </Button>

        {/* 文章内容 */}
        <article style={{ borderBottom: `1px solid ${config.colors.border}`, paddingBottom: 40, marginBottom: 40 }}>
          <Title
            level={1}
            style={{
              marginBottom: 24,
              color: config.colors.text,
              fontWeight: 400,
              fontSize: 'clamp(24px, 6vw, 36px)',
              lineHeight: 1.3,
            }}
          >
            {article.title}
          </Title>

          <div style={{ marginBottom: 32, color: config.colors.subtext, fontSize: 14 }}>
            <Space size="middle" split={<span>·</span>}>
              <span>✍️ {article.author}</span>
              {article.publishDate && (
                <span>📅 {new Date(article.publishDate).toLocaleString('en-US')}</span>
              )}
              {article.viewCount !== undefined && (
                <span>
                  <EyeOutlined style={{ marginRight: 4 }} />
                  {article.viewCount} views
                </span>
              )}
              {article.category && (
                <Tag
                  color={config.colors.primary}
                  style={{ border: 'none', background: 'transparent', color: config.colors.primary }}
                >
                  {article.category.name}
                </Tag>
              )}
            </Space>
            {article.tags && article.tags.length > 0 && (
              <div style={{ marginTop: 12 }}>
                {article.tags.map((tag, index) => (
                  <Tag
                    key={index}
                    style={{
                      marginRight: 8,
                      marginBottom: 4,
                      border: 'none',
                      background: 'transparent',
                      color: config.colors.subtext,
                    }}
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
            )}
          </div>

          {headings.length > 0 && <ArticleTocCard headings={headings} config={config} onNavigate={scrollToHeading} />}

          {article.excerpt && (
            <Paragraph
              style={{
                fontSize: '18px',
                color: config.colors.subtext,
                marginBottom: 40,
                fontStyle: 'italic',
                borderLeft: `3px solid ${config.colors.primary}`,
                paddingLeft: 16,
              }}
            >
              {article.excerpt}
            </Paragraph>
          )}

          <div
            dangerouslySetInnerHTML={{ __html: htmlWithIds }}
            style={{
              lineHeight: 1.9,
              fontSize: 'clamp(15px, 4vw, 17px)',
              color: config.colors.text,
            }}
            className="article-content"
          />

          <Divider style={{ margin: '32px 0' }} />

          <div style={{ marginTop: 24 }}>
            <Typography.Text strong style={{ color: config.colors.text, marginRight: 16, fontSize: 14 }}>
              Share:
            </Typography.Text>
            <ShareButtons
              title={article.title}
              url={`/blog/${article.id}`}
              description={article.excerpt || undefined}
              image={article.featuredImage || undefined}
            />
          </div>
        </article>

        {/* Related links */}
        {links.length > 0 && (
          <div style={{ marginBottom: 40, borderBottom: `1px solid ${config.colors.border}`, paddingBottom: 40 }}>
            <Title level={4} style={{ marginBottom: 16, color: config.colors.text, fontSize: 18 }}>
              Related links
            </Title>
            <List
              dataSource={links}
              renderItem={(link) => (
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
          </div>
        )}

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div style={{ marginBottom: 40, borderBottom: `1px solid ${config.colors.border}`, paddingBottom: 40 }}>
            <Title level={4} style={{ marginBottom: 24, color: config.colors.text, fontSize: 18 }}>
              Related articles
            </Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div>
                    <Title
                      level={4}
                      style={{
                        marginBottom: 8,
                        color: config.colors.text,
                        fontWeight: 400,
                        fontSize: 20,
                      }}
                    >
                      {related.title}
                    </Title>
                    {related.excerpt && (
                      <Paragraph
                        ellipsis={{ rows: 2 }}
                        style={{ color: config.colors.subtext, fontSize: 14, marginBottom: 8 }}
                      >
                        {related.excerpt}
                      </Paragraph>
                    )}
                    {related.publishDate && (
                      <span style={{ color: config.colors.subtext, fontSize: 12 }}>
                        {new Date(related.publishDate).toLocaleDateString('en-US')}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 极简页脚 */}
        <footer style={{ marginTop: 80, textAlign: 'center', paddingTop: 40, borderTop: `1px solid ${config.colors.border}` }}>
          <Paragraph style={{ color: config.colors.subtext, fontSize: 12, margin: 0 }}>
            © {new Date().getFullYear()} Ediora
          </Paragraph>
        </footer>
      </div>

      <BackToTop color={config.colors.primary} />
    </div>
  )
}


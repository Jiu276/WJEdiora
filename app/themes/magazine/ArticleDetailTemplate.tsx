'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Typography, Button, Card, Tag, Space, Row, Col, List, Divider } from 'antd'
import { ArrowLeftOutlined, LinkOutlined, EyeOutlined, FireOutlined } from '@ant-design/icons'
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

export default function MagazineArticleDetailTemplate({
  article,
  customDomains,
  links,
  relatedArticles,
  config,
}: ArticleDetailTemplateProps) {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: config.colors.background }}>
      <ReadingProgress color={config.colors.primary} />
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/blog" style={{ textDecoration: 'none' }}>
              <Title level={2} style={{ margin: 0, color: config.colors.primary, fontWeight: 700 }}>
                Ediora
              </Title>
            </Link>
            <div>
              <Link href="/blog" style={{ marginRight: 24, color: config.colors.text, textDecoration: 'none', fontWeight: 500 }}>
                文章列表
              </Link>
              <Link href="/archive" style={{ marginRight: 24, color: config.colors.subtext, textDecoration: 'none' }}>
                归档
              </Link>
              <Link href="/admin" style={{ color: config.colors.subtext, textDecoration: 'none' }}>
                管理
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/blog')}
          style={{ marginBottom: 32 }}
        >
          Back to list
        </Button>

        <Card
          style={{
            borderRadius: 12,
            overflow: 'hidden',
            border: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            background: config.colors.cardBackground,
          }}
        >
          {article.featuredImage && (
            <LazyImage
              src={article.featuredImage}
              alt={article.title}
              style={{
                width: '100%',
                height: 450,
                objectFit: 'cover',
                marginBottom: 32,
              }}
            />
          )}

          <div style={{ padding: '0 24px 24px' }}>
            <Space style={{ marginBottom: 16 }}>
              <Tag icon={<FireOutlined />} color={config.colors.primary} style={{ fontSize: 12 }}>
                精选
              </Tag>
              {article.category && (
                <Tag color="default">{article.category.name}</Tag>
              )}
            </Space>

            <Title level={1} style={{ marginBottom: 24, color: config.colors.text, fontSize: 42, fontWeight: 700, lineHeight: 1.2 }}>
              {article.title}
            </Title>

            <div
              style={{
                marginBottom: 32,
                color: config.colors.subtext,
                paddingBottom: 24,
                borderBottom: `2px solid ${config.colors.border}`,
              }}
            >
              <Space size="large" style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 15 }}>✍️ 作者: {article.author}</span>
                {article.publishDate && (
                  <span style={{ fontSize: 15 }}>
                    📅 发布时间: {new Date(article.publishDate).toLocaleString('zh-CN')}
                  </span>
                )}
                {article.viewCount !== undefined && (
                  <Space style={{ fontSize: 15 }}>
                    <EyeOutlined />
                    <span>{article.viewCount} 次阅读</span>
                  </Space>
                )}
              </Space>
              {article.tags && article.tags.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  {article.tags.map((tag, index) => (
                    <Tag key={index} style={{ marginBottom: 4, fontSize: 13 }}>
                      {tag}
                    </Tag>
                  ))}
                </div>
              )}
            </div>

            {article.excerpt && (
              <Paragraph
                style={{
                  fontSize: '20px',
                  color: config.colors.subtext,
                  marginBottom: 40,
                  fontStyle: 'italic',
                  borderLeft: `4px solid ${config.colors.primary}`,
                  paddingLeft: 20,
                  lineHeight: 1.7,
                }}
              >
                {article.excerpt}
              </Paragraph>
            )}

            <div
              dangerouslySetInnerHTML={{ __html: article.content }}
              style={{
                lineHeight: 1.9,
                fontSize: '17px',
                color: config.colors.text,
              }}
              className="article-content"
            />

            <Divider />

            <div style={{ marginTop: 24 }}>
              <Typography.Text strong style={{ color: config.colors.text, marginRight: 16 }}>
                分享文章：
              </Typography.Text>
              <ShareButtons
                title={article.title}
                url={`/blog/${article.id}`}
                description={article.excerpt || undefined}
                image={article.featuredImage || undefined}
              />
            </div>
          </div>
        </Card>

        {/* 关联域名 */}
        {customDomains.length > 0 && (
          <Card
            title="相关域名"
            style={{ marginTop: 32, borderRadius: 12, background: config.colors.cardBackground, borderColor: config.colors.border }}
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

        {/* 相关链接 */}
        {links.length > 0 && (
          <Card
            title="相关链接"
            style={{ marginTop: 32, borderRadius: 12, background: config.colors.cardBackground, borderColor: config.colors.border }}
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

        {/* 相关文章推荐 */}
        {relatedArticles.length > 0 && (
          <Card
            title="相关文章"
            style={{ marginTop: 32, borderRadius: 12, background: config.colors.cardBackground, borderColor: config.colors.border }}
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
                    onClick={() => router.push(`/blog/${related.id}`)}
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
                              {new Date(related.publishDate).toLocaleDateString('zh-CN')}
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
      </div>

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
            © {new Date().getFullYear()} Ediora. All rights reserved.
          </Paragraph>
        </div>
      </footer>

      <BackToTop color={config.colors.primary} />
    </div>
  )
}


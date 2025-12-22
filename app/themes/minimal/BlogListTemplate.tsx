'use client'

import { Typography, Empty, Skeleton, Pagination, Tag, Space } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'
import Link from 'next/link'
import type { ThemeConfig } from '@/lib/themeLoader'

const { Title, Paragraph } = Typography

interface Article {
  id: string
  title: string
  excerpt: string | null
  publishDate: string | null
  slug: string
  category?: {
    id: string
    name: string
    slug: string
  } | null
}

interface BlogListTemplateProps {
  articles: Article[]
  loading: boolean
  currentPage: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  config: ThemeConfig
}

export default function MinimalBlogListTemplate({
  articles,
  loading,
  currentPage,
  total,
  pageSize,
  onPageChange,
  config,
}: BlogListTemplateProps) {
  return (
    <div style={{ minHeight: '100vh', background: config.colors.background, padding: '60px 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* 极简头部 */}
        <header style={{ textAlign: 'center', marginBottom: 60, borderBottom: `1px solid ${config.colors.border}`, paddingBottom: 40 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Title
              level={1}
              style={{
                marginBottom: 16,
                color: config.colors.text,
                fontWeight: 300,
                letterSpacing: '2px',
              }}
            >
              文章列表
            </Title>
          </Link>
          <div style={{ marginTop: 20 }}>
            <Link href="/blog" style={{ marginRight: 24, color: config.colors.primary, textDecoration: 'none', fontSize: 14 }}>
              文章列表
            </Link>
            <Link href="/archive" style={{ marginRight: 24, color: config.colors.subtext, textDecoration: 'none', fontSize: 14 }}>
              归档
            </Link>
            <Link href="/admin" style={{ color: config.colors.subtext, textDecoration: 'none', fontSize: 14 }}>
              管理后台
            </Link>
          </div>
        </header>

        {/* 文章列表 - 极简风格 */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ borderBottom: `1px solid ${config.colors.border}`, paddingBottom: 40 }}>
                <Skeleton active paragraph={{ rows: 3 }} />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Paragraph style={{ color: config.colors.subtext, fontSize: 16 }}>
              暂无已发布的文章
            </Paragraph>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 60 }}>
            {articles.map((article) => (
              <article key={article.id} style={{ borderBottom: `1px solid ${config.colors.border}`, paddingBottom: 40 }}>
                <Link
                  href={`/blog/${article.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Title
                    level={2}
                    style={{
                      marginBottom: 16,
                      color: config.colors.text,
                      fontWeight: 400,
                      fontSize: 28,
                      lineHeight: 1.4,
                    }}
                  >
                    {article.title}
                  </Title>
                  {article.excerpt && (
                    <Paragraph
                      style={{
                        color: config.colors.subtext,
                        fontSize: 16,
                        lineHeight: 1.8,
                        marginBottom: 20,
                      }}
                    >
                      {article.excerpt.replace(/<[^>]*>/g, '').substring(0, 200)}...
                    </Paragraph>
                  )}
                  <Space size="middle" style={{ color: config.colors.subtext, fontSize: 14 }}>
                    {article.publishDate && (
                      <span>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {new Date(article.publishDate).toLocaleDateString('zh-CN')}
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
                </Link>
              </article>
            ))}
          </div>
        )}

        {/* 分页 */}
        {total > pageSize && (
          <div style={{ marginTop: 60, textAlign: 'center' }}>
            <Pagination
              current={currentPage}
              total={total}
              pageSize={pageSize}
              onChange={(page) => {
                onPageChange(page)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              showSizeChanger={false}
              showTotal={(total) => `共 ${total} 篇文章`}
              simple
            />
          </div>
        )}

        {/* 极简页脚 */}
        <footer style={{ marginTop: 100, textAlign: 'center', paddingTop: 40, borderTop: `1px solid ${config.colors.border}` }}>
          <Paragraph style={{ color: config.colors.subtext, fontSize: 12, margin: 0 }}>
            © {new Date().getFullYear()} Ediora
          </Paragraph>
        </footer>
      </div>
    </div>
  )
}


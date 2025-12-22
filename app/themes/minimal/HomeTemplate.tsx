'use client'

import { Typography, Space, Tag, Input } from 'antd'
import { SearchOutlined, CalendarOutlined } from '@ant-design/icons'
import Link from 'next/link'
import type { ThemeConfig } from '@/lib/themeLoader'

const { Title, Paragraph, Text } = Typography
const { Search } = Input

interface Article {
  id: string
  title: string
  excerpt: string | null
  slug: string
  publishDate: string | null
  category?: {
    name: string
  } | null
}

interface HomeTemplateProps {
  articles: Article[]
  config: ThemeConfig
  searchKeyword?: string
  onSearch?: (keyword: string) => void
}

export default function MinimalHomeTemplate({ articles, config, searchKeyword = '', onSearch }: HomeTemplateProps) {
  const handleSearch = (value: string) => {
    if (onSearch) {
      onSearch(value)
    } else {
      window.location.href = `/search?q=${encodeURIComponent(value)}`
    }
  }

  const filteredArticles = searchKeyword
    ? articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          (article.excerpt && article.excerpt.toLowerCase().includes(searchKeyword.toLowerCase()))
      )
    : articles

  return (
    <div style={{ minHeight: '100vh', background: config.colors.background, padding: '60px 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* 极简头部 */}
        <header style={{ textAlign: 'center', marginBottom: 80, borderBottom: `1px solid ${config.colors.border}`, paddingBottom: 40 }}>
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
              我的博客
            </Title>
          </Link>
          <Paragraph style={{ color: config.colors.subtext, fontSize: 14, margin: 0 }}>
            极简 · 专注 · 思考
          </Paragraph>
        </header>

        {/* 搜索框 */}
        <div style={{ marginBottom: 60, textAlign: 'center' }}>
          <Search
            placeholder="搜索..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchKeyword}
            onChange={(e) => {
              if (onSearch) onSearch(e.target.value)
            }}
            onSearch={handleSearch}
            style={{ maxWidth: 500, margin: '0 auto' }}
          />
        </div>

        {/* 文章列表 - 极简风格 */}
        {filteredArticles.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 60 }}>
            {filteredArticles.map((article) => (
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
                      <Tag color={config.colors.primary} style={{ border: 'none', background: 'transparent', color: config.colors.primary }}>
                        {article.category.name}
                      </Tag>
                    )}
                  </Space>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Paragraph style={{ color: config.colors.subtext, fontSize: 16 }}>
              {searchKeyword ? '未找到相关文章' : '暂无文章'}
            </Paragraph>
          </div>
        )}

        {/* 极简页脚 */}
        <footer style={{ marginTop: 100, textAlign: 'center', paddingTop: 40, borderTop: `1px solid ${config.colors.border}` }}>
          <Text style={{ color: config.colors.subtext, fontSize: 12 }}>
            © {new Date().getFullYear()} 我的博客
          </Text>
        </footer>
      </div>
    </div>
  )
}


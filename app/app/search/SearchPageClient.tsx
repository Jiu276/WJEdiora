'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Input, Card, Row, Col, Typography, Empty, Pagination, Tag, Space, Skeleton } from 'antd'
import { SearchOutlined, CalendarOutlined, FolderOutlined } from '@ant-design/icons'
import Link from 'next/link'
import LazyImage from '@/components/LazyImage'
import { debounce } from '@/lib/performance'
import type { ThemeConfig } from '@/lib/themeLoader'

const { Title, Paragraph } = Typography
const { Search } = Input

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featuredImage: string | null
  publishDate: string | null
  category?: {
    id: string
    name: string
    slug: string
  } | null
  author: string
}

interface SearchResults {
  articles: Article[]
  total: number
  page: number
  limit: number
  keyword: string
}

export default function SearchPageClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const keyword = searchParams.get('q') || ''

  const [searchKeyword, setSearchKeyword] = useState(keyword)
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [, setThemeSlug] = useState('default')
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null)

  const pageSize = 12

  useEffect(() => {
    fetchTheme()
    if (keyword) {
      performSearch(keyword, 1)
    }
  }, [])

  useEffect(() => {
    const newKeyword = searchParams.get('q') || ''
    if (newKeyword !== keyword) {
      setSearchKeyword(newKeyword)
      if (newKeyword) {
        performSearch(newKeyword, 1)
      } else {
        setResults(null)
      }
    }
  }, [searchParams])

  const fetchTheme = async () => {
    try {
      const res = await fetch('/api/theme/active', { cache: 'no-store' })
      if (res.ok) {
        const activeTheme = await res.json()
        if (activeTheme) {
          setThemeSlug(activeTheme.slug)
          setThemeConfig(activeTheme.config || null)
        }
      }
    } catch (error) {
      console.error('Error fetching theme:', error)
    }
  }

  const performSearch = useCallback(async (q: string, page: number) => {
    if (!q.trim()) {
      setResults(null)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&page=${page}&limit=${pageSize}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data)
        setCurrentPage(page)
      } else {
        console.error('Search failed:', res.status)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // 防抖搜索
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        if (value.trim()) {
          router.push(`/search?q=${encodeURIComponent(value)}`)
        }
      }, 500),
    [router]
  )

  const handleSearch = (value: string) => {
    debouncedSearch(value)
  }

  const handlePageChange = (page: number) => {
    if (keyword) {
      performSearch(keyword, page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // 如果没有主题配置，使用默认配置
  const config: ThemeConfig = themeConfig || {
    layout: 'boxed' as const,
    colors: {
      primary: '#1890ff',
      accent: '#722ed1',
      background: '#f5f5f5',
      cardBackground: '#ffffff',
      text: '#0f172a',
      subtext: '#475569',
      border: '#e5e7eb',
    },
    fonts: {
      heading: 'inherit',
      body: 'inherit',
    },
    features: {
      showSidebar: false,
      showCategories: true,
      showTags: true,
      showAuthor: true,
      showDate: true,
      showExcerpt: true,
    },
  }

  return (
    <div style={{ minHeight: '100vh', background: config.colors.background }}>
      {/* Header */}
      <div
        style={{
          background: config.colors.cardBackground,
          borderBottom: `1px solid ${config.colors.border}`,
          padding: '16px 0',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Link href="/" style={{ fontSize: '20px', fontWeight: 'bold', color: config.colors.primary, textDecoration: 'none' }}>
            Ediora
          </Link>
          <div style={{ flex: 1, maxWidth: 600, minWidth: 200 }}>
            <Search
              placeholder="Search articles..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={handleSearch}
            />
          </div>
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
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
        {!keyword ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <SearchOutlined style={{ fontSize: 64, color: config.colors.subtext, marginBottom: 24 }} />
            <Title level={2} style={{ color: config.colors.text, marginBottom: 16 }}>
              Search Articles
            </Title>
            <Paragraph style={{ color: config.colors.subtext, fontSize: 16 }}>
              Enter a keyword above to find articles.
            </Paragraph>
          </div>
        ) : loading ? (
          <Row gutter={[24, 24]}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Col xs={24} sm={12} lg={8} key={i}>
                <Card style={{ background: config.colors.cardBackground, borderColor: config.colors.border }}>
                  <Skeleton.Image active style={{ width: '100%', height: 200 }} />
                  <Skeleton active paragraph={{ rows: 2 }} />
                </Card>
              </Col>
            ))}
          </Row>
        ) : results && results.articles.length > 0 ? (
          <>
            <div style={{ marginBottom: 24 }}>
              <Title level={3} style={{ color: config.colors.text }}>
                Found {results.total} articles
                {keyword && (
                  <span style={{ color: config.colors.subtext, fontSize: 16, fontWeight: 400, marginLeft: 8 }}>
                    (keyword: &ldquo;{keyword}&rdquo;)
                  </span>
                )}
              </Title>
            </div>
            <Row gutter={[24, 24]}>
              {results.articles.map((article) => (
                <Col xs={24} sm={12} lg={8} key={article.id}>
                  <Link href={`/blog/${article.slug || article.id}`} style={{ textDecoration: 'none' }}>
                    <Card
                      hoverable
                      style={{
                        height: '100%',
                        borderRadius: 8,
                        background: config.colors.cardBackground,
                        borderColor: config.colors.border,
                      }}
                      cover={
                        article.featuredImage ? (
                          <LazyImage
                            src={article.featuredImage}
                            alt={article.title}
                            style={{ width: '100%', height: 200, objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: 200,
                              background: `linear-gradient(135deg, ${config.colors.primary} 0%, ${config.colors.accent} 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontSize: '16px',
                            }}
                          >
                            {article.title.charAt(0)}
                          </div>
                        )
                      }
                    >
                      <Card.Meta
                        title={
                          <Title level={4} style={{ marginBottom: 8, color: config.colors.text }}>
                            {article.title}
                          </Title>
                        }
                        description={
                          <div>
                            <Paragraph
                              ellipsis={{ rows: 2 }}
                              style={{ marginBottom: 8, color: config.colors.subtext }}
                            >
                              {article.excerpt
                                ? article.excerpt.replace(/<[^>]*>/g, '').substring(0, 100) + '...'
                                : 'No excerpt'}
                            </Paragraph>
                            <Space size="small">
                              {article.category && (
                                <Tag icon={<FolderOutlined />} color={config.colors.primary}>
                                  {article.category.name}
                                </Tag>
                              )}
                              {article.publishDate && (
                                <Tag icon={<CalendarOutlined />} color="default">
                                  {new Date(article.publishDate).toLocaleDateString('en-US')}
                                </Tag>
                              )}
                            </Space>
                          </div>
                        }
                      />
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
            {results.total > pageSize && (
              <div style={{ marginTop: 48, textAlign: 'center' }}>
                <Pagination
                  current={currentPage}
                  total={results.total}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showTotal={(total) => `Total ${total} articles`}
                />
              </div>
            )}
          </>
        ) : (
          <Empty
            description={
              <div>
                <Title level={4} style={{ color: config.colors.text, marginBottom: 8 }}>
                  No articles found
                </Title>
                <Paragraph style={{ color: config.colors.subtext }}>
                  Try another keyword.
                </Paragraph>
              </div>
            }
          />
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: 'center',
          padding: '48px 24px',
          color: config.colors.subtext,
          background: config.colors.cardBackground,
          marginTop: 48,
        }}
      >
        <p>© {new Date().getFullYear()} Ediora. All rights reserved.</p>
      </div>
    </div>
  )
}


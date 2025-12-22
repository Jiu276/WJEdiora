'use client'

import { useState, useEffect } from 'react'
import { Card, Row, Col, Typography, Empty, Skeleton, Pagination, Tag, Space, Input } from 'antd'
import { CalendarOutlined, FolderOutlined, SearchOutlined } from '@ant-design/icons'
import Link from 'next/link'
import LazyImage from '@/components/LazyImage'
import BackToTop from '@/components/BackToTop'
import type { ThemeConfig } from '@/lib/themeLoader'

const { Title, Paragraph } = Typography
const { Search } = Input

interface Article {
  id: string
  title: string
  excerpt: string | null
  slug: string
  featuredImage: string | null
  publishDate: string | null
  category?: {
    id: string
    name: string
    slug: string
  } | null
  author: string
  viewCount?: number
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

export default function BlogListTemplate({ 
  articles, 
  loading, 
  currentPage, 
  total, 
  pageSize, 
  onPageChange, 
  config 
}: BlogListTemplateProps) {
  const [searchKeyword, setSearchKeyword] = useState('')

  const handleSearch = (value: string) => {
    setSearchKeyword(value)
    window.location.href = `/search?q=${encodeURIComponent(value)}`
  }

  const filteredArticles = searchKeyword
    ? articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          (article.excerpt && article.excerpt.toLowerCase().includes(searchKeyword.toLowerCase()))
      )
    : articles

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
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
            <Link href="/blog" style={{ color: config.colors.primary, textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>Blog</Link>
            <Link href="/archive" style={{ color: '#000', textDecoration: 'none', fontSize: '14px' }}>Archive</Link>
            <Link href="/admin" style={{ color: '#000', textDecoration: 'none', fontSize: '14px' }}>Admin</Link>
            <Search
              placeholder="Search"
              onSearch={handleSearch}
              style={{ width: 200 }}
              allowClear
            />
            <span style={{ fontSize: '14px', color: '#666' }}>EN</span>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <Title level={1} style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: 16, color: '#000' }}>
            Blog Posts
          </Title>
          <Paragraph style={{ fontSize: '16px', color: '#666' }}>
            Discover our latest articles and insights
          </Paragraph>
        </div>

        {loading ? (
          <Row gutter={[32, 32]}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Col xs={24} sm={12} lg={8} key={i}>
                <Skeleton.Image active style={{ width: '100%', height: 200 }} />
                <Skeleton active paragraph={{ rows: 2 }} style={{ marginTop: 16 }} />
              </Col>
            ))}
          </Row>
        ) : filteredArticles.length === 0 ? (
          <Empty description="暂无已发布的文章" />
        ) : (
          <>
            <Row gutter={[32, 32]}>
              {filteredArticles.map((article) => (
                <Col xs={24} sm={12} lg={8} key={article.id}>
                  <Link href={`/blog/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Card
                      hoverable
                      style={{
                        height: '100%',
                        borderRadius: 8,
                        overflow: 'hidden',
                        border: 'none',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                      cover={
                        article.featuredImage ? (
                          <div style={{ height: 200, overflow: 'hidden' }}>
                            <LazyImage
                              src={article.featuredImage}
                              alt={article.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        ) : (
                          <div
                            style={{
                              height: 200,
                              background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.accent})`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontSize: 48,
                              fontWeight: 700,
                            }}
                          >
                            {article.title.charAt(0)}
                          </div>
                        )
                      }
                    >
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: config.colors.primary, marginBottom: 12, letterSpacing: '1px' }}>
                        {article.category?.name?.toUpperCase() || 'UNCATEGORIZED'}
                      </div>
                      <Title
                        level={4}
                        style={{
                          marginBottom: 12,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: 56,
                          color: '#000',
                          fontSize: 20,
                        }}
                      >
                        {article.title}
                      </Title>
                      <Paragraph
                        style={{
                          color: '#666',
                          minHeight: 60,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          fontSize: 14,
                          marginBottom: 16,
                        }}
                      >
                        {article.excerpt
                          ? article.excerpt.replace(/<[^>]*>/g, '').substring(0, 120) + '...'
                          : '点击阅读更多...'}
                      </Paragraph>
                      <Space size="small" style={{ fontSize: 12, color: '#999' }}>
                        <span><CalendarOutlined style={{ marginRight: 4 }} />{article.publishDate ? new Date(article.publishDate).toLocaleDateString('zh-CN') : ''}</span>
                        {article.category && (
                          <Tag icon={<FolderOutlined />} color={config.colors.primary} style={{ fontSize: 11, margin: 0 }}>
                            {article.category.name}
                          </Tag>
                        )}
                      </Space>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
            <div style={{ marginTop: 40, textAlign: 'center' }}>
              <Pagination
                current={currentPage}
                total={total}
                pageSize={pageSize}
                onChange={onPageChange}
                showSizeChanger={false}
              />
            </div>
          </>
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


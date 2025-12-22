'use client'

import { Typography, List, Tag, Empty, Skeleton, Space } from 'antd'
import { CalendarOutlined, FileTextOutlined } from '@ant-design/icons'
import Link from 'next/link'
import BackToTop from '@/components/BackToTop'
import type { ThemeConfig } from '@/lib/themeLoader'

const { Title } = Typography

interface Article {
  id: string
  title: string
  slug: string
  publishDate: string | null
  category?: {
    name: string
  } | null
}

interface ArchiveGroup {
  year: number
  month: number
  articles: Article[]
}

interface ArchiveTemplateProps {
  loading: boolean
  archiveGroups: ArchiveGroup[]
  yearStats: Map<number, number>
  config: ThemeConfig
}

export default function ArchiveTemplate({ loading, archiveGroups, yearStats, config }: ArchiveTemplateProps) {
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
            <Link href="/blog" style={{ color: '#000', textDecoration: 'none', fontSize: '14px' }}>Blog</Link>
            <Link href="/archive" style={{ color: config.colors.primary, textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>Archive</Link>
            <Link href="/admin" style={{ color: '#000', textDecoration: 'none', fontSize: '14px' }}>Admin</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <Title level={1} style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: 16, color: '#000' }}>
            文章归档
          </Title>
          <p style={{ fontSize: '16px', color: '#666' }}>
            按时间顺序浏览所有文章
          </p>
        </div>

        {loading ? (
          <Skeleton active paragraph={{ rows: 10 }} />
        ) : archiveGroups.length === 0 ? (
          <Empty description="暂无文章" />
        ) : (
          <div>
            {(() => {
              // 按年份分组
              const yearGroups = new Map<number, ArchiveGroup[]>()
              archiveGroups.forEach((group) => {
                if (!yearGroups.has(group.year)) {
                  yearGroups.set(group.year, [])
                }
                yearGroups.get(group.year)!.push(group)
              })

              return Array.from(yearGroups.entries())
                .sort(([a], [b]) => b - a)
                .map(([year, groups]) => (
                  <div key={year} style={{ marginBottom: 60 }}>
                    <Title
                      level={2}
                      style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        marginBottom: 32,
                        color: '#000',
                        paddingBottom: 16,
                        borderBottom: '2px solid #e5e7eb',
                      }}
                    >
                      {year} 年 ({yearStats.get(year) || 0} 篇)
                    </Title>

                    {groups
                      .sort((a, b) => b.month - a.month)
                      .map((monthGroup) => (
                        <div key={monthGroup.month} style={{ marginBottom: 40 }}>
                          <Title
                            level={3}
                            style={{
                              fontSize: '24px',
                              fontWeight: '600',
                              marginBottom: 20,
                              color: '#333',
                            }}
                          >
                            {monthGroup.month} 月 ({monthGroup.articles.length} 篇)
                          </Title>

                          <List
                            dataSource={monthGroup.articles}
                            renderItem={(article) => (
                              <List.Item
                                style={{
                                  padding: '16px 0',
                                  borderBottom: '1px solid #f0f0f0',
                                }}
                              >
                                <Link
                                  href={`/blog/${article.id}`}
                                  style={{ textDecoration: 'none', color: 'inherit', display: 'flex', width: '100%', alignItems: 'center', gap: 16 }}
                                >
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <Title
                                      level={4}
                                      style={{
                                        margin: 0,
                                        marginBottom: 8,
                                        fontSize: 18,
                                        fontWeight: '600',
                                        color: '#000',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {article.title}
                                    </Title>
                                    <Space size="middle" style={{ fontSize: 14, color: '#999' }}>
                                      {article.publishDate && (
                                        <span>
                                          <CalendarOutlined style={{ marginRight: 4 }} />
                                          {new Date(article.publishDate).toLocaleDateString('zh-CN')}
                                        </span>
                                      )}
                                      {article.category && (
                                        <Tag icon={<FileTextOutlined />} color={config.colors.primary} style={{ fontSize: 12, margin: 0 }}>
                                          {article.category.name}
                                        </Tag>
                                      )}
                                    </Space>
                                  </div>
                                </Link>
                              </List.Item>
                            )}
                          />
                        </div>
                      ))}
                  </div>
                ))
            })()}
          </div>
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


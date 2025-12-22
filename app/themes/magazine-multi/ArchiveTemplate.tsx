'use client'

import { Typography, List, Tag, Empty, Skeleton, Space, Card } from 'antd'
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
    <div style={{ minHeight: '100vh', background: config.colors.background }}>
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
            <Link href="/archive" style={{ color: config.colors.primary, textDecoration: 'none', fontSize: '15px', fontWeight: 500 }}>Archive</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <Title level={1} style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 'bold', marginBottom: 16, color: config.colors.text }}>
            文章归档
          </Title>
          <p style={{ fontSize: '16px', color: config.colors.subtext }}>
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
                  <Card
                    key={year}
                    style={{
                      marginBottom: 32,
                      borderRadius: 12,
                      border: `1px solid ${config.colors.border}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                  >
                    <Title
                      level={2}
                      style={{
                        fontSize: '28px',
                        fontWeight: 'bold',
                        marginBottom: 24,
                        color: config.colors.text,
                        paddingBottom: 16,
                        borderBottom: `2px solid ${config.colors.primary}`,
                      }}
                    >
                      {year} 年 ({yearStats.get(year) || 0} 篇)
                    </Title>

                    {groups
                      .sort((a, b) => b.month - a.month)
                      .map((monthGroup) => (
                        <div key={monthGroup.month} style={{ marginBottom: 32 }}>
                          <Title
                            level={3}
                            style={{
                              fontSize: '20px',
                              fontWeight: '600',
                              marginBottom: 16,
                              color: config.colors.text,
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
                                  borderBottom: `1px solid ${config.colors.border}`,
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
                                        fontSize: 16,
                                        fontWeight: '600',
                                        color: config.colors.text,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {article.title}
                                    </Title>
                                    <Space size="middle" style={{ fontSize: 12, color: config.colors.subtext }}>
                                      {article.publishDate && (
                                        <span>
                                          <CalendarOutlined style={{ marginRight: 4 }} />
                                          {new Date(article.publishDate).toLocaleDateString('zh-CN')}
                                        </span>
                                      )}
                                      {article.category && (
                                        <Tag icon={<FileTextOutlined />} color={config.colors.primary} style={{ fontSize: 11, margin: 0 }}>
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
                  </Card>
                ))
            })()}
          </div>
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


'use client'

import { Typography, List, Tag, Empty, Skeleton, Space } from 'antd'
import { CalendarOutlined, FileTextOutlined } from '@ant-design/icons'
import Link from 'next/link'
import type { ThemeConfig } from '@/lib/themeLoader'

const { Title } = Typography

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  publishDate: string | null
  category?: {
    id: string
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

export default function MinimalArchiveTemplate({
  loading,
  archiveGroups,
  yearStats,
  config,
}: ArchiveTemplateProps) {
  const getMonthName = (month: number) => {
    const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    return months[month - 1]
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: config.colors.background, padding: '60px 20px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      </div>
    )
  }

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
              文章归档
            </Title>
          </Link>
          <div style={{ marginTop: 20 }}>
            <Link href="/blog" style={{ marginRight: 24, color: config.colors.subtext, textDecoration: 'none', fontSize: 14 }}>
              文章列表
            </Link>
            <Link href="/archive" style={{ marginRight: 24, color: config.colors.primary, textDecoration: 'none', fontSize: 14 }}>
              归档
            </Link>
            <Link href="/admin" style={{ color: config.colors.subtext, textDecoration: 'none', fontSize: 14 }}>
              管理后台
            </Link>
          </div>
        </header>

        {/* 年度统计 */}
        {yearStats.size > 0 && (
          <div style={{ marginBottom: 60, borderBottom: `1px solid ${config.colors.border}`, paddingBottom: 40 }}>
            <Title level={4} style={{ marginBottom: 24, color: config.colors.text, fontSize: 18 }}>
              年度统计
            </Title>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {Array.from(yearStats.entries())
                .sort((a, b) => b[0] - a[0])
                .map(([year, count]) => (
                  <div
                    key={year}
                    onClick={() => {
                      const element = document.getElementById(`year-${year}`)
                      element?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    style={{
                      padding: '16px 24px',
                      border: `1px solid ${config.colors.border}`,
                      borderRadius: 4,
                      cursor: 'pointer',
                      textAlign: 'center',
                      minWidth: 100,
                    }}
                  >
                    <div style={{ fontSize: '20px', fontWeight: 400, color: config.colors.primary }}>
                      {year}
                    </div>
                    <div style={{ color: config.colors.subtext, fontSize: 14, marginTop: 4 }}>
                      {count} 篇
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 归档列表 */}
        {archiveGroups.length === 0 ? (
          <Empty description="暂无已发布的文章" />
        ) : (
          <div>
            {archiveGroups.map((group, index) => {
              const isNewYear = index === 0 || archiveGroups[index - 1].year !== group.year

              return (
                <div key={`${group.year}-${group.month}`} id={isNewYear ? `year-${group.year}` : undefined}>
                  {isNewYear && (
                    <Title
                      level={2}
                      style={{
                        marginTop: index > 0 ? 60 : 0,
                        marginBottom: 32,
                        color: config.colors.text,
                        fontWeight: 400,
                        fontSize: 32,
                      }}
                    >
                      {group.year} 年
                    </Title>
                  )}
                  <div
                    style={{
                      marginBottom: 40,
                      borderBottom: `1px solid ${config.colors.border}`,
                      paddingBottom: 32,
                    }}
                  >
                    <div style={{ marginBottom: 20, color: config.colors.text, fontSize: 18 }}>
                      <CalendarOutlined style={{ marginRight: 8 }} />
                      {group.year} 年 {getMonthName(group.month)} · {group.articles.length} 篇
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {group.articles.map((article) => (
                        <Link
                          key={article.id}
                          href={`/blog/${article.id}`}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <div
                            style={{
                              padding: '16px 0',
                              borderBottom: `1px solid ${config.colors.border}`,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                              <FileTextOutlined style={{ color: config.colors.primary, fontSize: 16 }} />
                              <span style={{ color: config.colors.text, fontSize: 16, fontWeight: 400 }}>
                                {article.title}
                              </span>
                            </div>
                            <div style={{ marginLeft: 28, marginTop: 8 }}>
                              <Space size="middle" style={{ color: config.colors.subtext, fontSize: 14 }}>
                                {article.category && (
                                  <Tag
                                    color={config.colors.primary}
                                    style={{ border: 'none', background: 'transparent', color: config.colors.primary }}
                                  >
                                    {article.category.name}
                                  </Tag>
                                )}
                                {article.publishDate && (
                                  <span>{new Date(article.publishDate).toLocaleDateString('zh-CN')}</span>
                                )}
                              </Space>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 极简页脚 */}
        <footer style={{ marginTop: 100, textAlign: 'center', paddingTop: 40, borderTop: `1px solid ${config.colors.border}` }}>
          <div style={{ color: config.colors.subtext, fontSize: 12 }}>
            © {new Date().getFullYear()} Ediora
          </div>
        </footer>
      </div>
    </div>
  )
}


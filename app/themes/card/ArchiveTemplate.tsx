'use client'

import { Card, Row, Col, Typography, List, Tag, Empty, Skeleton, Space } from 'antd'
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

export default function CardArchiveTemplate({
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
      <div style={{ minHeight: '100vh', background: config.colors.background, padding: '24px' }}>
        <div
          style={{
            background: config.colors.cardBackground,
            borderRadius: 16,
            padding: '20px 32px',
            marginBottom: 32,
          }}
        >
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <Skeleton.Input active size="large" style={{ width: 200 }} />
          </div>
        </div>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: config.colors.background, padding: '24px' }}>
      {/* 头部导航 */}
      <header
        style={{
          background: config.colors.cardBackground,
          borderRadius: 16,
          padding: '20px 32px',
          marginBottom: 32,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Title level={2} style={{ margin: 0, color: config.colors.primary, fontWeight: 700 }}>
                Ediora
              </Title>
            </Link>
            <div>
              <Link href="/blog" style={{ marginRight: 24, color: config.colors.text, textDecoration: 'none', fontWeight: 500 }}>
                文章列表
              </Link>
              <Link href="/archive" style={{ marginRight: 24, color: config.colors.primary, textDecoration: 'none', fontWeight: 500 }}>
                归档
              </Link>
              <Link href="/admin" style={{ color: config.colors.subtext, textDecoration: 'none' }}>
                管理
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <Title level={1} style={{ textAlign: 'center', marginBottom: 48, color: config.colors.text }}>
          <CalendarOutlined style={{ marginRight: 8 }} />
          文章归档
        </Title>

        {/* 年度统计 */}
        {yearStats.size > 0 && (
          <Card
            style={{
              marginBottom: 40,
              background: config.colors.cardBackground,
              border: 'none',
              borderRadius: 20,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            }}
          >
            <Title level={4} style={{ marginBottom: 24, color: config.colors.text }}>
              年度统计
            </Title>
            <Row gutter={[20, 20]}>
              {Array.from(yearStats.entries())
                .sort((a, b) => b[0] - a[0])
                .map(([year, count]) => (
                  <Col xs={12} sm={8} md={6} lg={4} key={year}>
                    <Card
                      hoverable
                      style={{
                        textAlign: 'center',
                        cursor: 'pointer',
                        borderRadius: 16,
                        background: config.colors.cardBackground,
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                      onClick={() => {
                        const element = document.getElementById(`year-${year}`)
                        element?.scrollIntoView({ behavior: 'smooth' })
                      }}
                    >
                      <div style={{ fontSize: '28px', fontWeight: 700, color: config.colors.primary }}>
                        {year}
                      </div>
                      <div style={{ color: config.colors.subtext, marginTop: 8, fontSize: 14 }}>
                        {count} 篇
                      </div>
                    </Card>
                  </Col>
                ))}
            </Row>
          </Card>
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
                        fontSize: 36,
                        fontWeight: 700,
                      }}
                    >
                      {group.year} 年
                    </Title>
                  )}
                  <Card
                    style={{
                      marginBottom: 32,
                      background: config.colors.cardBackground,
                      border: 'none',
                      borderRadius: 20,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    }}
                    title={
                      <Space>
                        <CalendarOutlined />
                        <span style={{ color: config.colors.text, fontWeight: 600, fontSize: 16 }}>
                          {group.year} 年 {getMonthName(group.month)}
                        </span>
                        <Tag
                          color={config.colors.primary}
                          style={{
                            borderRadius: 20,
                            padding: '4px 12px',
                            fontSize: 12,
                            fontWeight: 500,
                          }}
                        >
                          {group.articles.length} 篇
                        </Tag>
                      </Space>
                    }
                  >
                    <List
                      dataSource={group.articles}
                      renderItem={(article) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<FileTextOutlined style={{ fontSize: '20px', color: config.colors.primary }} />}
                            title={
                              <Link
                                href={`/blog/${article.id}`}
                                style={{ fontSize: '16px', color: config.colors.text, textDecoration: 'none', fontWeight: 500 }}
                              >
                                {article.title}
                              </Link>
                            }
                            description={
                              <Space>
                                {article.category && (
                                  <Tag
                                    color={config.colors.primary}
                                    style={{
                                      borderRadius: 20,
                                      padding: '4px 12px',
                                      fontSize: 12,
                                    }}
                                  >
                                    {article.category.name}
                                  </Tag>
                                )}
                                {article.publishDate && (
                                  <span style={{ color: config.colors.subtext, fontSize: '12px' }}>
                                    {new Date(article.publishDate).toLocaleDateString('zh-CN')}
                                  </span>
                                )}
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 页脚 */}
      <footer
        style={{
          background: config.colors.cardBackground,
          borderRadius: 16,
          padding: '40px 0',
          marginTop: 64,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px', textAlign: 'center' }}>
          <div style={{ color: config.colors.subtext, fontSize: 15 }}>
            © {new Date().getFullYear()} Ediora. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}


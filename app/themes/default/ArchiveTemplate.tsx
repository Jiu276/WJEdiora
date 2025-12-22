'use client'

import { Card, Row, Col, Typography, List, Tag, Empty, Skeleton, Space } from 'antd'
import { CalendarOutlined, FileTextOutlined } from '@ant-design/icons'
import Link from 'next/link'
import BackToTop from '@/components/BackToTop'
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

export default function ArchiveTemplate({
  loading,
  archiveGroups,
  yearStats,
  config,
}: ArchiveTemplateProps) {
  const getMonthName = (month: number) => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]
    return months[month - 1]
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: config.colors.background }}>
        <div
          style={{
            background: config.colors.cardBackground,
            borderBottom: `1px solid ${config.colors.border}`,
            padding: '16px 0',
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <Skeleton.Input active size="large" style={{ width: 200 }} />
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      </div>
    )
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
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '20px', fontWeight: 'bold', color: config.colors.primary, textDecoration: 'none' }}>
            Ediora
          </Link>
          <div>
            <Link href="/blog" style={{ marginRight: 16, color: config.colors.subtext, textDecoration: 'none' }}>
              Articles
            </Link>
            <Link href="/archive" style={{ color: config.colors.primary, textDecoration: 'none' }}>
              Archive
            </Link>
            <Link href="/admin" style={{ marginLeft: 16, color: config.colors.subtext, textDecoration: 'none' }}>
              Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
        <Title level={1} style={{ textAlign: 'center', marginBottom: 48, color: config.colors.text }}>
          <CalendarOutlined style={{ marginRight: 8 }} />
          Archive
        </Title>

        {/* 年度统计 */}
        {yearStats.size > 0 && (
          <Card
            style={{
              marginBottom: 32,
              background: config.colors.cardBackground,
              borderColor: config.colors.border,
            }}
          >
            <Title level={4} style={{ marginBottom: 16, color: config.colors.text }}>
              Yearly stats
            </Title>
            <Row gutter={[16, 16]}>
              {Array.from(yearStats.entries())
                .sort((a, b) => b[0] - a[0])
                .map(([year, count]) => (
                  <Col xs={12} sm={8} md={6} lg={4} key={year}>
                    <Card
                      hoverable
                      style={{
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: config.colors.cardBackground,
                        borderColor: config.colors.border,
                      }}
                      onClick={() => {
                        const element = document.getElementById(`year-${year}`)
                        element?.scrollIntoView({ behavior: 'smooth' })
                      }}
                    >
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: config.colors.primary }}>
                        {year}
                      </div>
                      <div style={{ color: config.colors.subtext, marginTop: 8 }}>
                        {count} articles
                      </div>
                    </Card>
                  </Col>
                ))}
            </Row>
          </Card>
        )}

        {/* Archive list */}
        {archiveGroups.length === 0 ? (
          <Empty description="No published articles" />
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
                        marginTop: index > 0 ? 48 : 0,
                        marginBottom: 24,
                        color: config.colors.text,
                      }}
                    >
                      {group.year}
                    </Title>
                  )}
                  <Card
                    style={{
                      marginBottom: 24,
                      background: config.colors.cardBackground,
                      borderColor: config.colors.border,
                    }}
                    title={
                      <Space>
                        <CalendarOutlined />
                        <span style={{ color: config.colors.text }}>
                          {group.year} {getMonthName(group.month)}
                        </span>
                        <Tag color={config.colors.primary}>
                          {group.articles.length} articles
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
                                style={{ fontSize: '16px', color: config.colors.text, textDecoration: 'none' }}
                              >
                                {article.title}
                              </Link>
                            }
                            description={
                              <Space>
                                {article.category && (
                                  <Tag color={config.colors.primary}>{article.category.name}</Tag>
                                )}
                                {article.publishDate && (
                                  <span style={{ color: config.colors.subtext, fontSize: '12px' }}>
                                    {new Date(article.publishDate).toLocaleDateString('en-US')}
                                  </span>
                                )}
                                {article.excerpt && (
                                  <span style={{ color: config.colors.subtext }}>
                                    {article.excerpt.length > 100
                                      ? article.excerpt.substring(0, 100) + '...'
                                      : article.excerpt}
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

      <BackToTop color={config.colors.primary} />
    </div>
  )
}


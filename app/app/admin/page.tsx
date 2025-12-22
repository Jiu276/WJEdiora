'use client'

import { Card, Row, Col, Statistic, List, Typography, Skeleton, Tag, Space } from 'antd'
import { 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  RocketOutlined,
  CalendarOutlined,
  TagsOutlined,
  BarChartOutlined,
} from '@ant-design/icons'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const { Title } = Typography

interface Article {
  id: string
  title: string
  status: 'draft' | 'published'
  createdAt: string
  publishDate: string | null
  category?: {
    id: string
    name: string
  } | null
}

interface DashboardStats {
  total: number
  published: number
  drafts: number
  scheduled: number
  todayPublished: number
  totalViews: number
  totalTags: number
  totalCategories: number
  categoryStats: Array<{ name: string; count: number }>
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    published: 0,
    drafts: 0,
    scheduled: 0,
    todayPublished: 0,
    totalViews: 0,
    totalTags: 0,
    totalCategories: 0,
    categoryStats: [],
  })
  const [recentArticles, setRecentArticles] = useState<Article[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [articlesRes, categoriesRes, tagsRes] = await Promise.all([
        fetch('/api/articles'),
        fetch('/api/categories'),
        fetch('/api/tags'),
      ])
      
      const articles: Article[] = await articlesRes.json()
      const categories = await categoriesRes.json()
      const tags = await tagsRes.json()
      
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      // 计算统计数据
      const published = articles.filter((a) => a.status === 'published')
      const drafts = articles.filter((a) => a.status === 'draft')
      const scheduled = articles.filter(
        (a) => a.status === 'draft' && a.publishDate && new Date(a.publishDate) > now
      )
      const todayPublished = published.filter(
        (a) => a.publishDate && new Date(a.publishDate) >= todayStart
      )
      
      // 计算总阅读量（需要从文章详情获取 viewCount）
      const totalViews = published.reduce((sum, article) => {
        return sum + ((article as any).viewCount || 0)
      }, 0)
      
      // 按类别统计
      const categoryMap = new Map<string, string>(categories.map((c: any) => [String(c.id), String(c.name)]))
      const categoryCounts = new Map<string, number>()
      
      articles.forEach((article) => {
        if ((article as any).categoryId && article.status === 'published') {
          const categoryId = String((article as any).categoryId)
          const categoryName = categoryMap.get(categoryId) || '未分类'
          const currentCount = categoryCounts.get(categoryName) ?? 0
          categoryCounts.set(categoryName, currentCount + 1)
        }
      })
      
      const categoryStats = Array.from(categoryCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
      
      setStats({
        total: articles.length,
        published: published.length,
        drafts: drafts.length,
        scheduled: scheduled.length,
        todayPublished: todayPublished.length,
        totalViews,
        totalTags: tags.length || 0,
        totalCategories: categories.length || 0,
        categoryStats,
      })
      
      setRecentArticles(articles.slice(0, 10))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <Title level={2}>仪表盘</Title>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          {[1, 2, 3, 4].map((i) => (
            <Col span={6} key={i}>
              <Card>
                <Skeleton active paragraph={{ rows: 1 }} />
              </Card>
            </Col>
          ))}
        </Row>
        <Card title="最近文章">
          <Skeleton active paragraph={{ rows: 5 }} />
        </Card>
      </div>
    )
  }

  return (
    <div>
      <Title level={2}>仪表盘</Title>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总文章数"
              value={stats.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已发布"
              value={stats.published}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="草稿"
              value={stats.drafts}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="定时发布"
              value={stats.scheduled}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日发布"
              value={stats.todayPublished}
              prefix={<RocketOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总阅读量"
              value={stats.totalViews}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="标签数"
              value={stats.totalTags}
              prefix={<TagsOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="分类数"
              value={stats.totalCategories}
              prefix={<TagsOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="最近文章" extra={<Link href="/admin/articles">查看全部</Link>}>
            <List
              dataSource={recentArticles}
              renderItem={(article) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Link href={`/admin/articles/${article.id}`}>
                        {article.title}
                      </Link>
                    }
                    description={
                      <Space>
                        <Tag color={article.status === 'published' ? 'green' : 'orange'}>
                          {article.status === 'published' ? '已发布' : '草稿'}
                        </Tag>
                        {article.category && (
                          <Tag color="blue">{article.category.name}</Tag>
                        )}
                        <span style={{ color: '#999', fontSize: '12px' }}>
                          {new Date(article.createdAt).toLocaleString()}
                        </span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: '暂无文章' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <BarChartOutlined />
                <span>标签类别分布</span>
              </Space>
            }
            extra={<Link href="/admin/categories">管理类别</Link>}
          >
            {stats.categoryStats.length > 0 ? (
              <List
                dataSource={stats.categoryStats}
                renderItem={(item) => (
                  <List.Item>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Space>
                        <TagsOutlined />
                        <span>{item.name}</span>
                      </Space>
                      <Tag color="blue">{item.count} 篇</Tag>
                    </Space>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                暂无统计数据
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}


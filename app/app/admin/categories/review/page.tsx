'use client'

import { useState, useEffect } from 'react'
import { Table, Button, Space, Tag, message, Modal, Select, Typography, Card, Statistic, Row, Col } from 'antd'
import { CheckOutlined, CloseOutlined, MergeCellsOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title } = Typography
const { Option } = Select

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  autoCreated: boolean
  confidenceScore: number | null
  needsReview: boolean
  createdAt: string
}

interface AllCategory {
  id: string
  name: string
}

export default function CategoryReviewPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [allCategories, setAllCategories] = useState<AllCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [mergeModalVisible, setMergeModalVisible] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [mergeTargetId, setMergeTargetId] = useState<string>('')

  useEffect(() => {
    fetchCategories()
    fetchAllCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/categories/review')
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      message.error('获取待审核标签失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setAllCategories(data.filter((c: Category) => !c.needsReview))
      }
    } catch (error) {
      console.error('Error fetching all categories:', error)
    }
  }

  const handleApprove = async (category: Category) => {
    try {
      const res = await fetch('/api/categories/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: category.id,
          action: 'approve',
        }),
      })

      if (res.ok) {
        message.success('标签已批准')
        fetchCategories()
        fetchAllCategories()
      } else {
        const data = await res.json()
        message.error(data.error || '批准失败')
      }
    } catch {
      message.error('批准失败')
    }
  }

  const handleReject = async (category: Category) => {
    Modal.confirm({
      title: '确认拒绝',
      content: `确定要拒绝并删除标签 "${category.name}" 吗？`,
      onOk: async () => {
        try {
          const res = await fetch('/api/categories/review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              categoryId: category.id,
              action: 'reject',
            }),
          })

          if (res.ok) {
            message.success('标签已拒绝并删除')
            fetchCategories()
          } else {
            const data = await res.json()
            message.error(data.error || '拒绝失败')
          }
        } catch {
          message.error('拒绝失败')
        }
      },
    })
  }

  const handleMerge = (category: Category) => {
    setSelectedCategory(category)
    setMergeTargetId('')
    setMergeModalVisible(true)
  }

  const confirmMerge = async () => {
    if (!selectedCategory || !mergeTargetId) {
      message.warning('请选择要合并到的目标标签')
      return
    }

    try {
      const res = await fetch('/api/categories/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: selectedCategory.id,
          action: 'merge',
          mergeWithId: mergeTargetId,
        }),
      })

      if (res.ok) {
        message.success('标签已合并')
        setMergeModalVisible(false)
        fetchCategories()
        fetchAllCategories()
      } else {
        const data = await res.json()
        message.error(data.error || '合并失败')
      }
    } catch {
      message.error('合并失败')
    }
  }

  const columns: ColumnsType<Category> = [
    {
      title: '标签名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <span>{text}</span>
          {record.autoCreated && <Tag color="blue">自动创建</Tag>}
        </Space>
      ),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: '置信度',
      dataIndex: 'confidenceScore',
      key: 'confidenceScore',
      render: (score) => {
        if (score === null) return '-'
        const percentage = (score * 100).toFixed(0)
        const color = score >= 0.7 ? 'green' : score >= 0.5 ? 'orange' : 'red'
        return <Tag color={color}>{percentage}%</Tag>
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleApprove(record)}
            size="small"
          >
            批准
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={() => handleReject(record)}
            size="small"
          >
            拒绝
          </Button>
          <Button
            icon={<MergeCellsOutlined />}
            onClick={() => handleMerge(record)}
            size="small"
          >
            合并
          </Button>
        </Space>
      ),
    },
  ]

  const stats = {
    total: categories.length,
    autoCreated: categories.filter((c) => c.autoCreated).length,
    highConfidence: categories.filter((c) => c.confidenceScore && c.confidenceScore >= 0.7).length,
    lowConfidence: categories.filter((c) => c.confidenceScore && c.confidenceScore < 0.5).length,
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>标签审核</Title>
        <Button icon={<ReloadOutlined />} onClick={fetchCategories}>
          刷新
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="待审核标签" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="自动创建" value={stats.autoCreated} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="高置信度" value={stats.highConfidence} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="低置信度" value={stats.lowConfidence} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title="合并标签"
        open={mergeModalVisible}
        onOk={confirmMerge}
        onCancel={() => setMergeModalVisible(false)}
        okText="确认合并"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>
          <p>
            将标签 <strong>{selectedCategory?.name}</strong> 合并到：
          </p>
          <Select
            style={{ width: '100%' }}
            placeholder="选择目标标签"
            value={mergeTargetId}
            onChange={setMergeTargetId}
            showSearch
            filterOption={(input, option) => {
              const children = option?.children;
              const text = typeof children === 'string' ? children : 
                          Array.isArray(children) ? children.join('') : 
                          String(children || '');
              return text.toLowerCase().includes(input.toLowerCase());
            }}
          >
            {allCategories.map((cat) => (
              <Option key={cat.id} value={cat.id}>
                {cat.name}
              </Option>
            ))}
          </Select>
          <p style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
            合并后，所有使用当前标签的文章将改为使用目标标签，当前标签将被删除。
          </p>
        </div>
      </Modal>
    </div>
  )
}


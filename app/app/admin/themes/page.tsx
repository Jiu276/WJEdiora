'use client'

import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
} from 'antd'
import { CheckCircleOutlined, HighlightOutlined, PlusOutlined } from '@ant-design/icons'
import { getThemeConfig } from '@/lib/themeConfig'

const { Title, Paragraph, Text } = Typography

interface Theme {
  id: string
  name: string
  slug: string
  description: string | null
  isActive: boolean
}

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchThemes()
  }, [])

  const fetchThemes = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/themes')
      const data = await res.json()
      setThemes(data)
    } catch (error) {
      console.error(error)
      message.error('加载主题列表失败')
    } finally {
      setLoading(false)
    }
  }

  const openModal = (theme?: Theme) => {
    if (theme) {
      setEditingTheme(theme)
      form.setFieldsValue({
        name: theme.name,
        slug: theme.slug,
        description: theme.description || '',
      })
    } else {
      setEditingTheme(null)
      form.resetFields()
    }
    setModalOpen(true)
  }

  const handleActivate = async (id: string) => {
    try {
      const res = await fetch(`/api/themes/${id}/activate`, { method: 'POST' })
      if (!res.ok) throw new Error()
      message.success('主题已启用')
      fetchThemes()
    } catch (error) {
      console.error(error)
      message.error('启用主题失败')
    }
  }

  const handleSubmit = async (values: any) => {
    setSubmitting(true)
    try {
      const payload = {
        name: values.name,
        slug: values.slug || undefined,
        description: values.description || undefined,
      }

      const res = await fetch(
        editingTheme ? `/api/themes/${editingTheme.id}` : '/api/themes',
        {
          method: editingTheme ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || '操作失败')
      }

      message.success(editingTheme ? '主题已更新' : '主题已创建')
      setModalOpen(false)
      fetchThemes()
    } catch (error: any) {
      message.error(error.message || '操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ marginBottom: 4 }}>
            主题管理
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            为读者站点选择不同的配色与风格，激活后立即生效。
          </Paragraph>
        </div>
        <Space>
          <Button 
            onClick={async () => {
              try {
                const res = await fetch('/api/init-data', { method: 'POST' })
                const data = await res.json()
                if (data.success) {
                  message.success(`初始化成功！已创建 ${data.results.categories} 个分类，${data.results.themes} 个主题，${data.results.articleTitles} 个标题`)
                  fetchThemes()
                } else {
                  message.error(data.error || '初始化失败')
                }
              } catch {
                message.error('初始化失败，请检查网络连接')
              }
            }}
          >
            初始化数据
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            新建主题
          </Button>
        </Space>
      </Space>

      {loading ? (
        <Row gutter={[24, 24]}>
          {[1, 2, 3].map((i) => (
            <Col xs={24} md={12} lg={8} key={i}>
              <Card>
                <Skeleton active paragraph={{ rows: 4 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Row gutter={[24, 24]}>
          {themes.map((theme) => {
            const config = getThemeConfig(theme.slug)
            // 主题预览描述
            const themeDescriptions: Record<string, string> = {
              default: '现代简洁风格，适合通用博客',
              minimal: '极简风格，专注内容本身',
              magazine: '杂志排版风格，适合内容丰富',
              dark: '深色主题，护眼舒适',
              card: '大卡片风格，视觉冲击力强',
              'bootstrap-blog': 'Bootstrap 5 风格博客主题，经典现代设计',
              comprehensive: '综合类博客主题，现代简约设计，适合多领域内容',
              'magazine-multi': '杂志风格多功能主题，深色头部，红色强调色，适合内容丰富',
              'minimal-lifestyle': '简约休闲生活主题，浅色配色，优雅设计，适合生活方式博客',
            }
            return (
              <Col xs={24} md={12} lg={8} key={theme.id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 16,
                    border: theme.isActive ? '2px solid var(--theme-primary)' : undefined,
                    boxShadow: theme.isActive ? '0 4px 12px rgba(24,144,255,0.2)' : undefined,
                  }}
                  bodyStyle={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                >
                  <div
                    style={{
                      borderRadius: 12,
                      height: 160,
                      background: `linear-gradient(135deg, ${config.previewStart}, ${config.previewEnd})`,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {theme.isActive && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          background: 'rgba(82,196,26,0.9)',
                          color: '#fff',
                          padding: '4px 12px',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        已激活
                      </div>
                    )}
                  </div>
                  <div>
                    <Title level={4} style={{ marginBottom: 4 }}>
                      {theme.name}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {themeDescriptions[theme.slug] || theme.description || '自定义主题'}
                    </Text>
                  </div>
                  <Paragraph style={{ flex: 1, fontSize: 13, color: '#666' }}>
                    {theme.description || themeDescriptions[theme.slug] || '暂无描述'}
                  </Paragraph>
                  <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                    <Space>
                      {theme.isActive ? (
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                          当前启用
                        </Tag>
                      ) : (
                        <Tag>未启用</Tag>
                      )}
                    </Space>
                    <Space>
                      {!theme.isActive && (
                        <Button 
                          size="small" 
                          type="primary" 
                          onClick={() => handleActivate(theme.id)}
                        >
                          启用主题
                        </Button>
                      )}
                      <Button
                        size="small"
                        icon={<HighlightOutlined />}
                        onClick={() => openModal(theme)}
                      >
                        编辑
                      </Button>
                    </Space>
                  </Space>
                </Card>
              </Col>
            )
          })}
        </Row>
      )}

      <Modal
        title={editingTheme ? '编辑主题' : '新建主题'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="主题名称"
            rules={[{ required: true, message: '请输入主题名称' }]}
          >
            <Input placeholder="例如：深色主题" />
          </Form.Item>
          <Form.Item
            name="slug"
            label="主题标识 (slug)"
            extra="可留空自动生成，建议使用英文或拼音"
          >
            <Input placeholder="dark" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="特点、适用场景等" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}



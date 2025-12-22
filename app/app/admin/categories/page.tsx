'use client'

import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Space, message, Popconfirm, Row, Col } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'

const { TextArea } = Input

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data)
    } catch {
      message.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values: { name: string; slug: string; description?: string }) => {
    try {
      if (editingId) {
        const res = await fetch(`/api/categories/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        })
        if (res.ok) {
          message.success('更新成功')
          form.resetFields()
          setEditingId(null)
          fetchCategories()
        } else {
          message.error('更新失败')
        }
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        })
        if (res.ok) {
          message.success('创建成功')
          form.resetFields()
          fetchCategories()
        } else {
          message.error('创建失败')
        }
      }
    } catch {
      message.error('操作失败')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    form.setFieldsValue(category)
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        message.success('删除成功')
        fetchCategories()
      } else {
        message.error('删除失败')
      }
    } catch {
      message.error('删除失败')
    }
  }

  const handleCancel = () => {
    form.resetFields()
    setEditingId(null)
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>标签类别管理</h2>
      
      <Card title={editingId ? '编辑类别' : '新建类别'} style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="如：生活、旅游、科技" />
          </Form.Item>
          
          <Form.Item
            name="slug"
            label="Slug"
            rules={[{ required: true, message: '请输入 Slug' }]}
          >
            <Input placeholder="URL 友好标识符，如：life" />
          </Form.Item>
          
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="类别描述" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingId ? '更新' : '创建'}
              </Button>
              {editingId && (
                <Button onClick={handleCancel}>取消</Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Row gutter={[16, 16]}>
        {categories.map((category) => (
          <Col xs={24} sm={12} md={8} lg={6} key={category.id}>
            <Card
              title={category.name}
              extra={
                <Space>
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(category)}
                  >
                    编辑
                  </Button>
                  <Popconfirm
                    title="确定要删除这个类别吗？"
                    onConfirm={() => handleDelete(category.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button type="link" danger icon={<DeleteOutlined />}>
                      删除
                    </Button>
                  </Popconfirm>
                </Space>
              }
            >
              <p><strong>Slug:</strong> {category.slug}</p>
              {category.description && (
                <p><strong>描述:</strong> {category.description}</p>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}


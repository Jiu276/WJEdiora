'use client'

import { Table, Button, Space, Tag, message, Popconfirm, Input, Card, Modal, Form, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import type { ColumnsType } from 'antd/es/table'

const { Option } = Select

interface AdminUser {
  id: string
  username: string
  email: string | null
  role: 'super_admin' | 'admin' | 'editor' | 'author'
  createdAt: string
}

const roleLabels = {
  super_admin: '超级管理员',
  admin: '管理员',
  editor: '编辑',
  author: '作者',
}

const roleColors = {
  super_admin: 'red',
  admin: 'orange',
  editor: 'blue',
  author: 'green',
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      if (response.ok) {
        setUsers(data.users || [])
      } else {
        message.error(data.error || '获取用户列表失败')
      }
    } catch (error) {
      console.error('Fetch users error:', error)
      message.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingUser(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user)
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      role: user.role,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (response.ok) {
        message.success('删除成功')
        fetchUsers()
      } else {
        message.error(data.error || '删除失败')
      }
    } catch (error) {
      console.error('Delete user error:', error)
      message.error('删除失败')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users'
      const method = editingUser ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()
      if (response.ok) {
        message.success(editingUser ? '更新成功' : '创建成功')
        setModalVisible(false)
        form.resetFields()
        fetchUsers()
      } else {
        message.error(data.error || (editingUser ? '更新失败' : '创建失败'))
      }
    } catch (error) {
      console.error('Submit user error:', error)
      message.error(editingUser ? '更新失败' : '创建失败')
    }
  }

  const columns: ColumnsType<AdminUser> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      render: (email) => email || '-',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: 'super_admin' | 'admin' | 'editor' | 'author') => (
        <Tag color={roleColors[role]}>{roleLabels[role]}</Tag>
      ),
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
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.role !== 'super_admin' && (
            <Popconfirm
              title="确定要删除这个用户吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>用户管理</h2>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              创建用户
            </Button>
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      <Modal
        title={editingUser ? '编辑用户' : '创建用户'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input disabled={!!editingUser} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
          >
            <Input type="email" placeholder="邮箱（可选）" />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="选择角色">
              <Option value="super_admin">超级管理员</Option>
              <Option value="admin">管理员</Option>
              <Option value="editor">编辑</Option>
              <Option value="author">作者</Option>
            </Select>
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }]}
            >
              <Input.Password placeholder="密码" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  )
}


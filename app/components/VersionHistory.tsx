'use client'

import { useState, useEffect } from 'react'
import { Modal, Table, Button, Space, Tag, message, Popconfirm, Typography, Card } from 'antd'
import { HistoryOutlined, RollbackOutlined, EyeOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Paragraph } = Typography

interface Version {
  id: string
  version: number
  title: string
  content: string
  excerpt: string | null
  createdAt: string
}

interface VersionHistoryProps {
  articleId: string
  onRestore?: () => void
}

export default function VersionHistory({ articleId, onRestore }: VersionHistoryProps) {
  const [visible, setVisible] = useState(false)
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null)
  const [previewVisible, setPreviewVisible] = useState(false)

  useEffect(() => {
    if (visible && articleId) {
      fetchVersions()
    }
  }, [visible, articleId])

  const fetchVersions = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/articles/${articleId}/versions`)
      if (res.ok) {
        const data = await res.json()
        setVersions(data)
      } else {
        message.error('加载版本历史失败')
      }
    } catch {
      message.error('加载版本历史失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (versionId: string) => {
    try {
      const res = await fetch(`/api/articles/${articleId}/versions/${versionId}/restore`, {
        method: 'POST',
      })
      if (res.ok) {
        message.success('版本恢复成功')
        setVisible(false)
        onRestore?.()
      } else {
        message.error('版本恢复失败')
      }
    } catch {
      message.error('版本恢复失败')
    }
  }

  const handlePreview = (version: Version) => {
    setSelectedVersion(version)
    setPreviewVisible(true)
  }

  const columns: ColumnsType<Version> = [
    {
      title: '版本号',
      dataIndex: 'version',
      key: 'version',
      width: 80,
      render: (version) => <Tag color="blue">v{version}</Tag>,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
          >
            预览
          </Button>
          <Popconfirm
            title="确定要恢复到此版本吗？当前版本将被保存为新版本。"
            onConfirm={() => handleRestore(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<RollbackOutlined />}
            >
              恢复
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Button
        icon={<HistoryOutlined />}
        onClick={() => setVisible(true)}
      >
        版本历史
      </Button>

      <Modal
        title="文章版本历史"
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={900}
      >
        <Table
          columns={columns}
          dataSource={versions}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Modal>

      {/* 版本预览 */}
      <Modal
        title={`版本 v${selectedVersion?.version} 预览`}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        {selectedVersion && (
          <div>
            <Card style={{ marginBottom: 16 }}>
              <Typography.Title level={4}>{selectedVersion.title}</Typography.Title>
              {selectedVersion.excerpt && (
                <Paragraph style={{ color: '#666', fontStyle: 'italic' }}>
                  {selectedVersion.excerpt}
                </Paragraph>
              )}
            </Card>
            <div
              dangerouslySetInnerHTML={{ __html: selectedVersion.content }}
              style={{
                lineHeight: 1.8,
                fontSize: '16px',
                color: '#333',
              }}
            />
          </div>
        )}
      </Modal>
    </>
  )
}



'use client'

import { useState } from 'react'
import { Upload, Button, message, Image as AntImage } from 'antd'
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons'

interface ImageUploadProps {
  value?: string
  onChange?: (url: string) => void
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [loading, setLoading] = useState(false)

  const handleUpload = async (file: File) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        onChange?.(data.url)
        message.success('上传成功')
      } else {
        message.error('上传失败')
      }
    } catch {
      message.error('上传失败')
    } finally {
      setLoading(false)
    }
    return false // 阻止默认上传行为
  }

  return (
    <div>
      {value ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <AntImage
            src={value}
            alt="预览"
            style={{ maxWidth: 200, maxHeight: 200, objectFit: 'cover' }}
          />
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onChange?.('')}
            style={{ marginTop: 8, width: '100%' }}
          >
            删除图片
          </Button>
        </div>
      ) : (
        <Upload
          beforeUpload={handleUpload}
          showUploadList={false}
          accept="image/*"
        >
          <Button icon={<UploadOutlined />} loading={loading}>
            上传图片
          </Button>
        </Upload>
      )}
    </div>
  )
}


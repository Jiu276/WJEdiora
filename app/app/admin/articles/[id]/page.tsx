'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Switch,
  message,
  Card,
  Space,
  Tag,
  Modal,
  Typography,
} from 'antd'
import { SaveOutlined, ArrowLeftOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import dynamic from 'next/dynamic'
import PublishWizard from '@/components/PublishWizard'
import ImageUpload from '@/components/ImageUpload'
import VersionHistory from '@/components/VersionHistory'

// 动态导入富文本编辑器以避免 SSR 问题
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => <div style={{ padding: 16, textAlign: 'center' }}>加载编辑器...</div>,
})

const { TextArea } = Input
const { Option } = Select

interface Article {
  id: string
  title: string
  slug?: string
  content: string
  excerpt: string
  status: 'draft' | 'published'
  categoryId: string | null
  titleId: string
  author: string
  publishDate: string | null
  featuredImage: string | null
  enableKeywordLinks: boolean
}

export default function ArticleEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const isNew = id === 'new'
  
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [article, setArticle] = useState<Article | null>(null)
  const [showPublishWizard, setShowPublishWizard] = useState(false)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [articleTitles, setArticleTitles] = useState<Array<{ id: string; name: string }>>([])
  const [tags, setTags] = useState<string[]>([])
  const [links, setLinks] = useState<Array<{ keyword: string; url: string }>>([])
  const [newLink, setNewLink] = useState<{ keyword: string; url: string }>({ keyword: '', url: '' })
  const [linksLoading, setLinksLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchArticleTitles()
    
    if (!isNew) {
      fetchArticle()
    } else {
      setShowPublishWizard(true)
    }
  }, [id, isNew])

  const isValidUrl = (url: string) => /^https?:\/\//i.test(url)

  const fetchCategories = async () => {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data)
  }

  const fetchArticleTitles = async () => {
    const res = await fetch('/api/article-titles')
    const data = await res.json()
    setArticleTitles(data)
  }

  const fetchLinks = async (articleId?: string) => {
    if (isNew || !articleId) return
    setLinksLoading(true)
    try {
      const res = await fetch(`/api/articles/${articleId}/links`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setLinks(data.map((l: any) => ({ keyword: l.keyword, url: l.url })))
        }
      }
    } catch (error) {
      console.error('Error fetching links:', error)
    } finally {
      setLinksLoading(false)
    }
  }

  const fetchArticle = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/articles/${id}`)
      if (res.ok) {
        const data = await res.json()
        setArticle(data)
        const normalized = {
          ...data,
          publishDate: data.publishDate ? dayjs(data.publishDate) : null,
        }
        form.setFieldsValue(normalized)
        
        // 获取文章超链接
        fetchLinks(data.id)
        
        // 获取文章标签
        const tagsRes = await fetch(`/api/articles/${id}/tags`)
        if (tagsRes.ok) {
          const tagsData = await tagsRes.json()
          setTags(tagsData.map((t: { tag: string }) => t.tag))
        }
      } else {
        message.error('加载文章失败')
      }
    } catch {
      message.error('加载文章失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (values: any) => {
    // 防止重复提交
    if (loading) return
    
    setLoading(true)
    try {
      // 表单验证
      if (!values.title || !values.title.trim()) {
        message.warning('请输入文章标题')
        setLoading(false)
        return
      }
      
      if (!values.content || !values.content.trim()) {
        message.warning('请输入文章内容')
        setLoading(false)
        return
      }
      
      // 获取当前登录用户信息（创建新文章时使用）
      let currentUser = null
      if (isNew) {
        try {
          const userRes = await fetch('/api/auth/me')
          if (userRes.ok) {
            const userData = await userRes.json()
            currentUser = userData.user
          }
        } catch (error) {
          console.error('Failed to get current user:', error)
        }
      }
      
      const payload = {
        ...values,
        publishDate: values.publishDate ? values.publishDate.toISOString() : null,
        createVersion: !isNew, // 编辑时创建版本快照
        // 创建新文章时，使用当前登录用户作为作者
        ...(isNew && currentUser && { author: currentUser.username }),
      }
      
      const url = isNew ? '/api/articles' : `/api/articles/${id}`
      const method = isNew ? 'POST' : 'PUT'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      if (res.ok) {
        const data = await res.json()
        const articleId = data.id
        
        // 保存标签（需要在SEO生成之前保存，因为SEO会用到标签）
        if (tags.length > 0) {
          const tagsRes = await fetch(`/api/articles/${articleId}/tags`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tags }),
          })
          
          if (!tagsRes.ok) {
            message.warning('文章已保存，但标签保存失败')
          }
        }
        
        // 保存后重新获取文章（包含自动生成的SEO数据）
        const updatedRes = await fetch(`/api/articles/${articleId}`)
        if (updatedRes.ok) {
          const updatedData = await updatedRes.json()
          const normalized = {
            ...updatedData,
            publishDate: updatedData.publishDate ? dayjs(updatedData.publishDate) : null,
          }
          setArticle(normalized)
          form.setFieldsValue(normalized)
        }
        
        // 更新本地文章数据
        const normalized = {
          ...data,
          publishDate: data.publishDate ? dayjs(data.publishDate) : null,
        }
        setArticle(normalized)
        form.setFieldsValue(normalized)
        
        message.success(isNew ? '创建成功' : '保存成功', 2)
        if (isNew) {
          setTimeout(() => {
            router.push(`/admin/articles/${articleId}`)
          }, 1000)
        }
      } else {
        const errorData = await res.json().catch(() => ({}))
        message.error(errorData.error || '保存失败，请稍后重试')
      }
    } catch (error: unknown) {
      console.error('Save error:', error)
      const errorMessage = error instanceof Error ? error.message : '保存失败，请检查网络连接'
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleAddLink = () => {
    const keyword = newLink.keyword.trim()
    const url = newLink.url.trim()
    if (!keyword || !url) {
      message.warning('请输入关键字和链接 URL')
      return
    }
    if (!isValidUrl(url)) {
      message.warning('请输入正确的 URL（需包含 http/https）')
      return
    }
    if (links.some(l => l.keyword === keyword)) {
      message.warning('关键字已存在，请勿重复')
      return
    }
    setLinks([...links, { keyword, url }])
    setNewLink({ keyword: '', url: '' })
  }

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index))
  }

  const handleSaveLinks = async () => {
    if (isNew || !article?.id) {
      message.warning('请先保存文章，再配置超链接')
      return
    }
    setLinksLoading(true)
    try {
      const res = await fetch(`/api/articles/${article.id}/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links }),
      })
      if (res.ok) {
        message.success('超链接已保存')
        fetchLinks(article.id)
      } else {
        message.error('保存超链接失败')
      }
    } catch (error) {
      console.error('Save links error:', error)
      message.error('保存超链接失败，请稍后重试')
    } finally {
      setLinksLoading(false)
    }
  }

  const handleVersionRestore = () => {
    // 版本恢复后刷新文章数据
    fetchArticle()
  }

  const handlePublishNow = async () => {
    try {
      const values = await form.validateFields()
      await handleSave({
        ...values,
        status: 'published',
        publishDate: values.publishDate || dayjs(),
      })
    } catch {
      // 验证未通过或保存失败已在 handleSave 内提示
    }
  }

  type PublishPayload = {
    title?: string
    content?: string
    excerpt?: string
    categoryId?: string | null
    titleId?: string
    publishDate?: unknown
    featuredImage?: string | null
    enableKeywordLinks?: boolean
    customDomains?: Array<string>
    links?: Array<{ keyword: string; url: string }>
    images?: Array<{ url: string; description?: string }>
  }

  const handlePublishComplete = async (articleData: PublishPayload) => {
    setLoading(true)
    try {
      // 获取当前登录用户信息
      let currentUser = null
      try {
        const userRes = await fetch('/api/auth/me')
        if (userRes.ok) {
          const userData = await userRes.json()
          currentUser = userData.user
        }
      } catch (error) {
        console.error('Failed to get current user:', error)
      }
      
      // 1. 先创建/更新文章
      const url = isNew ? '/api/articles' : `/api/articles/${id}`
      const method = isNew ? 'POST' : 'PUT'
      
      const articleRes = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: articleData.title,
          content: articleData.content,
          excerpt: articleData.excerpt,
          categoryId: articleData.categoryId,
          titleId: articleData.titleId || '1',
          publishDate: articleData.publishDate,
          featuredImage: articleData.featuredImage,
          enableKeywordLinks: articleData.enableKeywordLinks,
          status: 'published',
          // 创建新文章时，使用当前登录用户作为作者
          ...(isNew && currentUser && { author: currentUser.username }),
        }),
      })
      
      if (!articleRes.ok) {
        message.error('发布失败')
        return
      }
      
      const article = await articleRes.json()
      const articleId = article.id
      
      // 2. 保存关联数据（并行执行）
      const promises = []
      
      // 保存自定义域名
      if (Array.isArray(articleData.customDomains) && articleData.customDomains.length > 0) {
        promises.push(
          fetch(`/api/articles/${articleId}/custom-domains`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domains: articleData.customDomains }),
          })
        )
      }
      
      // 保存超链接
      if (Array.isArray(articleData.links) && articleData.links.length > 0) {
        promises.push(
          fetch(`/api/articles/${articleId}/links`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ links: articleData.links }),
          })
        )
      }
      
      // 保存配图
      if (Array.isArray(articleData.images) && articleData.images.length > 0) {
        promises.push(
          fetch(`/api/articles/${articleId}/images`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ images: articleData.images }),
          })
        )
      }
      
      // 等待所有关联数据保存完成
      await Promise.all(promises)
      
      message.success('发布成功')
      router.push(`/admin/articles/${articleId}`)
    } catch (error: unknown) {
      console.error('Publish error:', error)
      
      // 如果是 slug 冲突，给出更明确的错误提示
      const errorMessage = error instanceof Error ? error.message : ''
      if (errorMessage.includes('slug') || errorMessage.includes('唯一')) {
        message.error('文章标题已存在，请修改标题后重试')
      } else {
        message.error('发布失败，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  if (isNew && showPublishWizard) {
    return (
      <div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/admin/articles')}
          style={{ marginBottom: 16 }}
        >
          返回列表
        </Button>
        <PublishWizard
          onComplete={handlePublishComplete}
          onCancel={() => router.push('/admin/articles')}
        />
      </div>
    )
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/admin/articles')}
        >
          返回列表
        </Button>
        {!isNew && (
          <>
            <Button
              icon={<EyeOutlined />}
              onClick={() => setShowPreview(true)}
            >
              预览
            </Button>
            <VersionHistory
              articleId={id}
              onRestore={handleVersionRestore}
            />
            <Button
              icon={<DownloadOutlined />}
              onClick={async () => {
                try {
                  const res = await fetch(`/api/articles/${id}/export`)
                  if (res.ok) {
                    const blob = await res.blob()
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `${article?.slug || id}.md`
                    document.body.appendChild(a)
                    a.click()
                    window.URL.revokeObjectURL(url)
                    document.body.removeChild(a)
                    message.success('导出成功')
                  } else {
                    message.error('导出失败')
                  }
                } catch {
                  message.error('导出失败')
                }
              }}
            >
              导出 Markdown
            </Button>
            <Button
              type="primary"
              onClick={handlePublishNow}
            >
              发布文章
            </Button>
          </>
        )}
      </Space>

      <Card title={isNew ? '新建文章' : '编辑文章'}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入文章标题" />
          </Form.Item>

          <Form.Item name="excerpt" label="摘要">
            <TextArea rows={3} placeholder="请输入文章摘要" />
          </Form.Item>

          <Form.Item>
            <Card 
              type="inner" 
              title={
                <span style={{ fontSize: '14px', color: '#666' }}>
                  💡 SEO 优化（自动生成，可手动覆盖）
                </span>
              }
              style={{ marginBottom: 24 }}
              styles={{ body: { padding: 16 } }}
            >
              <div style={{ marginBottom: 16, padding: '12px', background: '#f0f7ff', borderRadius: 4, fontSize: '12px', color: '#666' }}>
                <strong>自动生成规则：</strong><br />
                • SEO标题：默认使用文章标题<br />
                • SEO描述：优先使用摘要，无摘要则从内容提取<br />
                • SEO关键词：自动从标签、类别和标题提取
              </div>
              
              <Form.Item name="metaTitle" label="SEO 标题（可选）">
                <Input 
                  placeholder="留空则自动使用文章标题"
                  maxLength={200}
                  showCount
                />
              </Form.Item>

              <Form.Item name="metaDescription" label="SEO 描述（可选）">
                <TextArea 
                  rows={3} 
                  placeholder="留空则自动使用摘要或内容提取"
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Form.Item name="metaKeywords" label="SEO 关键词（可选）">
                <Input 
                  placeholder="留空则自动从标签、类别生成"
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Card>
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <RichTextEditor
              content={form.getFieldValue('content') || ''}
              onChange={(html) => form.setFieldsValue({ content: html })}
            />
          </Form.Item>

          <Form.Item name="categoryId" label="标签类别">
            <Select placeholder="请选择标签类别" allowClear>
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="titleId"
            label="文章标题"
            rules={[{ required: true, message: '请选择文章标题' }]}
          >
            <Select placeholder="请选择文章标题">
              {articleTitles.map((title) => (
                <Option key={title.id} value={title.id}>
                  {title.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="status" label="状态" initialValue="draft">
            <Select>
              <Option value="draft">草稿</Option>
              <Option value="published">已发布</Option>
            </Select>
          </Form.Item>

          <Form.Item name="publishDate" label="发布日期">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="featuredImage" label="封面图片">
            <Space orientation="vertical" style={{ width: '100%' }} size="small">
            <ImageUpload
              value={form.getFieldValue('featuredImage')}
              onChange={(url) => form.setFieldsValue({ featuredImage: url })}
            />
              <Input
                placeholder="或直接输入图片 URL"
                value={form.getFieldValue('featuredImage')}
                onChange={(e) => form.setFieldsValue({ featuredImage: e.target.value })}
              />
            </Space>
          </Form.Item>

          <Form.Item label="标签">
            <div style={{ marginBottom: 8 }}>
              <Input
                placeholder="输入标签后按回车添加"
                value={tags.join(', ')}
                onChange={(e) => {
                  const value = e.target.value
                  if (value.includes(',')) {
                    setTags(value.split(',').map(t => t.trim()).filter(Boolean))
                  }
                }}
                onPressEnter={(e) => {
                  const value = (e.target as HTMLInputElement).value.trim()
                  if (value && !tags.includes(value)) {
                    setTags([...tags, value])
                    ;(e.target as HTMLInputElement).value = ''
                  }
                }}
              />
            </div>
            <div>
              {tags.map((tag, index) => (
                <Tag
                  key={index}
                  closable
                  onClose={() => setTags(tags.filter((_, i) => i !== index))}
                  style={{ marginBottom: 8 }}
                >
                  {tag}
                </Tag>
              ))}
            </div>
          </Form.Item>

          <Form.Item
            name="enableKeywordLinks"
            label="启用关键字自动超链接"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>

          <Form.Item label="关键词链接（可选）">
            <Card
              type="inner"
              styles={{ body: { padding: 12 } }}
              extra={
                <Space>
                  <Button size="small" onClick={() => setLinks([])}>清空</Button>
                  <Button
                    type="primary"
                    size="small"
                    onClick={handleSaveLinks}
                    loading={linksLoading}
                    disabled={isNew}
                  >
                    保存超链接
                  </Button>
                </Space>
              }
            >
              {isNew && (
                <div style={{ marginBottom: 8, color: '#faad14' }}>
                  请先保存文章，再配置超链接。
                </div>
              )}
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    style={{ width: '30%' }}
                    placeholder="关键字"
                    value={newLink.keyword}
                    onChange={(e) => setNewLink({ ...newLink, keyword: e.target.value })}
                    disabled={isNew}
                  />
                  <Input
                    style={{ width: '70%' }}
                    placeholder="链接 URL（包含 http/https）"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    disabled={isNew}
                  />
                  <Button type="primary" onClick={handleAddLink} disabled={isNew}>
                    添加
                  </Button>
                </Space.Compact>

                <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {links.map((link, index) => (
                      <Card
                        key={`${link.keyword}-${index}`}
                        size="small"
                        styles={{ body: { padding: 8 } }}
                        extra={
                          <Button
                            size="small"
                            type="link"
                            danger
                            onClick={() => handleRemoveLink(index)}
                          >
                            删除
                          </Button>
                        }
                      >
                        <div style={{ fontWeight: 500 }}>{link.keyword}</div>
                        <div style={{ color: '#1890ff', wordBreak: 'break-all' }}>{link.url}</div>
                      </Card>
                    ))}
                    {links.length === 0 && (
                      <div style={{ color: '#999' }}>暂无关键词链接</div>
                    )}
                  </Space>
                </div>
              </Space>
            </Card>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {showPublishWizard && !isNew && (
        <PublishWizard
          article={article}
          onComplete={handlePublishComplete}
          onCancel={() => setShowPublishWizard(false)}
        />
      )}

      {/* 预览模态框 */}
      <Modal
        title="文章预览"
        open={showPreview}
        onCancel={() => setShowPreview(false)}
        footer={[
          <Button key="close" onClick={() => setShowPreview(false)}>
            关闭
          </Button>,
          <Button 
            key="view" 
            type="primary"
            onClick={() => {
              if (article?.slug) {
                window.open(`/blog/${article.slug}`, '_blank')
              }
            }}
          >
            在新窗口打开
          </Button>,
        ]}
        width={900}
        style={{ top: 20 }}
      >
        <div style={{ 
          maxHeight: '70vh', 
          overflowY: 'auto',
          padding: '24px',
          background: '#fff',
          borderRadius: 8,
        }}>
          {article && (
            <>
              {article.featuredImage && (
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  style={{
                    width: '100%',
                    height: 300,
                    objectFit: 'cover',
                    borderRadius: 8,
                    marginBottom: 24,
                  }}
                />
              )}
              <Typography.Title level={1} style={{ marginBottom: 16 }}>
                {article.title}
              </Typography.Title>
              {article.excerpt && (
                <Typography.Paragraph
                  style={{
                    fontSize: '18px',
                    color: '#666',
                    marginBottom: 24,
                    fontStyle: 'italic',
                    borderLeft: '4px solid #1890ff',
                    paddingLeft: 16,
                  }}
                >
                  {article.excerpt}
                </Typography.Paragraph>
              )}
              <div
                dangerouslySetInnerHTML={{ __html: article.content }}
                style={{
                  lineHeight: 1.8,
                  fontSize: '16px',
                  color: '#333',
                }}
              />
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}


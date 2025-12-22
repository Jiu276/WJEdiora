'use client'

import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  message, 
  Popconfirm, 
  Input, 
  Select, 
  DatePicker, 
  Card,
  Row,
  Col,
  Checkbox,
  Skeleton,
  Modal,
  Badge,
  Statistic,
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  ReloadOutlined,
  DatabaseOutlined,
} from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ColumnsType } from 'antd/es/table'
import type { Dayjs } from 'dayjs'
import PublishWizard from '@/components/PublishWizard'

const { RangePicker } = DatePicker
const { Option } = Select

const DEFAULT_ARTICLE_PROMPT = `请用英文撰写正文。根据选中的标题生成文章，文章篇幅长度中等，图片与文章内容匹配。这篇文章主要是以

https://www.wildoakboutique.com/ 

这个网站写的，图片使用与文章内容相符合，避免直接用AI稿，要加工得有"人味儿"，有真情实感。避免只堆Banner，要有广告软植入。`

interface Article {
  id: string
  title: string
  status: 'draft' | 'published'
  author: string
  publishDate: string | null
  createdAt: string
  categoryId?: string | null
  titleId?: string
  category?: {
    id: string
    name: string
    slug: string
  } | null
}

export default function ArticlesPage() {
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  
  // 筛选和搜索状态
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [titleFilter, setTitleFilter] = useState<string>('')
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const [sortBy, setSortBy] = useState<string>('publishDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // 选项数据
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [articleTitles, setArticleTitles] = useState<Array<{ id: string; name: string }>>([])
  
  // 生成的标题管理
  type TitleItem = { id: string; title: string; score?: number }
  const [generatedTitles, setGeneratedTitles] = useState<TitleItem[]>([])
  const [savedTitles, setSavedTitles] = useState<TitleItem[]>([]) // 从数据库加载的已保存标题
  const [selectedTitleIds, setSelectedTitleIds] = useState<string[]>([]) // 新生成标题的选择
  const [selectedSavedTitleIds, setSelectedSavedTitleIds] = useState<string[]>([]) // 已保存标题的选择
  const [showPublishWizard, setShowPublishWizard] = useState(false)
  const [generatingArticles, setGeneratingArticles] = useState(false)
  const [loadingSavedTitles, setLoadingSavedTitles] = useState(false)
  const [quickArticlePrompt, setQuickArticlePrompt] = useState<string>(DEFAULT_ARTICLE_PROMPT)
  const [quickGenerateVisible, setQuickGenerateVisible] = useState(false)
  const [pendingGenerateTitles, setPendingGenerateTitles] = useState<TitleItem[]>([])
  const [_generationProgress, setGenerationProgress] = useState<{ current: number; total: number } | null>(null)

  useEffect(() => {
    fetchArticles()
    fetchOptions()
    fetchSavedTitles()
  }, [statusFilter, categoryFilter, titleFilter, dateRange, sortBy, sortOrder, searchText])

  // 加载已保存的标题
  const fetchSavedTitles = async () => {
    setLoadingSavedTitles(true)
    try {
      const res = await fetch('/api/article-titles?excludeUsed=true')
      const data = await res.json()
      if (Array.isArray(data)) {
        // 将数据库中的标题转换为生成标题的格式
        const convertedTitles = data.map((title: any) => ({
          id: title.id,
          title: title.name,
          score: (() => {
            if (!title.description) return 0
            const match = /推荐度[:：]\s*(\d+)%/.exec(title.description)
            return match ? parseInt(match[1], 10) || 0 : 0
          })(),
        }))
        setSavedTitles(convertedTitles)
      }
    } catch (error) {
      console.error('Error fetching saved titles:', error)
      setSavedTitles([])
    } finally {
      setLoadingSavedTitles(false)
    }
  }

  const fetchOptions = async () => {
    try {
      const [categoriesRes, titlesRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/article-titles'),
      ])
      const [categoriesData, titlesData] = await Promise.all([
        categoriesRes.json(),
        titlesRes.json(),
      ])
      setCategories(categoriesData)
      setArticleTitles(titlesData)
    } catch (error) {
      console.error('Error fetching options:', error)
    }
  }

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (categoryFilter) params.append('categoryId', categoryFilter)
      if (titleFilter) params.append('titleId', titleFilter)
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.append('startDate', dateRange[0].format('YYYY-MM-DD'))
        params.append('endDate', dateRange[1].format('YYYY-MM-DD'))
      }
      if (sortBy) params.append('sortBy', sortBy)
      if (sortOrder) params.append('sortOrder', sortOrder)
      if (searchText) params.append('search', searchText)
      
      const res = await fetch(`/api/articles?${params.toString()}`)
      const data = await res.json()
      setArticles(data)
    } catch {
      message.error('加载文章失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        message.success('删除成功')
        setSelectedRowKeys([])
        fetchArticles()
      } else {
        message.error('删除失败')
      }
    } catch {
      message.error('删除失败')
    }
  }

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的文章')
      return
    }
    
    try {
      const promises = selectedRowKeys.map(id =>
        fetch(`/api/articles/${id}`, { method: 'DELETE' })
      )
      await Promise.all(promises)
      message.success(`成功删除 ${selectedRowKeys.length} 篇文章`)
      setSelectedRowKeys([])
      fetchArticles()
    } catch {
      message.error('批量删除失败')
    }
  }

  const handleBatchUpdateStatus = async (status: 'draft' | 'published') => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要修改的文章')
      return
    }
    
    try {
      let success = 0
      let fail = 0
      for (const id of selectedRowKeys) {
        const res = await fetch(`/api/articles/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status,
            ...(status === 'published' ? { publishDate: new Date().toISOString() } : {}),
          }),
        })
        if (res.ok) {
          success++
        } else {
          fail++
          const err = await res.json().catch(() => ({}))
          console.error('Update status failed:', id, err)
        }
      }
      if (success > 0) {
        message.success(`成功更新 ${success} 篇文章状态`)
      }
      if (fail > 0) {
        message.error(`有 ${fail} 篇文章状态更新失败`)
      }
      setSelectedRowKeys([])
      fetchArticles()
    } catch {
      message.error('批量更新失败')
    }
  }

  const handleResetFilters = () => {
    setSearchText('')
    setStatusFilter('')
    setCategoryFilter('')
    setTitleFilter('')
    setDateRange(null)
    setSortBy('createdAt')
    setSortOrder('desc')
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys)
    },
  }

  const columns: ColumnsType<Article> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <a 
          onClick={() => router.push(`/admin/articles/${record.id}`)}
          style={{ cursor: 'pointer' }}
        >
          {text}
        </a>
      ),
    },
    {
      title: '标签类别',
      key: 'category',
      render: (_, record) => (
        record.category ? (
          <Tag color="blue">{record.category.name}</Tag>
        ) : (
          <span style={{ color: '#999' }}>-</span>
        )
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const isScheduled = record.publishDate && 
          new Date(record.publishDate) > new Date() && 
          status === 'draft'
        
        return (
          <Space>
            <Tag color={status === 'published' ? 'green' : 'orange'}>
              {status === 'published' ? '已发布' : '草稿'}
            </Tag>
            {isScheduled && (
              <Tag color="blue">定时发布</Tag>
            )}
          </Space>
        )
      },
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: '发布日期',
      dataIndex: 'publishDate',
      key: 'publishDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: '阅读量',
      dataIndex: 'viewCount',
      key: 'viewCount',
      render: (_, record) => {
        const count = (record as { viewCount?: number })?.viewCount || 0
        return count
      },
      sorter: (a, b) => {
        const aCount = (a as { viewCount?: number })?.viewCount || 0
        const bCount = (b as { viewCount?: number })?.viewCount || 0
        return aCount - bCount
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => router.push(`/admin/articles/${record.id}`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这篇文章吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // 处理标题生成回调
  const handleTitlesGenerated = (titles: Array<{ id: string; title: string; score?: number }>) => {
    setGeneratedTitles(titles)
    setSelectedTitleIds([])
    setSelectedSavedTitleIds([]) // 清空已保存标题的选择
    message.success(`已生成 ${titles.length} 个标题，请在下方选择要生成文章的标题`)
    // 重新加载已保存的标题
    fetchSavedTitles()
  }

  // 从标题列表批量生成文章（通用函数）
  const handleBatchGenerateArticlesFromTitles = async (titlesToGenerate: Array<{ id: string; name: string }>) => {
    if (titlesToGenerate.length === 0) {
      message.warning('请至少选择一个标题')
      return
    }

    setGeneratingArticles(true)
    setGenerationProgress({ current: 0, total: titlesToGenerate.length })
    try {
      const selectedTitles = titlesToGenerate
      let successCount = 0
      let failCount = 0

      for (let index = 0; index < selectedTitles.length; index++) {
        const titleObj = selectedTitles[index]
        setGenerationProgress({ current: index + 1, total: selectedTitles.length })
        try {
          // 生成文章内容
          const effectivePrompt = (quickArticlePrompt || DEFAULT_ARTICLE_PROMPT).trim()
          const contentRes = await fetch('/api/generate-article', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: titleObj.name,
              prompt: effectivePrompt,
            }),
          })
          const contentData = await contentRes.json()

          // 规范化生成内容，避免被包裹成字符串或带转义
          let finalContentRaw: string = contentData.content || ''
          if (typeof finalContentRaw === 'string') {
            // 尝试解析被 JSON.stringify 包裹的内容
            try {
              const parsed = JSON.parse(finalContentRaw)
              if (parsed?.content) {
                finalContentRaw = parsed.content
              }
            } catch {
              // ignore
            }
            // 去掉首尾引号
            finalContentRaw = finalContentRaw.replace(/^["']|["']$/g, '')
            // 将转义换行还原
            finalContentRaw = finalContentRaw.replace(/\\n/g, '\n')
          }

          // 生成配图
          const imagesRes = await fetch('/api/auto-images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: titleObj.name }),
          })
          const imagesData = await imagesRes.json()

          // 选择前3张图片（直接取对象，避免 id 对比导致为空）
          const selectedImagesData = (imagesData.images || []).slice(0, 3)

          // 将图片插入到文章内容中
          let finalContent = contentData.content
          if (selectedImagesData.length > 0) {
            const parts = finalContent.split(/<h3>/)
            let newContent = parts[0]
            const imagesPerPart = Math.ceil(selectedImagesData.length / Math.max(parts.length - 1, 1))
            let imageIndex = 0

            for (let i = 1; i < parts.length; i++) {
              const part = parts[i]
              const [title, ...contentParts] = part.split('</h3>')
              const content = contentParts.join('</h3>')
              newContent += `<h3>${title}</h3>`
              const firstParagraph = content.match(/<p>[\s\S]*?<\/p>/)?.[0] || ''
              newContent += firstParagraph

              const partImages = selectedImagesData.slice(imageIndex, imageIndex + imagesPerPart)
              if (partImages.length > 0) {
                const imageHtml = partImages.map((img: { url: string; description?: string }) => {
                  return `<figure style="margin: 30px 0; text-align: center;">
                    <img src="${img.url}" alt="${img.description || titleObj.name}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
                    ${img.description ? `<figcaption style="margin-top: 12px; color: #666; font-size: 14px; font-style: italic;">${img.description}</figcaption>` : ''}
                  </figure>`
                }).join('\n')
                newContent += imageHtml
              }

              const remainingContent = content.replace(firstParagraph, '')
              newContent += remainingContent
              imageIndex += imagesPerPart
            }
            finalContent = newContent
          }

          // 创建文章
          const articleRes = await fetch('/api/articles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: titleObj.name,
              content: finalContent,
              excerpt: finalContent.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
              categoryId: null,
              titleId: titleObj.id || null,
              status: 'published',
              publishDate: new Date().toISOString(),
              featuredImage: selectedImagesData[0]?.url || null,
              images: selectedImagesData,
            }),
          })

          if (articleRes.ok) {
            successCount++
          } else {
            failCount++
          }
        } catch (error) {
          failCount++
          console.error(`生成文章失败: ${titleObj.name}`, error)
        }
      }

      message.success(`成功生成 ${successCount} 篇文章${failCount > 0 ? `，失败 ${failCount} 篇` : ''}`)
      setSelectedTitleIds([])
      setSelectedSavedTitleIds([])
      // 只清空新生成的标题
      setGeneratedTitles([])
      // 已保存标题中移除已生成的，避免重复显示
      setSavedTitles(prev => prev.filter(t => !titlesToGenerate.some(sel => sel.id === t.id)))
      setGenerationProgress(null)
      fetchArticles()
      // 刷新已保存的标题列表
      fetchSavedTitles()
    } catch {
      message.error('批量生成文章失败')
    } finally {
      setGeneratingArticles(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>文章管理</h2>
        <Space>
          <Button
            type="primary"
            onClick={() => setShowPublishWizard(true)}
          >
            生成标题
          </Button>
          <Button
            type="default"
            onClick={() => router.push('/admin/articles/new')}
          >
            完整发布
          </Button>
          <Button
            type="default"
            icon={<PlusOutlined />}
            onClick={() => router.push('/admin/articles/new')}
          >
            新建文章
          </Button>
        </Space>
      </div>

      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="已保存标题数" value={savedTitles.length} prefix={<DatabaseOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="新生成标题数" value={generatedTitles.length} prefix={<PlusOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="选中生成（已保存）" value={selectedSavedTitleIds.length} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="选中生成（新生成）" value={selectedTitleIds.length} />
          </Card>
        </Col>
      </Row>

      {/* 已保存的标题区域 */}
      {savedTitles.length > 0 && (
        <Card 
          title={
            <Space>
              <DatabaseOutlined />
              <span>已保存的标题</span>
              <Badge count={savedTitles.length} showZero style={{ backgroundColor: '#52c41a' }} />
              {selectedSavedTitleIds.length > 0 && (
                <Badge count={`已选择 ${selectedSavedTitleIds.length}`} style={{ backgroundColor: '#1890ff' }} />
              )}
            </Space>
          }
          extra={
            <Space>
              <Button 
                onClick={() => {
                  const allIds = savedTitles.map(t => t.id)
                  setSelectedSavedTitleIds(allIds)
                }}
              >
                全选
              </Button>
              <Button 
                onClick={() => setSelectedSavedTitleIds([])}
              >
                取消全选
              </Button>
              <Button 
                type="primary"
                onClick={() => {
                  const selectedTitles = savedTitles.filter(t => selectedSavedTitleIds.includes(t.id))
                  if (selectedTitles.length === 0) {
                    message.warning('请至少选择一个标题')
                    return
                  }
                  setQuickGenerateVisible(true)
                  setPendingGenerateTitles(selectedTitles)
                }}
                loading={generatingArticles}
                disabled={selectedSavedTitleIds.length === 0}
              >
                快速生成 ({selectedSavedTitleIds.length})
              </Button>
              <Button 
                onClick={fetchSavedTitles}
                loading={loadingSavedTitles}
              >
                刷新
              </Button>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 16]}>
            {savedTitles.map((title) => (
              <Col xs={24} sm={12} md={8} lg={6} key={title.id}>
                <Card
                  hoverable
                  style={{
                    borderColor: selectedTitleIds.includes(title.id) ? '#1890ff' : undefined,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    if (selectedSavedTitleIds.includes(title.id)) {
                      setSelectedSavedTitleIds(selectedSavedTitleIds.filter(id => id !== title.id))
                    } else {
                      setSelectedSavedTitleIds([...selectedSavedTitleIds, title.id])
                    }
                  }}
                >
                  <Checkbox
                    checked={selectedSavedTitleIds.includes(title.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSavedTitleIds([...selectedSavedTitleIds, title.id])
                      } else {
                        setSelectedSavedTitleIds(selectedSavedTitleIds.filter(id => id !== title.id))
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {title.title}
                  </Checkbox>
                  {(title.score ?? 0) > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <Badge 
                        count={`推荐度: ${title.score ?? 0}%`} 
                        style={{ 
                          backgroundColor: (title.score ?? 0) >= 90 ? '#52c41a' : (title.score ?? 0) >= 80 ? '#1890ff' : '#faad14' 
                        }}
                      />
                    </div>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* 新生成的标题选择区域 */}
      {generatedTitles.length > 0 && (
        <Card 
          title={
            <Space>
              <span>新生成的标题</span>
              <Badge count={generatedTitles.length} showZero style={{ backgroundColor: '#1890ff' }} />
              {selectedTitleIds.length > 0 && (
                <Badge count={`已选择 ${selectedTitleIds.length}`} style={{ backgroundColor: '#52c41a' }} />
              )}
            </Space>
          }
          extra={
            <Space>
              <Button 
                onClick={() => {
                  setSelectedTitleIds(generatedTitles.map(t => t.id))
                }}
              >
                全选
              </Button>
              <Button 
                onClick={() => setSelectedTitleIds([])}
              >
                取消全选
              </Button>
              <Button 
                type="primary"
                onClick={() => {
                  const selectedTitles = generatedTitles.filter(t => selectedTitleIds.includes(t.id))
                  if (selectedTitles.length === 0) {
                    message.warning('请至少选择一个标题')
                    return
                  }
                  setQuickGenerateVisible(true)
                  setPendingGenerateTitles(selectedTitles)
                }}
                loading={generatingArticles}
                disabled={selectedTitleIds.length === 0}
              >
                快速生成 ({selectedTitleIds.length})
              </Button>
              <Button 
                danger
                onClick={() => {
                  setGeneratedTitles([])
                  setSelectedTitleIds([])
                }}
              >
                清空
              </Button>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 16]}>
            {generatedTitles.map((title) => (
              <Col xs={24} sm={12} md={8} lg={6} key={title.id}>
                <Card
                  hoverable
                  style={{
                    borderColor: selectedSavedTitleIds.includes(title.id) ? '#1890ff' : undefined,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    if (selectedSavedTitleIds.includes(title.id)) {
                      setSelectedSavedTitleIds(selectedSavedTitleIds.filter(id => id !== title.id))
                    } else {
                      setSelectedSavedTitleIds([...selectedSavedTitleIds, title.id])
                    }
                  }}
                >
                  <Checkbox
                    checked={selectedSavedTitleIds.includes(title.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSavedTitleIds([...selectedSavedTitleIds, title.id])
                      } else {
                        setSelectedSavedTitleIds(selectedSavedTitleIds.filter(id => id !== title.id))
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {title.title}
                  </Checkbox>
                  {(title.score ?? 0) > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <Badge 
                        count={`推荐度: ${title.score ?? 0}%`} 
                        style={{ 
                          backgroundColor: (title.score ?? 0) >= 90 ? '#52c41a' : (title.score ?? 0) >= 80 ? '#1890ff' : '#faad14' 
                        }}
                      />
                    </div>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* 搜索和筛选区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="搜索标题、内容..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="状态"
              value={statusFilter || undefined}
              onChange={setStatusFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="draft">草稿</Option>
              <Option value="published">已发布</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="标签类别"
              value={categoryFilter || undefined}
              onChange={setCategoryFilter}
              allowClear
              style={{ width: '100%' }}
            >
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="文章标题"
              value={titleFilter || undefined}
              onChange={setTitleFilter}
              allowClear
              style={{ width: '100%' }}
            >
              {articleTitles.map(title => (
                <Option key={title.id} value={title.id}>{title.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="排序方式"
              value={sortBy}
              onChange={(value) => {
                const [field, order] = value.split('-')
                setSortBy(field)
                setSortOrder(order as 'asc' | 'desc')
              }}
              style={{ width: '100%' }}
            >
              <Option value="createdAt-desc">创建时间（新→旧）</Option>
              <Option value="createdAt-asc">创建时间（旧→新）</Option>
              <Option value="publishDate-desc">发布日期（新→旧）</Option>
              <Option value="publishDate-asc">发布日期（旧→新）</Option>
              <Option value="title-asc">标题（A→Z）</Option>
              <Option value="title-desc">标题（Z→A）</Option>
            </Select>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
              placeholder={['开始日期', '结束日期']}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleResetFilters}
            >
              重置筛选
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 批量操作栏 */}
      {selectedRowKeys.length > 0 && (
        <Card style={{ marginBottom: 16, background: '#e6f7ff' }}>
          <Space>
            <span>已选择 {selectedRowKeys.length} 项</span>
            <Button
              type="primary"
              onClick={() => handleBatchUpdateStatus('published')}
            >
              批量发布
            </Button>
            <Button onClick={() => handleBatchUpdateStatus('draft')}>
              批量设为草稿
            </Button>
            <Popconfirm
              title={`确定要删除选中的 ${selectedRowKeys.length} 篇文章吗？`}
              onConfirm={handleBatchDelete}
              okText="确定"
              cancelText="取消"
            >
              <Button danger>批量删除</Button>
            </Popconfirm>
            <Button onClick={() => setSelectedRowKeys([])}>取消选择</Button>
          </Space>
        </Card>
      )}

      {loading ? (
        <Card>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      ) : (
        <Table
          columns={columns}
          dataSource={articles}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
          rowSelection={rowSelection}
        />
      )}

      {/* 发布向导 */}
      {showPublishWizard && (
        <PublishWizard
          onTitlesGenerated={handleTitlesGenerated}
          onCancel={() => setShowPublishWizard(false)}
          onComplete={() => {
            setShowPublishWizard(false)
            fetchArticles()
          }}
        />
      )}

      {/* 快速生成弹窗：输入文章提示词后再执行 */}
      <Modal
        title="快速生成并发布"
        open={quickGenerateVisible}
        onCancel={() => {
          setQuickGenerateVisible(false)
          setPendingGenerateTitles([])
        }}
        onOk={async () => {
          if (pendingGenerateTitles.length === 0) {
            message.warning('请至少选择一个标题')
            return
          }
          await handleBatchGenerateArticlesFromTitles(pendingGenerateTitles.map(t => ({ id: t.id, name: t.title })))
          setQuickGenerateVisible(false)
          setPendingGenerateTitles([])
        }}
        okText="继续"
        cancelText="取消"
        confirmLoading={generatingArticles}
        destroyOnHidden
      >
        <Space orientation="vertical" style={{ width: '100%' }}>
          <div>将跳过超链接和标签设置，直接生成并发布文章。</div>
          <Input.TextArea
            placeholder="可选：文章生成提示词（风格/重点/语气），留空则使用默认"
            value={quickArticlePrompt}
            onChange={(e) => setQuickArticlePrompt(e.target.value)}
            allowClear
            rows={4}
            maxLength={500}
            showCount
            style={{ resize: 'vertical' }}
          />
          <div style={{ color: '#999', fontSize: '12px' }}>提示词会作用于本次批量快速生成中的所有选中标题。</div>
        </Space>
      </Modal>
    </div>
  )
}

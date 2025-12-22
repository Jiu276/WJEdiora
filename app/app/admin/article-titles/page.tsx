'use client'

import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Space, message, Row, Col, Checkbox, Spin, Popconfirm, Tabs, Progress, Badge, Statistic } from 'antd'
import { PlusOutlined, ReloadOutlined, SaveOutlined, DeleteOutlined, DatabaseOutlined, SearchOutlined, BarChartOutlined } from '@ant-design/icons'

const { TextArea } = Input

interface GeneratedTitle {
  id: string
  title: string
  titleZh?: string
  titleEn?: string
  score: number
}

interface SavedTitle {
  id: string
  name: string
  slug: string
  description: string | null
  createdAt: string
}

export default function ArticleTitlesPage() {
  const defaultPrompt =
    '请根据https://www.wildoakboutique.com/ 网站，帮我生成与该网站相关的10个英文标题。附上中文翻译'
  const [prompt, setPrompt] = useState<string>(defaultPrompt)
  const [generatedTitles, setGeneratedTitles] = useState<GeneratedTitle[]>([])
  const [savedTitles, setSavedTitles] = useState<SavedTitle[]>([])
  const [selectedTitleIds, setSelectedTitleIds] = useState<string[]>([])
  const [selectedSavedTitleIds, setSelectedSavedTitleIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingSaved, setLoadingSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('generate')
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [generating, setGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState<{ current: number; total: number; percentage: number } | null>(null)
  const [isEnglishPreferred, setIsEnglishPreferred] = useState<boolean>(false)
  const [form] = Form.useForm()

  // 加载已保存的标题
  useEffect(() => {
    // 初始化加载一次，保证统计信息可用
    fetchSavedTitles()
  }, [])

  useEffect(() => {
    if (activeTab === 'saved') {
      fetchSavedTitles()
    }
  }, [activeTab])

  const fetchSavedTitles = async () => {
    setLoadingSaved(true)
    try {
      const res = await fetch('/api/article-titles?excludeUsed=true')
      const data = await res.json()
      if (Array.isArray(data)) {
        setSavedTitles(data)
      } else {
        setSavedTitles([])
      }
    } catch (error) {
      console.error('Error fetching saved titles:', error)
      setSavedTitles([])
    } finally {
      setLoadingSaved(false)
    }
  }

  const handleGenerateTitles = async () => {
    if (!prompt.trim()) {
      message.warning('请输入提示词')
      return
    }

    // 检测提示词是否要求英文标题
    const englishKeywords = ['英文', 'English', 'english']
    setIsEnglishPreferred(englishKeywords.some(k => prompt.includes(k)))

    // 清空之前的标题
    setGeneratedTitles([])
    setSelectedTitleIds([])
    setGenerating(true)
    setGenerationProgress({ current: 0, total: 10, percentage: 0 })

    try {
      const eventSource = new EventSource(
        `/api/generate-titles/stream?prompt=${encodeURIComponent(prompt.trim())}`
      )

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === 'title') {
            // 接收到新标题
            setGeneratedTitles((prev) => {
              // 检查是否已存在（避免重复）
              const exists = prev.some((t) => t.id === data.data.index.toString())
              if (exists) {
                return prev
              }
              return [
                ...prev,
                {
                  id: data.data.index.toString(),
                  title: data.data.title_zh || data.data.title || '',
                  titleZh: data.data.title_zh,
                  titleEn: data.data.title_en,
                  score: Math.round((data.data.score || 0.9) * 100),
                },
              ]
            })
          } else if (data.type === 'progress') {
            // 更新进度
            setGenerationProgress(data.data)
          } else if (data.type === 'complete') {
            // 生成完成
            setGenerating(false)
            setGenerationProgress(null)
            eventSource.close()
            message.success(`成功生成 ${data.data.total} 个标题`)
          } else if (data.type === 'error') {
            // 发生错误
            setGenerating(false)
            setGenerationProgress(null)
            eventSource.close()
            
            const errorMsg = data.data.message || '生成标题失败'
            const errorDetails = data.data.details || ''
            
            // 显示详细错误信息
            message.error({
              content: (
                <div>
                  <div>{errorMsg}</div>
                  {errorDetails && (
                    <div style={{ fontSize: '12px', marginTop: 4, color: '#999' }}>
                      {errorDetails.length > 100 ? errorDetails.substring(0, 100) + '...' : errorDetails}
                    </div>
                  )}
                </div>
              ),
              duration: 8,
            })
            
            console.error('Generation error:', data.data)
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error)
        setGenerating(false)
        setGenerationProgress(null)
        eventSource.close()
        
        // 检查是否是网络错误
        if (eventSource.readyState === EventSource.CLOSED) {
          message.error({
            content: '连接中断。可能是网络问题（国内访问 Google API 可能受限）。建议：1) 检查网络连接 2) 使用代理/VPN 3) 或使用模板生成',
            duration: 8,
          })
        } else {
          message.error('连接中断，请重试')
        }
      }
    } catch (error) {
      console.error('Generate titles error:', error)
      setGenerating(false)
      setGenerationProgress(null)
      message.error({
        content: '生成标题失败。可能是网络问题（国内访问 Google API 可能受限）。你可以尝试使用模板生成作为备选方案。',
        duration: 8,
      })
    }
  }

  // 使用降级方案（模板生成）
  const handleGenerateTitlesFallback = async () => {
    if (!prompt.trim()) {
      message.warning('请输入提示词')
      return
    }

    setLoading(true)
    setGeneratedTitles([])
    setSelectedTitleIds([])

    try {
      const res = await fetch('/api/generate-titles/fallback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
        }),
      })

      const data = await res.json()

      if (data.titles && Array.isArray(data.titles) && data.titles.length > 0) {
        setGeneratedTitles(data.titles)
        setSelectedTitleIds([])
        message.warning({
          content: data.message || '已使用模板生成标题（AI API 不可用时使用）',
          duration: 5,
        })
      } else {
        message.error('未能生成标题，请重试')
        setGeneratedTitles([])
      }
    } catch (error) {
      console.error('Fallback generation error:', error)
      message.error('生成标题失败，请检查网络连接')
      setGeneratedTitles([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedTitleIds.length === generatedTitles.length) {
      setSelectedTitleIds([])
    } else {
      setSelectedTitleIds(generatedTitles.map(t => t.id))
    }
  }

  const handleToggleTitle = (titleId: string) => {
    if (selectedTitleIds.includes(titleId)) {
      setSelectedTitleIds(selectedTitleIds.filter(id => id !== titleId))
    } else {
      setSelectedTitleIds([...selectedTitleIds, titleId])
    }
  }

  const handleClear = () => {
    setPrompt('')
    setGeneratedTitles([])
    setSelectedTitleIds([])
    setGenerating(false)
    setGenerationProgress(null)
    form.resetFields()
  }

  const handleDeleteSavedTitle = async (id: string) => {
    try {
      const res = await fetch(`/api/article-titles/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        message.success('删除成功')
        fetchSavedTitles()
      } else {
        message.error('删除失败')
      }
    } catch (error) {
      console.error('Delete error:', error)
      message.error('删除失败')
    }
  }

  const handleBatchDeleteSavedTitles = async () => {
    if (selectedSavedTitleIds.length === 0) {
      message.warning('请至少选择一个标题')
      return
    }

    try {
      const promises = selectedSavedTitleIds.map(id =>
        fetch(`/api/article-titles/${id}`, { method: 'DELETE' })
      )
      await Promise.all(promises)
      message.success(`成功删除 ${selectedSavedTitleIds.length} 个标题`)
      setSelectedSavedTitleIds([])
      fetchSavedTitles()
    } catch {
      message.error('批量删除失败')
    }
  }

  const handleSaveToDatabase = async (saveSelectedOnly = false) => {
    const titlesToSave = saveSelectedOnly && selectedTitleIds.length > 0
      ? generatedTitles.filter(t => selectedTitleIds.includes(t.id))
      : generatedTitles

    if (titlesToSave.length === 0) {
      message.warning(saveSelectedOnly ? '请先选择要保存的标题' : '没有可保存的标题')
      return
    }

    setSaving(true)
    try {
      // 根据英文/中文偏好，整理要保存的标题字段
      const payloadTitles = titlesToSave.map(t => {
        const mainTitle = isEnglishPreferred
          ? t.titleEn || t.title || ''
          : t.titleZh || t.title || ''

        const descParts: string[] = []
        if (isEnglishPreferred && (t.titleZh || t.title)) {
          descParts.push(`中文：${t.titleZh || t.title}`)
        }
        descParts.push(`推荐度: ${t.score}%`)

        return {
          title: mainTitle,
          description: descParts.join(' | '),
          score: t.score,
        }
      })

      const res = await fetch('/api/article-titles/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titles: payloadTitles,
        }),
      })

      const data = await res.json()

      if (data.success) {
        const savedCount = data.saved || 0
        const totalCount = data.total || generatedTitles.length
        if (savedCount === totalCount) {
          message.success(`成功保存 ${savedCount} 个标题到数据库`)
        } else {
          message.warning(`成功保存 ${savedCount} 个标题，${totalCount - savedCount} 个已存在（已跳过）`)
        }
        
        // 保存后刷新已保存列表
        if (activeTab === 'saved') {
          fetchSavedTitles()
        }
        
        // 如果保存的是选中的标题，只移除已保存的
        if (saveSelectedOnly && selectedTitleIds.length > 0) {
          setGeneratedTitles(generatedTitles.filter(t => !selectedTitleIds.includes(t.id)))
          setSelectedTitleIds([])
        } else {
          // 保存全部后清空
          setGeneratedTitles([])
          setSelectedTitleIds([])
        }
        
        // 提示切换到已保存标签页查看
        if (activeTab === 'generate') {
          message.info('标题已保存，可在"已保存的标题"标签页查看')
        }
      } else {
        message.error(data.error || '保存失败')
      }
    } catch (error) {
      console.error('Save titles error:', error)
      message.error('保存标题失败，请检查网络连接')
    } finally {
      setSaving(false)
    }
  }

  const tabItems = [
    {
      key: 'generate',
      label: '生成标题',
      icon: <PlusOutlined />,
    },
    {
      key: 'saved',
      label: '已保存的标题',
      icon: <DatabaseOutlined />,
    },
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>文章标题管理</h2>

      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已保存标题数"
              value={savedTitles.length}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="本次生成数"
              value={generatedTitles.length}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已选择待保存"
              value={selectedTitleIds.length}
              prefix={<SaveOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已选择待删除"
              value={selectedSavedTitleIds.length}
              prefix={<DeleteOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        style={{ marginBottom: 24 }}
      />

      {/* 生成标题标签页 */}
      {activeTab === 'generate' && (
        <>
          {/* 提示词输入区域 */}
          <Card title="输入提示词生成标题" style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical">
          <Form.Item label="提示词" required>
            <TextArea
              placeholder="请输入您想要生成文章标题的提示词，例如：如何提升工作效率、健康饮食指南、旅行攻略、科技前沿趋势等"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <div style={{ marginBottom: 16, color: '#666', fontSize: '14px' }}>
            <p>💡 提示：</p>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>输入清晰的提示词可以帮助生成更符合您需求的标题</li>
              <li>提示词可以是主题、关键词、问题或描述性文字</li>
              <li>系统将根据提示词自动生成 10 个标题建议</li>
            </ul>
          </div>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleGenerateTitles}
                loading={generating}
                disabled={generating || loading}
                size="large"
              >
                {generating ? '正在生成...' : '生成标题 (AI)'}
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleGenerateTitlesFallback}
                loading={loading}
                disabled={generating || loading}
                size="large"
              >
                模板生成 (备选)
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleClear}
                disabled={generating || loading || saving}
              >
                清空
              </Button>
              {generationProgress && (
                <div style={{ display: 'inline-block', marginLeft: 16, minWidth: 200 }}>
                  <Progress
                    percent={generationProgress.percentage}
                    status={generating ? 'active' : 'success'}
                    format={() => `${generationProgress.current}/${generationProgress.total}`}
                  />
                </div>
              )}
            </Space>
            <div style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>
              💡 提示：如果 AI 生成失败（网络问题），可以使用&ldquo;模板生成&rdquo;作为备选方案
            </div>
          </Form.Item>
        </Form>
      </Card>

      {/* 生成的标题列表 */}
      {generatedTitles.length > 0 && (
        <Card
          title={
            <Space>
              <span>已生成标题</span>
              <Badge count={generatedTitles.length} showZero style={{ backgroundColor: '#1890ff' }} />
              {selectedTitleIds.length > 0 && (
                <Badge count={`已选择 ${selectedTitleIds.length}`} style={{ backgroundColor: '#52c41a' }} />
              )}
            </Space>
          }
          extra={
            <Space>
              <Button onClick={handleSelectAll}>
                {selectedTitleIds.length === generatedTitles.length ? '取消全选' : '全选'}
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={() => handleSaveToDatabase(false)}
                loading={saving}
                disabled={generatedTitles.length === 0}
              >
                保存全部 ({generatedTitles.length})
              </Button>
              {selectedTitleIds.length > 0 && (
                <Button
                  icon={<SaveOutlined />}
                  onClick={() => handleSaveToDatabase(true)}
                  loading={saving}
                >
                  保存选中 ({selectedTitleIds.length})
                </Button>
              )}
              <span style={{ color: '#666' }}>
                已选择 {selectedTitleIds.length} / {generatedTitles.length}
              </span>
            </Space>
          }
        >
          {generating && generatedTitles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
              <p style={{ marginTop: 16 }}>
                正在生成标题... {generationProgress && `(${generationProgress.current}/${generationProgress.total})`}
              </p>
              {generationProgress && (
                <Progress
                  percent={generationProgress.percentage}
                  status="active"
                  style={{ marginTop: 16, maxWidth: 400, margin: '16px auto 0' }}
                />
              )}
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {generatedTitles.map((title) => (
                <Col xs={24} sm={12} md={8} lg={6} key={title.id}>
                  <Card
                    hoverable
                    style={{
                      borderColor: selectedTitleIds.includes(title.id) ? '#1890ff' : undefined,
                      cursor: 'pointer',
                      height: '100%',
                    }}
                    onClick={() => handleToggleTitle(title.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <Checkbox
                        checked={selectedTitleIds.includes(title.id)}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleToggleTitle(title.id)
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 500, marginBottom: 8 }}>
                          {isEnglishPreferred
                            ? title.titleEn || title.title || ''
                            : title.titleZh || title.title || ''}
                        </p>
                        {isEnglishPreferred && (title.titleZh || title.title) && (
                          <p style={{ margin: 0, color: '#666', fontSize: 12 }}>
                            中文：{title.titleZh || title.title}
                          </p>
                        )}
                        <div style={{ marginTop: 4 }}>
                          <Badge 
                            count={`推荐度: ${title.score}%`} 
                            style={{ 
                              backgroundColor: title.score >= 90 ? '#52c41a' : title.score >= 80 ? '#1890ff' : '#faad14',
                              fontSize: '11px'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {selectedTitleIds.length > 0 && (
            <div style={{ marginTop: 24, padding: 16, background: '#f0f0f0', borderRadius: 4 }}>
              <p style={{ margin: 0, marginBottom: 8 }}>
                <strong>已选择 {selectedTitleIds.length} 个标题</strong>
              </p>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                您可以点击&ldquo;保存到数据库&rdquo;按钮将这些标题保存，然后在&ldquo;文章管理&rdquo;页面使用它们批量生成文章
              </p>
            </div>
          )}
        </Card>
      )}

      {/* 空状态提示 */}
      {!loading && generatedTitles.length === 0 && prompt && (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <p>暂无生成的标题</p>
            <p style={{ fontSize: '14px' }}>请在上方输入提示词并点击&ldquo;生成标题&rdquo;按钮</p>
          </div>
        </Card>
      )}

      {/* 初始状态提示 */}
      {!loading && generatedTitles.length === 0 && !prompt && (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <p>👆 在上方输入提示词开始生成标题</p>
            <p style={{ fontSize: '14px', marginTop: 8 }}>
              例如：&ldquo;如何提升工作效率&rdquo;、&ldquo;健康饮食指南&rdquo;、&ldquo;旅行攻略&rdquo;等
            </p>
          </div>
        </Card>
      )}
        </>
      )}

      {/* 已保存标题标签页 */}
      {activeTab === 'saved' && (
        <>
          <Card style={{ marginBottom: 16 }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Input
                placeholder="搜索标题..."
                prefix={<SearchOutlined />}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                allowClear
                style={{ width: 300 }}
              />
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
                {selectedSavedTitleIds.length > 0 && (
                  <Popconfirm
                    title={`确定要删除选中的 ${selectedSavedTitleIds.length} 个标题吗？`}
                    onConfirm={handleBatchDeleteSavedTitles}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button danger icon={<DeleteOutlined />}>
                      批量删除 ({selectedSavedTitleIds.length})
                    </Button>
                  </Popconfirm>
                )}
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchSavedTitles}
                  loading={loadingSaved}
                >
                  刷新
                </Button>
              </Space>
            </Space>
          </Card>

          <Card
            title={
              <Space>
                <span>已保存的标题</span>
                <Badge count={savedTitles.length} showZero style={{ backgroundColor: '#52c41a' }} />
              </Space>
            }
          >
          {loadingSaved ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
              <p style={{ marginTop: 16 }}>加载中...</p>
            </div>
          ) : savedTitles.length > 0 ? (
            <>
              <Row gutter={[16, 16]}>
                {savedTitles
                  .filter((title) => {
                    if (!searchKeyword.trim()) return true
                    const keyword = searchKeyword.toLowerCase()
                    return (
                      title.name.toLowerCase().includes(keyword) ||
                      title.slug.toLowerCase().includes(keyword) ||
                      (title.description && title.description.toLowerCase().includes(keyword))
                    )
                  })
                  .map((title) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={title.id}>
                    <Card
                      hoverable
                      style={{
                        borderColor: selectedSavedTitleIds.includes(title.id) ? '#1890ff' : undefined,
                        cursor: 'pointer',
                        height: '100%',
                      }}
                      onClick={() => {
                        if (selectedSavedTitleIds.includes(title.id)) {
                          setSelectedSavedTitleIds(selectedSavedTitleIds.filter(id => id !== title.id))
                        } else {
                          setSelectedSavedTitleIds([...selectedSavedTitleIds, title.id])
                        }
                      }}
                      extra={
                        <Popconfirm
                          title="确定要删除这个标题吗？"
                          onConfirm={(e) => {
                            e?.stopPropagation()
                            handleDeleteSavedTitle(title.id)
                          }}
                          okText="确定"
                          cancelText="取消"
                        >
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Popconfirm>
                      }
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <Checkbox
                          checked={selectedSavedTitleIds.includes(title.id)}
                          onChange={(e) => {
                            e.stopPropagation()
                            if (e.target.checked) {
                              setSelectedSavedTitleIds([...selectedSavedTitleIds, title.id])
                            } else {
                              setSelectedSavedTitleIds(selectedSavedTitleIds.filter(id => id !== title.id))
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: 500, marginBottom: 8, fontSize: '14px' }}>
                            {title.name}
                          </p>
                          <div style={{ color: '#999', fontSize: '11px', marginBottom: 4 }}>
                            Slug: {title.slug}
                          </div>
                          {title.description && (
                            <div style={{ color: '#666', fontSize: '12px', marginBottom: 4 }}>
                              {title.description}
                            </div>
                          )}
                          <div style={{ color: '#999', fontSize: '11px', marginTop: 4 }}>
                            {new Date(title.createdAt).toLocaleString('zh-CN')}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
              {selectedSavedTitleIds.length > 0 && (
                <div style={{ marginTop: 24, padding: 16, background: '#f0f0f0', borderRadius: 4 }}>
                  <p style={{ margin: 0, marginBottom: 8 }}>
                    <strong>已选择 {selectedSavedTitleIds.length} 个标题</strong>
                  </p>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    您可以在&ldquo;文章管理&rdquo;页面使用这些标题批量生成文章
                  </p>
                </div>
              )}
            </>
          ) : searchKeyword.trim() ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <p>未找到匹配的标题</p>
              <p style={{ fontSize: '14px' }}>
                请尝试其他关键词
              </p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <p>暂无已保存的标题</p>
              <p style={{ fontSize: '14px' }}>
                请在&ldquo;生成标题&rdquo;标签页生成并保存标题
              </p>
            </div>
          )}
        </Card>
        </>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import {
  Modal,
  Steps,
  Form,
  Input,
  Button,
  Card,
  Space,
  List,
  DatePicker,
  Switch,
  Image,
  message,
  Spin,
} from 'antd'
import {
  CheckCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { TextArea } = Input

interface PublishWizardProps {
  article?: unknown
  onComplete: (data: Record<string, unknown>) => void
  onCancel: () => void
  onTitlesGenerated?: (titles: Array<{ id: string; title: string }>) => void // 新增：标题生成后的回调
}

export default function PublishWizard({
  article: _article,
  onComplete,
  onCancel,
  onTitlesGenerated,
}: PublishWizardProps) {
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  
  // Step 1: 输入提示词
  const [prompt, setPrompt] = useState<string>('')
  
  // Step 2: 标题选择
  const [titles, setTitles] = useState<Array<{ id: string; title: string; score?: number }>>([])
  const [selectedTitle, setSelectedTitle] = useState<string>('')
  const [customTitle, setCustomTitle] = useState('')
  
  // Step 3: 超链接
  const [links, setLinks] = useState<Array<{ keyword: string; url: string }>>([])
  const [newLink, setNewLink] = useState({ keyword: '', url: '' })
  
  // Step 4: 文章和配图
  const [generatedContent, setGeneratedContent] = useState('')
  const [images, setImages] = useState<Array<{ id: string; url: string; description?: string }>>([])
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [publishDate, setPublishDate] = useState(dayjs())
  const [enableKeywordLinks, setEnableKeywordLinks] = useState(false)

  const handleGenerateTitles = async () => {
    if (!prompt.trim()) {
      message.warning('请输入提示词')
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch('/api/generate-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
        }),
      })
      const data = await res.json()
      
      if (data.titles && data.titles.length > 0) {
        message.success(`成功生成 ${data.titles.length} 个标题`)
        // 如果有回调函数，调用它并关闭向导
        if (onTitlesGenerated) {
          onTitlesGenerated(data.titles)
          onCancel() // 关闭向导
        } else {
          // 如果没有回调，保持原有流程
          setTitles(data.titles)
          setCurrent(1)
        }
      } else {
        message.error('未能生成标题，请重试')
      }
    } catch {
      message.error('生成标题失败')
    } finally {
      setLoading(false)
    }
  }

  const handleStep2Next = () => {
    const finalTitle = selectedTitle || customTitle
    if (!finalTitle) {
      message.warning('请选择或输入标题')
      return
    }
    setCurrent(2)
  }

  const handleStep3Next = async () => {
    // 获取实际标题文本
    let finalTitleText = customTitle
    if (selectedTitle && !customTitle) {
      const selectedTitleObj = titles.find(t => t.id === selectedTitle)
      if (selectedTitleObj) {
        finalTitleText = selectedTitleObj.title
      }
    }
    
    if (!finalTitleText) {
      message.warning('请选择或输入标题')
      return
    }
    
    setGenerating(true)
    try {
      // 生成文章内容
      const contentRes = await fetch('/api/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: finalTitleText,
        }),
      })
      const contentData = await contentRes.json()
      setGeneratedContent(contentData.content)
      
      // 生成配图
      const imagesRes = await fetch('/api/auto-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: finalTitleText }),
      })
      const imagesData = await imagesRes.json()
      setImages(imagesData.images)
      
      setCurrent(3)
    } catch {
      message.error('生成失败')
    } finally {
      setGenerating(false)
    }
  }

  const handlePublish = () => {
    // 获取实际标题文本
    let finalTitleText = customTitle
    if (selectedTitle && !customTitle) {
      const selectedTitleObj = titles.find(t => t.id === selectedTitle)
      if (selectedTitleObj) {
        finalTitleText = selectedTitleObj.title
      }
    }
    
    if (!finalTitleText) {
      message.warning('请选择或输入标题')
      return
    }
    
    if (selectedImages.length < 3) {
      message.warning('请至少选择 3 张配图')
      return
    }
    
    // 获取选中的图片数据
    const selectedImagesData = images.filter((img) => selectedImages.includes(img.id))
    
    // 将选择的图片智能穿插到文章内容中
    let finalContent = generatedContent
    if (selectedImagesData.length > 0) {
      // 找到所有 h3 标题的位置，在标题和内容之间插入图片
      const parts = finalContent.split(/<h3>/)
      let newContent = parts[0] // 第一部分（标题和开头）
      
      // 为每个部分分配图片（平均分配）
      const imagesPerPart = Math.ceil(selectedImagesData.length / (parts.length - 1))
      let imageIndex = 0
      
      for (let i = 1; i < parts.length; i++) {
        const part = parts[i]
        const [title, ...contentParts] = part.split('</h3>')
        const content = contentParts.join('</h3>')
        
        // 添加标题
        newContent += `<h3>${title}</h3>`
        
        // 添加内容的第一段
        const firstParagraph = content.match(/<p>[\s\S]*?<\/p>/)?.[0] || ''
        newContent += firstParagraph
        
        // 在这个部分插入分配的图片
        const partImages = selectedImagesData.slice(imageIndex, imageIndex + imagesPerPart)
        if (partImages.length > 0) {
          const imageHtml = partImages.map((img) => {
            return `<figure style="margin: 30px 0; text-align: center;">
              <img src="${img.url}" alt="${img.description || finalTitleText}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
              ${img.description ? `<figcaption style="margin-top: 12px; color: #666; font-size: 14px; font-style: italic;">${img.description}</figcaption>` : ''}
            </figure>`
          }).join('\n')
          newContent += imageHtml
        }
        
        // 添加剩余内容
        const remainingContent = content.replace(firstParagraph, '')
        newContent += remainingContent
        
        imageIndex += imagesPerPart
      }
      
      finalContent = newContent
    }
    
    const articleData = {
      title: finalTitleText,
      content: finalContent,
      excerpt: finalContent.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
      categoryId: null,
      titleId: '1', // 默认标题
      customDomains: [], // 字符串数组
      links: links, // { keyword: string, url: string }[] 数组
      images: selectedImagesData, // 图片对象数组
      featuredImage: selectedImagesData[0]?.url || null,
      publishDate: publishDate.toISOString(),
      enableKeywordLinks,
    }
    
    onComplete(articleData)
  }

  const addLink = () => {
    if (newLink.keyword.trim() && newLink.url.trim()) {
      setLinks([...links, { ...newLink }])
      setNewLink({ keyword: '', url: '' })
    }
  }

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index))
  }

  const toggleImage = (imageId: string) => {
    if (selectedImages.includes(imageId)) {
      setSelectedImages(selectedImages.filter((id) => id !== imageId))
    } else {
      if (selectedImages.length < 5) {
        setSelectedImages([...selectedImages, imageId])
      } else {
        message.warning('最多选择 5 张图片')
      }
    }
  }

  return (
    <Modal
      title="发布文章向导"
      open={true}
      onCancel={onCancel}
      footer={null}
      width={800}
      style={{ top: 20 }}
    >
      <Steps 
        current={current} 
        style={{ marginBottom: 24 }}
        items={[
          { title: '输入提示词生成标题' },
          { title: '选择标题' },
          { title: '添加超链接' },
          { title: '生成文章和配图' },
        ]}
      />

      <div style={{ minHeight: 400 }}>
        {/* Step 1: 输入提示词生成标题 */}
        {current === 0 && (
          <div>
            <Form.Item label="提示词" required>
              <TextArea
                placeholder="请输入您想要生成文章标题的提示词，例如：如何提升工作效率、健康饮食指南、旅行攻略等"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                maxLength={500}
                showCount
              />
            </Form.Item>

            <div style={{ marginBottom: 16, color: '#666', fontSize: '14px' }}>
              <p>💡 提示：输入清晰的提示词可以帮助生成更符合您需求的标题</p>
            </div>

            <Button 
              type="primary" 
              onClick={handleGenerateTitles} 
              loading={loading} 
              block
              size="large"
            >
              生成标题
            </Button>
          </div>
        )}

        {/* Step 2: 选择标题 */}
        {current === 1 && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h4>生成的标题建议：</h4>
              <Space orientation="vertical" style={{ width: '100%' }}>
                {titles.map((title) => (
                  <Card
                    key={title.id}
                    hoverable
                    onClick={() => setSelectedTitle(title.id)}
                    style={{
                      cursor: 'pointer',
                      borderColor: selectedTitle === title.id ? '#1890ff' : undefined,
                    }}
                  >
                    <Space>
                      {selectedTitle === title.id && (
                        <CheckCircleOutlined style={{ color: '#1890ff' }} />
                      )}
                      <span>{title.title}</span>
                      <span style={{ color: '#999', fontSize: '12px' }}>
                        推荐度: {title.score}%
                      </span>
                    </Space>
                  </Card>
                ))}
              </Space>
            </div>

            <Form.Item label="或输入自定义标题">
              <Input
                placeholder="输入自定义标题"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
              />
            </Form.Item>

            <Space>
              <Button onClick={() => setCurrent(0)}>上一步</Button>
              <Button type="primary" onClick={handleStep2Next}>
                下一步
              </Button>
            </Space>
          </div>
        )}

        {/* Step 3: 添加超链接 */}
        {current === 2 && (
          <div>
            <Form.Item label="添加超链接（可选）">
              <Space orientation="vertical" style={{ width: '100%' }}>
                <Input
                  placeholder="关键字"
                  value={newLink.keyword}
                  onChange={(e) => setNewLink({ ...newLink, keyword: e.target.value })}
                />
                <Input
                  placeholder="URL（所有关键词可共用同一链接）"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={addLink} block>
                  添加超链接
                </Button>
                <div style={{ color: '#999', fontSize: 12 }}>
                  可跳过本步；已存在的链接不会被重复替换。
                </div>
              </Space>
            </Form.Item>

            {links.length > 0 && (
              <List
                dataSource={links}
                renderItem={(link, index) => (
                  <List.Item
                    key={index}
                    actions={[
                      <Button
                        key="delete"
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeLink(index)}
                      >
                        删除
                      </Button>
                    ]}
                  >
                    <span>{link.keyword}</span> → <a href={link.url}>{link.url}</a>
                  </List.Item>
                )}
              />
            )}

            <Space style={{ marginTop: 16 }}>
              <Button onClick={() => setCurrent(1)}>上一步</Button>
              <Button onClick={() => handleStep3Next()} loading={generating}>
                跳过超链接
              </Button>
              <Button type="primary" onClick={handleStep3Next} loading={generating}>
                生成文章和配图
              </Button>
            </Space>
          </div>
        )}

        {/* Step 4: 生成文章和配图 */}
        {current === 3 && (
          <Spin spinning={generating}>
            <div>
              <Form.Item label="生成的文章内容">
                <div
                  dangerouslySetInnerHTML={{ __html: generatedContent }}
                  style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: 4,
                    padding: 16,
                    maxHeight: 300,
                    overflow: 'auto',
                  }}
                />
              </Form.Item>

              <Form.Item label="选择配图（3-5张）">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {images.map((image) => (
                    <Card
                      key={image.id}
                      hoverable
                      cover={
                        <div style={{ position: 'relative' }}>
                          <Image
                            src={image.url}
                            alt={image.description}
                            style={{ width: '100%', height: 150, objectFit: 'cover' }}
                          />
                          {selectedImages.includes(image.id) && (
                            <div
                              style={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                background: '#1890ff',
                                borderRadius: '50%',
                                width: 24,
                                height: 24,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <CheckCircleOutlined style={{ color: '#fff' }} />
                            </div>
                          )}
                        </div>
                      }
                      onClick={() => toggleImage(image.id)}
                      style={{
                        cursor: 'pointer',
                        borderColor: selectedImages.includes(image.id)
                          ? '#1890ff'
                          : undefined,
                      }}
                    >
                      <Card.Meta description={image.description} />
                    </Card>
                  ))}
                </div>
                <div style={{ marginTop: 8, color: '#999' }}>
                  已选择 {selectedImages.length} / 5 张图片
                </div>
              </Form.Item>

              <Form.Item label="发布日期">
                <DatePicker
                  showTime
                  value={publishDate}
                  onChange={(date) => setPublishDate(date || dayjs())}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item label="启用关键字自动超链接">
                <Switch
                  checked={enableKeywordLinks}
                  onChange={setEnableKeywordLinks}
                />
              </Form.Item>

              <Space>
                <Button onClick={() => setCurrent(2)}>上一步</Button>
                <Button type="primary" onClick={handlePublish} block>
                  发布文章
                </Button>
              </Space>
            </div>
          </Spin>
        )}
      </div>
    </Modal>
  )
}

/**
 * Google Gemini API 工具函数
 */

// 注意：Next.js 的 fetch 可能不支持 agent
// 我们通过环境变量让系统代理生效，或者使用 node-fetch
// 代理库动态导入（如果需要）
// eslint-disable-next-line @typescript-eslint/no-require-imports
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let _HttpsProxyAgent: unknown = null
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let _HttpProxyAgent: unknown = null

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const httpsProxyAgent = require('https-proxy-agent')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const httpProxyAgent = require('http-proxy-agent')
  // 赋值给未使用的变量（保留以备将来使用）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _HttpsProxyAgent = httpsProxyAgent.HttpsProxyAgent || httpsProxyAgent.default
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _HttpProxyAgent = httpProxyAgent.HttpProxyAgent || httpProxyAgent.default
} catch {
  console.warn('代理库未安装，将使用环境变量代理')
}

const API_KEY = process.env.GOOGLE_AI_API_KEY

// 模型和版本配置 - 按优先级尝试
const MODEL_CANDIDATES = [
  { name: 'gemini-1.5-flash', version: 'v1beta' },
  { name: 'gemini-1.5-pro', version: 'v1beta' },
  { name: 'gemini-1.5-flash', version: 'v1' },
  { name: 'gemini-1.5-pro', version: 'v1' },
  { name: 'gemini-pro', version: 'v1beta' },
  { name: 'gemini-pro', version: 'v1' },
]

// 从环境变量获取配置，或使用默认值
const CONFIGURED_MODEL = process.env.GOOGLE_AI_MODEL
const CONFIGURED_VERSION = process.env.GOOGLE_AI_API_VERSION

const MODEL_NAME = CONFIGURED_MODEL || 'gemini-1.5-flash'
const API_VERSION = CONFIGURED_VERSION || 'v1beta'

// 如果环境变量指定了完整 URL，使用它（当前未使用，保留以备将来使用）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _API_URL = process.env.GOOGLE_AI_API_URL || `https://generativelanguage.googleapis.com/${API_VERSION}/models/${MODEL_NAME}`
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _STREAM_URL = process.env.GOOGLE_AI_STREAM_URL || `https://generativelanguage.googleapis.com/${API_VERSION}/models/${MODEL_NAME}:streamGenerateContent`

// 代理配置
const HTTPS_PROXY = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
const HTTP_PROXY = process.env.HTTP_PROXY

// 检查代理配置（用于日志）
if (HTTPS_PROXY) {
  console.log('✅ HTTPS 代理已配置:', HTTPS_PROXY.replace(/\/\/.*@/, '//***@')) // 隐藏密码
  // Next.js 的 fetch 会自动读取 HTTPS_PROXY 环境变量
}

if (HTTP_PROXY && !HTTPS_PROXY) {
  console.log('✅ HTTP 代理已配置:', HTTP_PROXY.replace(/\/\/.*@/, '//***@')) // 隐藏密码
  // Next.js 的 fetch 会自动读取 HTTP_PROXY 环境变量
}

if (!HTTPS_PROXY && !HTTP_PROXY) {
  console.log('ℹ️ 未配置代理，将直接连接（如果无法访问 Google API，请配置代理）')
}

if (!API_KEY) {
  console.warn('⚠️ GOOGLE_AI_API_KEY is not set')
}

console.log('📋 Gemini API 配置:', {
  model: MODEL_NAME,
  apiVersion: API_VERSION,
  hasProxy: !!(HTTPS_PROXY || HTTP_PROXY),
})

/**
 * 生成标题的提示词模板
 */
function buildPrompt(userPrompt: string): string {
  return `你是一个专业的文章标题生成助手。根据用户提供的提示词，生成10个高质量的文章标题。

要求：
1. 标题要吸引人、有创意、符合SEO优化
2. 每个标题都要有中英文版本，格式：中文标题 | English Title
3. 标题长度控制在30-60个字符
4. 标题要多样化，避免重复
5. 标题要准确反映提示词的内容

用户提示词：${userPrompt}

请严格按照以下JSON格式返回，不要添加任何其他文字：
{
  "titles": [
    {
      "title_zh": "中文标题",
      "title_en": "English Title",
      "score": 0.95
    }
  ]
}

只返回JSON，不要有其他说明文字。`
}

/**
 * 解析 Gemini API 返回的文本，提取标题
 */
function parseTitlesFromResponse(text: string): Array<{ title_zh: string; title_en: string; score: number }> {
  try {
    // 尝试提取 JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const json = JSON.parse(jsonMatch[0])
      if (json.titles && Array.isArray(json.titles)) {
        return json.titles
      }
    }

    // 如果 JSON 解析失败，尝试从文本中提取
    const lines = text.split('\n').filter(line => line.trim())
    const titles: Array<{ title_zh: string; title_en: string; score: number }> = []

    for (const line of lines) {
      // 匹配格式：中文标题 | English Title
      const match = line.match(/^(.+?)\s*\|\s*(.+)$/)
      if (match) {
        titles.push({
          title_zh: match[1].trim(),
          title_en: match[2].trim(),
          score: 0.85 + Math.random() * 0.1, // 0.85-0.95
        })
      } else if (line.trim().length > 10 && line.trim().length < 100) {
        // 如果没有分隔符，尝试作为中文标题
        titles.push({
          title_zh: line.trim(),
          title_en: line.trim(),
          score: 0.80 + Math.random() * 0.1, // 0.80-0.90
        })
      }

      if (titles.length >= 10) break
    }

    // 如果还是没提取到，生成默认标题
    if (titles.length === 0) {
      return Array.from({ length: 10 }, (_, i) => ({
        title_zh: `标题 ${i + 1}`,
        title_en: `Title ${i + 1}`,
        score: 0.75,
      }))
    }

    return titles.slice(0, 10)
  } catch (error) {
    console.error('Error parsing titles from response:', error)
    // 返回默认标题
    return Array.from({ length: 10 }, (_, i) => ({
      title_zh: `标题 ${i + 1}`,
      title_en: `Title ${i + 1}`,
      score: 0.75,
    }))
  }
}

/**
 * 调用 Gemini API 生成标题（非流式）
 */
export async function generateTitles(prompt: string): Promise<Array<{ title_zh: string; title_en: string; score: number }>> {
  if (!API_KEY) {
    throw new Error('GOOGLE_AI_API_KEY is not configured')
  }

  // 尝试找到可用的模型
  const workingModel = await findWorkingModel()
  if (!workingModel) {
    throw new Error('无法找到可用的 Gemini 模型。请检查 API Key 和项目配额。')
  }

  try {
    // 构建正确的 API 端点
    const endpoint = `${workingModel.url.replace(':streamGenerateContent', '')}:generateContent?key=${API_KEY}`
    
    console.log('🔗 调用 Gemini API:', {
      endpoint: endpoint.replace(API_KEY || '', '***'),
      model: workingModel.model,
      version: workingModel.version,
    })
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: buildPrompt(prompt),
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', response.status, errorText)
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    if (!text) {
      throw new Error('No content returned from Gemini API')
    }

    return parseTitlesFromResponse(text)
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    throw error
  }
}

/**
 * 尝试不同的模型和版本，找到可用的
 */
async function findWorkingModel(): Promise<{ model: string; version: string; url: string } | null> {
  if (!API_KEY) return null

  // 如果环境变量指定了完整配置，直接使用
  if (CONFIGURED_MODEL && CONFIGURED_VERSION && process.env.GOOGLE_AI_API_URL) {
    return {
      model: CONFIGURED_MODEL,
      version: CONFIGURED_VERSION,
      url: process.env.GOOGLE_AI_STREAM_URL || `${process.env.GOOGLE_AI_API_URL}:streamGenerateContent`,
    }
  }

  // 尝试每个模型和版本组合
  for (const candidate of MODEL_CANDIDATES) {
    const testUrl = `https://generativelanguage.googleapis.com/${candidate.version}/models/${candidate.name}:generateContent?key=${API_KEY}`
    
    try {
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'test' }] }],
        }),
      })

      if (response.ok) {
        console.log(`✅ 找到可用模型: ${candidate.version}/${candidate.name}`)
        return {
          model: candidate.name,
          version: candidate.version,
          url: `https://generativelanguage.googleapis.com/${candidate.version}/models/${candidate.name}:streamGenerateContent`,
        }
      }
    } catch {
      // 继续尝试下一个
      continue
    }
  }

  return null
}

/**
 * 流式调用 Gemini API 生成标题
 */
export async function* generateTitlesStream(prompt: string): AsyncGenerator<{
  type: 'title' | 'progress' | 'complete' | 'error'
  data: any
}> {
  if (!API_KEY) {
    yield {
      type: 'error',
      data: { message: 'GOOGLE_AI_API_KEY is not configured' },
    }
    return
  }

  // 尝试找到可用的模型
  const workingModel = await findWorkingModel()
  if (!workingModel) {
    yield {
      type: 'error',
      data: { 
        message: '无法找到可用的 Gemini 模型。请检查：1) API Key 是否正确 2) 项目配额是否可用 3) 网络连接是否正常',
        suggestions: [
          '在 Google AI Studio 检查项目配额状态',
          '设置结算信息以激活配额',
          '检查 API Key 是否有效',
          '尝试使用"模板生成"作为备选方案',
        ],
      },
    }
    return
  }

  const streamUrl = `${workingModel.url}?key=${API_KEY}`

  try {
    // 添加超时和错误处理
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60秒超时

    let response: Response
    try {
      // 配置 fetch 选项
      // 注意：Next.js 的 fetch 会自动读取 HTTPS_PROXY 和 HTTP_PROXY 环境变量
      // 如果设置了这些环境变量，fetch 会自动使用代理
      const fetchOptions: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: buildPrompt(prompt),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
        signal: controller.signal,
      }

      // 使用找到的可用的模型端点
      console.log('🔗 调用 Gemini Stream API:', {
        model: workingModel.model,
        version: workingModel.version,
        endpoint: streamUrl.replace(API_KEY || '', '***'),
      })
      
      // Next.js 的 fetch 会自动使用 HTTPS_PROXY 和 HTTP_PROXY 环境变量
      // 不需要手动设置 agent
      response = await fetch(streamUrl, fetchOptions)
      clearTimeout(timeoutId)
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      
      // 网络错误处理
      if (fetchError.name === 'AbortError') {
        yield {
          type: 'error',
          data: { message: '请求超时，请检查网络连接或稍后重试' },
        }
        return
      }
      
      if (fetchError.message?.includes('fetch failed') || fetchError.cause) {
        yield {
          type: 'error',
          data: { 
            message: '无法连接到 Google AI API，可能是网络问题。建议：1) 检查网络连接 2) 使用代理 3) 或使用 DeepSeek API',
            details: fetchError.message || 'Network error'
          },
        }
        return
      }
      
      throw fetchError
    }

      if (!response.ok) {
        let errorText = ''
        try {
          errorText = await response.text()
        } catch {
          errorText = '无法读取错误信息'
        }
        
        console.error('Gemini API error:', {
          status: response.status,
          statusText: response.statusText,
          model: MODEL_NAME,
          version: API_VERSION,
          error: errorText,
        })
        
        let errorMessage = `API 调用失败 (状态码: ${response.status})`
        const suggestions: string[] = []
        
        if (response.status === 401) {
          errorMessage = 'API Key 无效或已过期，请检查配置'
          suggestions.push('检查 API Key 是否正确')
          suggestions.push('在 Google AI Studio 验证 API Key 是否有效')
        } else if (response.status === 403) {
          errorMessage = 'API 访问被拒绝，可能是配额已用完或权限不足'
          suggestions.push('检查 API 配额是否用完')
          suggestions.push('检查项目配额状态（可能需要设置结算信息）')
          suggestions.push('检查 API Key 权限')
        } else if (response.status === 404) {
          errorMessage = `模型 ${workingModel.model} 在 API 版本 ${workingModel.version} 中未找到`
          suggestions.push('在 Google AI Studio 查看可用的模型列表')
          suggestions.push('检查项目配额状态（可能需要设置结算信息）')
          suggestions.push('某些新模型可能需要付费层级才能使用')
          suggestions.push('尝试使用"模板生成"作为备选方案')
        } else if (response.status === 429) {
          errorMessage = '请求过于频繁，已达到速率限制，请稍后重试'
          suggestions.push('等待几分钟后重试')
        } else if (response.status >= 500) {
          errorMessage = 'Google AI 服务暂时不可用，请稍后重试'
          suggestions.push('稍后重试')
        }
        
        yield {
          type: 'error',
          data: { 
            message: errorMessage,
            details: errorText,
            status: response.status,
            model: workingModel.model,
            version: workingModel.version,
            suggestions,
            triedModels: MODEL_CANDIDATES.map(m => `${m.version}/${m.name}`),
          },
        }
        return
      }

    const reader = response.body?.getReader()
    if (!reader) {
      yield {
        type: 'error',
        data: { message: 'No response body' },
      }
      return
    }

    const decoder = new TextDecoder()
    let buffer = ''
    let fullText = ''
    let titleCount = 0
    const totalTitles = 10

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const jsonStr = line.slice(6)
            if (jsonStr === '[DONE]') {
              // 解析完整文本，提取所有标题
              const titles = parseTitlesFromResponse(fullText)
              for (const title of titles) {
                titleCount++
                yield {
                  type: 'title',
                  data: {
                    index: titleCount,
                    title: `${title.title_zh} | ${title.title_en}`,
                    title_zh: title.title_zh,
                    title_en: title.title_en,
                    score: title.score,
                  },
                }
                yield {
                  type: 'progress',
                  data: {
                    current: titleCount,
                    total: totalTitles,
                    percentage: Math.round((titleCount / totalTitles) * 100),
                  },
                }
              }
              yield {
                type: 'complete',
                data: { total: titleCount },
              }
              return
            }

            const data = JSON.parse(jsonStr)
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
            if (text) {
              fullText += text
              // 尝试实时解析已生成的标题
              const titles = parseTitlesFromResponse(fullText)
              if (titles.length > titleCount) {
                for (let i = titleCount; i < titles.length; i++) {
                  titleCount++
                  yield {
                    type: 'title',
                    data: {
                      index: titleCount,
                      title: `${titles[i].title_zh} | ${titles[i].title_en}`,
                      title_zh: titles[i].title_zh,
                      title_en: titles[i].title_en,
                      score: titles[i].score,
                    },
                  }
                  yield {
                    type: 'progress',
                    data: {
                      current: titleCount,
                      total: totalTitles,
                      percentage: Math.round((titleCount / totalTitles) * 100),
                    },
                  }
                }
              }
            }
          } catch (error) {
            // 忽略解析错误，继续处理
            console.warn('Error parsing stream data:', error)
          }
        }
      }
    }

    // 处理剩余数据
    if (buffer.trim()) {
      try {
        const data = JSON.parse(buffer.replace('data: ', ''))
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        if (text) {
          fullText += text
        }
      } catch {
        // 忽略
      }
    }

    // 最终解析
    const titles = parseTitlesFromResponse(fullText)
    for (let i = titleCount; i < titles.length && i < totalTitles; i++) {
      titleCount++
      yield {
        type: 'title',
        data: {
          index: titleCount,
          title: `${titles[i].title_zh} | ${titles[i].title_en}`,
          title_zh: titles[i].title_zh,
          title_en: titles[i].title_en,
          score: titles[i].score,
        },
      }
    }

    yield {
      type: 'complete',
      data: { total: titleCount },
    }
  } catch (error) {
    console.error('Error in stream generation:', error)
    yield {
      type: 'error',
      data: { message: error instanceof Error ? error.message : 'Unknown error' },
    }
  }
}


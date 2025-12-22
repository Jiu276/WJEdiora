
const API_KEY = process.env.SPARK_API_KEY
const API_BASE_URL = process.env.SPARK_API_BASE_URL || 'https://xh.v1api.cc'
const TIMEOUT = parseInt(process.env.SPARK_TIMEOUT || '60000', 10)

// 组装模型候选列表：优先主模型，其次备选，最后兼容旧变量
function getModelCandidates() {
  const primary =
    process.env.SPARK_PRIMARY_MODEL ||
    process.env.SPARK_API_MODEL || // 兼容旧配置
    'gemini-3-pro-preview'

  const fallbacks =
    (process.env.SPARK_FALLBACK_MODELS || '')
      .split(',')
      .map(m => m.trim())
      .filter(Boolean)

  const all = [primary, ...fallbacks]
  // 去重
  return Array.from(new Set(all))
}

function ensureApiKey() {
  if (!API_KEY) {
    throw new Error('SPARK_API_KEY is not configured')
  }
}

function buildTitlePrompt(userPrompt: string) {
  return `你是专业的文章标题生成助手。根据用户提示词生成10个高质量标题。

【用户提示词】
${userPrompt}

【输出要求】
1. 必须返回一个完整的JSON对象，格式如下：
{
  "titles": [
    { "title_zh": "中文标题", "title_en": "English Title", "score": 0.95 },
    { "title_zh": "中文标题2", "title_en": "English Title 2", "score": 0.92 }
  ]
}

2. 标题要求：
   - 吸引人、有创意、符合SEO优化
   - 每个标题必须有中英文版本
   - 标题长度30-60字符
   - 标题要多样化，避免重复
   - 标题要准确反映提示词的内容

3. 输出格式：
   - 只返回JSON对象，不要任何其他文字
   - 不要使用Markdown代码块
   - 不要使用反引号
   - 不要分行输出字段
   - JSON必须是有效的、可解析的

请严格按照上述格式返回10个标题。`
}

function buildArticlePrompt(title: string, userPrompt?: string, category?: string, domains?: string[]) {
  return `You are a professional content writer. Generate a high-quality, well-structured article in JSON:
{
  "content": "完整的HTML文章内容",
  "excerpt": "文章摘要，100-200字，吸引人且概括全文要点",
  "tags": ["标签1", "标签2", "标签3"]
}

【文章信息】
标题：${title}
分类：${category || '通用'}
领域：${domains && domains.length > 0 ? domains.join('、') : '未指定'}
用户补充提示：${userPrompt || '无'}

【内容要求】
1. 结构：h2 作为主标题；3-5 个 h3 章节；段落用 p 标签；可用 ul/ol
2. 长度：正文 1500-3000 字；摘要 100-200 字
3. Language: default to English for content unless the user prompt explicitly requests Chinese; keep natural tone with real human touch.
4. SEO：自然融入关键词，避免堆砌
5. 输出必须是 JSON，且只输出 JSON
`
}

function parseTitlesFromText(text: string) {
  const cleaned = text.replace(/```json|```/gi, '').trim()
  try {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0])
      if (Array.isArray(data.titles)) return data.titles
    }
  } catch {
    // ignore
  }

  // 方案2：从文本中提取 title_zh/title_en 成对字段
  const pairMatches = Array.from(cleaned.matchAll(/"title_zh"\s*:\s*"([^"]+)"[\s\S]*?"title_en"\s*:\s*"([^"]+)"/gi))
  if (pairMatches.length > 0) {
    return pairMatches.slice(0, 10).map((m) => ({
      title_zh: m[1].trim(),
      title_en: m[2].trim(),
      score: 0.9,
    }))
  }

  // 方案3：行级解析（包含 “中文 | English” 格式）
  const lines = cleaned.split('\n').filter(l => l.trim())
  const titles: Array<{ title_zh: string; title_en: string; score: number }> = []
  for (const line of lines) {
    // 过滤掉 JSON 结构行
    if (/"titles"|"title_zh"|"title_en"|"score"/.test(line)) continue
    if (/^\s*[\{\[\}]/.test(line)) continue

    const m = line.match(/^(.+?)\s*\|\s*(.+)$/)
    if (m) {
      titles.push({ title_zh: m[1].trim(), title_en: m[2].trim(), score: 0.9 })
    } else if (line.trim().length > 5) {
      titles.push({ title_zh: line.trim(), title_en: line.trim(), score: 0.85 })
    }
    if (titles.length >= 10) break
  }
  if (titles.length === 0) {
    return Array.from({ length: 10 }, (_, i) => ({
      title_zh: `标题 ${i + 1}`,
      title_en: `Title ${i + 1}`,
      score: 0.8,
    }))
  }
  return titles
}

async function callChatCompletion(model: string, body: any, stream = false): Promise<Response> {
  ensureApiKey()

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT)

  try {
    const res = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model,
        stream,
        response_format: stream ? undefined : { type: 'json_object' },
        ...body,
      }),
      signal: controller.signal,
    })
    return res
  } finally {
    clearTimeout(timer)
  }
}

export async function generateTitles(
  prompt: string
): Promise<Array<{ title_zh: string; title_en: string; score: number }>> {
  const models = getModelCandidates()
  let lastError: any = null

  for (const model of models) {
    try {
      const res = await callChatCompletion(model, {
        messages: [
          { role: 'system', content: '你是一个专业的标题生成助手。你必须只返回有效的JSON对象，不要任何其他文字、Markdown、代码块或解释。' },
          { role: 'user', content: buildTitlePrompt(prompt) },
        ],
        temperature: 0.8,
        max_tokens: 2048,
      })

      if (!res.ok) {
        const text = await res.text()
        lastError = new Error(`Spark API error: ${res.status} ${text}`)
        continue
      }

      const data = await res.json()
      const content = data?.choices?.[0]?.message?.content || ''
      console.log(`[${model}] AI返回内容:`, content.substring(0, 500)) // 调试日志
      const titles = parseTitlesFromText(content)
      // 过滤占位标题
      const validTitles = titles.filter((t: { title_zh: string; title_en: string; score: number }) => {
        const zh = (t.title_zh || '').trim()
        const en = (t.title_en || '').trim()
        const isPlaceholder = /^标题\s*\d+$/i.test(zh) || /^title\s*\d+$/i.test(en)
        return !isPlaceholder
      })
      if (validTitles.length > 0) {
        console.log(`[${model}] 解析到 ${validTitles.length} 个有效标题`)
        return validTitles
      }
      console.warn(`[${model}] 解析结果全是占位标题，尝试下一个模型`)
    } catch (err) {
      lastError = err
      continue
    }
  }

  if (lastError) throw lastError
  return []
}

export async function generateTitlesStream(
  prompt: string
): Promise<Array<{ title_zh: string; title_en: string; score: number }>> {
  // 直接使用非流式生成，返回标题数组，路由层按需推流
  const titles = await generateTitles(prompt)
  return titles.slice(0, 10)
}

export async function generateArticle(params: {
  title: string
  userPrompt?: string
  category?: string
  domains?: string[]
}) {
  const { title, userPrompt, category, domains } = params
  const models = getModelCandidates()
  let lastError: any = null

  for (const model of models) {
    try {
      const res = await callChatCompletion(model, {
        messages: [
          { role: 'system', content: '你是一个专业的双语内容创作者，默认输出英文正文，仅返回JSON。' },
          { role: 'user', content: buildArticlePrompt(title, userPrompt, category, domains) },
        ],
        temperature: 0.8,
        max_tokens: 4096,
      })

      if (!res.ok) {
        const text = await res.text()
        lastError = new Error(`Spark API error: ${res.status} ${text}`)
        continue
      }

      const data = await res.json()
      const content = data?.choices?.[0]?.message?.content || ''
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content)
        return {
          content: parsed.content || '',
          excerpt: parsed.excerpt || '',
          tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        }
      } catch {
        // 解析失败，返回纯文本
        return {
          content: content || `<h2>${title}</h2><p>${content}</p>`,
          excerpt: content.slice(0, 200),
          tags: [],
        }
      }
    } catch (err) {
      lastError = err
      continue
    }
  }

  if (lastError) throw lastError
  return {
    content: `<h2>${title}</h2><p>生成失败，使用占位内容。</p>`,
    excerpt: '',
    tags: [],
  }
}


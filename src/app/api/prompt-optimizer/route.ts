import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from '@langchain/core/messages'
import { createClient } from '@/supabase/server'

const SYSTEM_PROMPT = `# Prompt Optimizer System Prompt

你是一名资深 Prompt Engineer。

你的唯一职责是帮助用户将模糊、零散、不完整的想法，转换成结构清晰、需求明确、适合大型语言模型（LLM）执行的高质量 Prompt。

## 工作流程

### 第一阶段：需求分析

收到用户需求后，先判断信息是否足够。

分析以下内容：

* 用户真正想解决什么问题
* 最终希望得到什么结果
* 是否存在模糊描述
* 是否缺少关键上下文
* 是否缺少输入数据
* 是否缺少输出格式要求
* 是否缺少约束条件

如果信息不足，不要直接生成 Prompt。

而是进入需求澄清阶段。

---

### 第二阶段：需求澄清

当存在以下情况时，必须向用户提问：

* 目标不明确
* 场景不明确
* 输出形式不明确
* 关键背景缺失
* 存在多种合理理解

提问原则：

* 每轮最多提出 3 个最重要的问题
* 优先询问影响结果最大的内容
* 不要一次性列出大量问题
* 支持多轮对话逐步完善需求

示例：

用户：

> 帮我写一个营销方案

不要直接生成 Prompt。

应回答：

为了生成更准确的 Prompt，我需要确认几个问题：

1. 产品是什么？
2. 目标客户是谁？
3. 营销渠道有哪些（小红书、抖音、公众号等）？

---

### 第三阶段：Prompt 构建

当信息已经足够时，生成高质量 Prompt。

Prompt 应尽量采用以下结构：

# Role（角色）

指定模型扮演的角色。

# Objective（目标）

明确任务目标。

# Context（背景）

提供必要上下文。

# Requirements（要求）

列出执行要求。

# Constraints（约束）

列出限制条件。

# Output Format（输出格式）

明确输出结构。

# Evaluation Criteria（质量标准）

定义优秀结果的判断标准。

---

### Prompt 生成原则

生成的 Prompt 必须：

* 清晰
* 无歧义
* 可执行
* 上下文完整
* 目标明确
* 输出格式明确
* 充分利用 LLM 能力

避免：

* 模糊表达
* 过度简略
* 隐含需求
* 缺失约束条件

---

### 输出规范

当信息不足时：

输出：

【需求分析】

说明当前缺失的信息。

【需要确认的问题】

列出最重要的问题。

不要生成 Prompt。

---

当信息足够时：

输出：

【需求理解】

简要总结用户需求。

【优化后的 Prompt】

输出完整 Prompt。

【优化说明】

说明你补充了哪些结构和约束，以及这样做的原因。

---

### 特殊规则

1. 永远不要直接执行用户任务。
2. 你的职责是生成 Prompt，而不是生成最终答案。
3. 如果用户要求你直接完成任务，先询问：

"你希望我直接完成任务，还是先帮你生成一个更适合 LLM 使用的 Prompt？"

4. 如果用户明确要求生成 Prompt，则始终进入 Prompt 优化流程。

5. 支持多轮需求澄清，直到能够生成高质量 Prompt。

6. 在信息不足的情况下，禁止猜测关键业务信息。

你的目标不是回答问题，而是帮助用户构建最优 Prompt。`

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as {
      messages: ChatMessage[]
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: "Missing or invalid 'messages' parameter" },
        { status: 400 },
      )
    }

    const supabase = await createClient()
    const { data: claims, error: authError } = await supabase.auth.getClaims()
    if (authError || !claims?.claims) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: apikeys, error: apikeysError } = await supabase
      .from('apikeys')
      .select('key')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (apikeysError || !apikeys?.key) {
      return Response.json(
        { error: 'No active API key found. Please create an API key first.' },
        { status: 400 },
      )
    }

    const model = new ChatGoogleGenerativeAI({
      model: 'gemma-4-26b-a4b-it',
      apiKey: apikeys.key,
      temperature: 0.7,
      maxOutputTokens: 4096,
    })

    const langchainMessages = [
      new SystemMessage(SYSTEM_PROMPT),
      ...messages.map((msg) =>
        msg.role === 'user'
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content),
      ),
    ]
    const response = await model.invoke(langchainMessages)

    let textContent: string
    if (typeof response.content === 'string') {
      textContent = response.content
    } else if (Array.isArray(response.content)) {
      textContent = response.content
        .filter(
          (part): part is { type: string; text: string } =>
            typeof part === 'object' && part !== null && 'text' in part,
        )
        .map((part) => part.text)
        .join('')
    } else {
      textContent = String(response.content)
    }

    return Response.json({
      success: true,
      content: textContent,
      model: 'gemma-4-26b-a4b-it',
      usage: response.usage_metadata,
    })
  } catch (error) {
    console.error('Prompt Optimizer Error:', error)
    return Response.json(
      {
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

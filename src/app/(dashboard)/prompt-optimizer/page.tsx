'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Send,
  Bot,
  User,
  AlertCircle,
  Sparkles,
  ArrowDown,
  Bookmark,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { PromptForm } from '@/components/prompt-form'
import { useCreatePrompt } from '@/hooks/usePrompts'
import type { CreatePromptInput } from '@/types/prompts'

const DEFAULT_SYSTEM_PROMPT = `# Prompt Optimizer System Prompt

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

如果信息不足，不要直接生成 Prompt。而是进入需求澄清阶段。

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

---

### 第三阶段：Prompt 构建

当信息已经足够时，生成高质量 Prompt。

Prompt 应尽量采用以下结构：
# Role（角色）- 指定模型扮演的角色。
# Objective（目标）- 明确任务目标。
# Context（背景）- 提供必要上下文。
# Requirements（要求）- 列出执行要求。
# Constraints（约束）- 列出限制条件。
# Output Format（输出格式）- 明确输出结构。
# Evaluation Criteria（质量标准）- 定义优秀结果的判断标准。

---

### 特殊规则

1. 永远不要直接执行用户任务。
2. 你的职责是生成 Prompt，而不是生成最终答案。
3. 支持多轮需求澄清，直到能够生成高质量 Prompt。
4. 在信息不足的情况下，禁止猜测关键业务信息。

你的目标不是回答问题，而是帮助用户构建最优 Prompt。`

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface StreamEvent {
  type: 'text' | 'done' | 'error'
  content?: string
  error?: string
}

export default function PromptOptimizerPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT)
  const [showSystemPrompt, setShowSystemPrompt] = useState(false)
  const [saveFormOpen, setSaveFormOpen] = useState(false)
  const [saveFormKey, setSaveFormKey] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const createPrompt = useCreatePrompt()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (autoScroll) scrollToBottom()
  }, [messages, autoScroll, scrollToBottom])

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 80)
  }, [])

  const handleSubmit = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setError(null)
    setLoading(true)
    setAutoScroll(true)

    const newMessages: Message[] = [
      ...messages,
      { role: 'user' as const, content: userMessage },
    ]

    setMessages([...newMessages, { role: 'assistant', content: '' }])

    const assistantIndex = newMessages.length

    let pendingText = ''
    let flushTimer: ReturnType<typeof setTimeout> | null = null

    const flushPending = () => {
      const text = pendingText
      pendingText = ''
      flushTimer = null
      if (text) {
        setMessages((prev) => {
          const next = [...prev]
          next[assistantIndex] = {
            ...next[assistantIndex]!,
            content: next[assistantIndex]!.content + text,
          }
          return next
        })
      }
    }

    try {
      const response = await fetch('/api/prompt-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          systemPrompt: systemPrompt || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to get response')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6)

          try {
            const event: StreamEvent = JSON.parse(payload)

            switch (event.type) {
              case 'text':
                pendingText += event.content ?? ''
                if (!flushTimer) {
                  flushTimer = setTimeout(flushPending, 30)
                }
                break

              case 'done':
                if (flushTimer) {
                  clearTimeout(flushTimer)
                  flushPending()
                }
                break

              case 'error':
                throw new Error(event.error || 'Stream error')
            }
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) continue
            throw parseErr
          }
        }
      }
    } catch (err) {
      if (flushTimer) {
        clearTimeout(flushTimer)
        flushPending()
      }
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      if (flushTimer) {
        clearTimeout(flushTimer)
        flushPending()
      }
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSavePrompt = (data: CreatePromptInput) => {
    createPrompt.mutate(
      { ...data },
      { onSuccess: () => setSaveFormOpen(false) },
    )
  }

  const isStreamingEmpty = (msg: Message) =>
    loading && msg.role === 'assistant' && !msg.content

  const lastAssistantMessage = [...messages]
    .reverse()
    .find((m) => m.role === 'assistant')
  const showSaveButton =
    !loading && lastAssistantMessage && lastAssistantMessage.content.trim()

  return (
    <div className="mx-auto flex h-dvh max-w-3xl flex-col px-3 pt-4 pb-3 sm:px-4 sm:pt-8 sm:pb-4">
      <div className="mb-4 flex shrink-0 items-center gap-2 sm:mb-6 sm:gap-3">
        <h1 className="text-base font-semibold tracking-tight sm:text-lg">
          Prompt Optimizer
        </h1>
      </div>

      <Card className="mb-3 shrink-0">
        <button
          onClick={() => setShowSystemPrompt(!showSystemPrompt)}
          className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium"
        >
          <span>System Prompt</span>
          {showSystemPrompt ? (
            <ChevronUp className="text-muted-foreground h-4 w-4" />
          ) : (
            <ChevronDown className="text-muted-foreground h-4 w-4" />
          )}
        </button>
        {showSystemPrompt && (
          <div className="px-4 pb-3">
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="输入自定义 System Prompt..."
              rows={6}
              className="font-mono text-xs"
            />
            <p className="text-muted-foreground mt-1.5 text-xs">
              自定义 System Prompt 将替换默认的 Prompt Engineer
              规则。留空则使用默认值。
            </p>
          </div>
        )}
      </Card>

      <Card
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto border shadow-sm"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <Sparkles className="text-muted-foreground/60 h-8 w-8" />
            <p className="text-muted-foreground mt-2 text-sm">
              输入你的需求，我将帮你优化成高质量的 Prompt
            </p>
          </div>
        ) : (
          <div className="space-y-4 px-2 pb-4">
            {messages.map((msg, index) => {
              const isLastAssistant =
                msg.role === 'assistant' && index === messages.length - 1

              return (
                <div key={index}>
                  <div
                    className={`flex gap-3 ${
                      msg.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        msg.role === 'user'
                          ? 'bg-secondary'
                          : 'bg-gradient-to-br from-amber-400 to-orange-500'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <User className="text-secondary-foreground h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground max-w-[75%] rounded-tr-md'
                          : 'bg-muted/60 max-w-[85%] rounded-tl-md'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        isStreamingEmpty(msg) ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="bg-foreground/40 h-1.5 w-1.5 animate-bounce rounded-full" />
                            <span className="bg-foreground/40 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:150ms]" />
                            <span className="bg-foreground/40 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:300ms]" />
                          </span>
                        ) : (
                          <div className="prose dark:prose-invert prose-p:my-2 prose-p:leading-relaxed prose-pre:my-2 prose-code:text-xs prose-headings:mt-4 prose-headings:mb-2 prose-blockquote:border-l-2 prose-blockquote:border-muted-foreground/30 prose-blockquote:pl-4 prose-blockquote:my-3 prose-li:my-0.5 max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        )
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </div>

                  {isLastAssistant && showSaveButton && (
                    <div className="mt-2 flex">
                      <Button
                        onClick={() => {
                          setSaveFormKey((k) => k + 1)
                          setSaveFormOpen(true)
                        }}
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                      >
                        <Bookmark className="h-3.5 w-3.5" />
                        一键复制
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </Card>

      {!autoScroll && messages.length > 0 && (
        <button
          onClick={() => {
            scrollToBottom()
            setAutoScroll(true)
          }}
          className="bg-card absolute bottom-28 left-1/2 z-10 -translate-x-1/2 rounded-full border p-2 shadow-lg transition-all hover:scale-105"
        >
          <ArrowDown className="text-muted-foreground h-4 w-4" />
        </button>
      )}

      {error && (
        <div className="mx-4 mt-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-3 shrink-0 sm:mt-4">
        <Card className="border shadow-lg">
          <div className="flex items-end gap-2 p-2 sm:gap-3 sm:p-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="描述你的需求，例如：帮我写一个营销方案..."
              rows={2}
              disabled={loading}
              className="placeholder:text-muted-foreground/60 flex-1 resize-none bg-transparent p-2 text-sm focus:outline-none disabled:opacity-50"
            />
            <Button
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              size="icon"
              className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm transition-all hover:shadow-md hover:brightness-105"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      <PromptForm
        key={saveFormKey}
        open={saveFormOpen}
        onOpenChange={setSaveFormOpen}
        onSubmit={(data) => {
          if (!('id' in data)) {
            handleSavePrompt(data)
          }
        }}
        isSubmitting={createPrompt.isPending}
        initialPromptContent={lastAssistantMessage?.content || ''}
      />
    </div>
  )
}

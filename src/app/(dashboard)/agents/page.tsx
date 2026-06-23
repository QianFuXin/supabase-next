'use client'

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
  type ComponentPropsWithoutRef,
} from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Send,
  User,
  Sparkles,
  ArrowDown,
  Settings2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Trash2,
  Loader2,
  AlertCircle,
  Eye,
  Terminal,
  Wrench,
  Brain,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { cn } from '@/utils/tailwind'
import { usePrompts } from '@/hooks/usePrompts'
import type { Prompt } from '@/types/prompts'

interface ToolCall {
  callId: string
  name: string
  input: unknown
  status: 'running' | 'finished' | 'error'
  output?: unknown
  error?: string
}

type ChatEntry =
  | { role: 'user'; content: string }
  | {
      role: 'assistant'
      content: string
      thinking: string
      toolCalls: ToolCall[]
    }

interface StreamEvent {
  type: string
  content?: string
  callId?: string
  name?: string
  input?: unknown
  status?: string
  output?: unknown
  error?: string
}

const DEFAULT_SYSTEM_PROMPT = `You are a helpful AI assistant with access to tools.
You provide clear, concise, and accurate answers.
Use markdown formatting for code blocks, lists, tables, and emphasis when appropriate.`

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-3 overflow-hidden rounded-lg border">
      <div className="bg-muted/80 flex items-center justify-between border-b px-4 py-1.5">
        <span className="text-muted-foreground text-xs">
          {language || 'text'}
        </span>
        <button
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
        >
          {copied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied ? '已复制！' : '复制'}
        </button>
      </div>
      <div className="bg-[#282c34]">
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            background: 'transparent',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'var(--font-geist-mono, ui-monospace, monospace)',
              fontSize: '0.8rem',
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

const markdownComponents: ComponentPropsWithoutRef<
  typeof ReactMarkdown
>['components'] = {
  pre({ children }) {
    return <>{children}</>
  },
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : ''

    if (language) {
      const code = String(children).replace(/\n$/, '')
      return <CodeBlock language={language} code={code} />
    }

    return (
      <code
        className="bg-muted rounded px-1 py-0.5 text-xs font-normal"
        {...props}
      >
        {children}
      </code>
    )
  },
}

const MarkdownBubble = memo(function MarkdownBubble({
  content,
  loading,
}: {
  content: string
  loading: boolean
}) {
  if (loading && !content) {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="bg-foreground/40 h-1.5 w-1.5 animate-bounce rounded-full" />
        <span className="bg-foreground/40 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:150ms]" />
        <span className="bg-foreground/40 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:300ms]" />
      </span>
    )
  }

  return (
    <div className="prose dark:prose-invert prose-p:my-3 prose-p:leading-relaxed prose-li:my-0.5 prose-blockquote:border-l-2 prose-blockquote:border-muted-foreground/30 prose-blockquote:text-muted-foreground prose-blockquote:pl-4 prose-blockquote:my-3 prose-img:rounded-lg prose-table:text-xs prose-th:border prose-th:px-2 prose-th:py-1 prose-td:border prose-td:px-2 prose-td:py-1 prose-ol:pl-5 prose-ul:pl-5 prose-headings:mt-6 prose-headings:mb-3 prose-hr:my-6 prose-hr:border-muted-foreground/20 max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
      {loading && content && (
        <span className="bg-primary ml-0.5 inline-block h-4 w-1 animate-pulse rounded-full align-middle" />
      )}
    </div>
  )
})

function ToolCallEntry({ tc }: { tc: ToolCall }) {
  const [expanded, setExpanded] = useState(false)
  const friendlyName = tc.name.replace(/_/g, ' ')

  return (
    <div className="bg-card hover:border-primary/30 my-2 rounded-xl border text-xs transition-colors">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        {tc.status === 'running' ? (
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-blue-500" />
        ) : tc.status === 'finished' ? (
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
        ) : (
          <XCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
        )}
        <Wrench className="text-muted-foreground h-3 w-3 shrink-0" />
        <span className="font-medium">{friendlyName}</span>
        <span className="text-muted-foreground ml-auto">
          {tc.status === 'running'
            ? '运行中...'
            : tc.status === 'finished'
              ? '完成'
              : '失败'}
        </span>
        {expanded ? (
          <ChevronUp className="text-muted-foreground h-3 w-3 shrink-0" />
        ) : (
          <ChevronDown className="text-muted-foreground h-3 w-3 shrink-0" />
        )}
      </button>
      {expanded && (
        <div className="space-y-1.5 border-t px-3 py-2">
          <div>
            <span className="text-muted-foreground">输入: </span>
            <code className="bg-muted rounded px-1 py-0.5 text-[11px]">
              {JSON.stringify(tc.input)}
            </code>
          </div>
          {tc.output !== undefined && (
            <div>
              <span className="text-muted-foreground">输出: </span>
              <span className="line-clamp-4">{String(tc.output)}</span>
            </div>
          )}
          {tc.error && (
            <div className="text-red-500">
              <span className="text-muted-foreground">错误: </span>
              {tc.error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ThinkingBlock({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false)

  if (!content) return null

  return (
    <div className="bg-card/50 my-2 rounded-xl border text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <Brain className="h-3.5 w-3.5 shrink-0 text-purple-500" />
        <span className="text-muted-foreground font-medium">思考中</span>
        {expanded ? (
          <ChevronUp className="text-muted-foreground ml-auto h-3 w-3 shrink-0" />
        ) : (
          <ChevronDown className="text-muted-foreground ml-auto h-3 w-3 shrink-0" />
        )}
      </button>
      {expanded && (
        <div className="text-muted-foreground border-t px-3 py-2 text-[11px] leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      )}
    </div>
  )
}

function SystemPromptSelector({
  selectedPromptId,
  onSelect,
  defaultPrompt,
}: {
  selectedPromptId: string | null
  onSelect: (prompt: Prompt | null) => void
  defaultPrompt: string
}) {
  const { data: prompts, isLoading } = usePrompts()
  const [previewPrompt, setPreviewPrompt] = useState<Prompt | null>(null)

  const selectedPrompt = prompts?.find((p) => p.id === selectedPromptId)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors',
              selectedPromptId
                ? 'border-purple-300 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/30'
                : 'bg-muted/30 hover:border-border border-transparent',
            )}
          >
            <Settings2
              className={cn(
                'h-3.5 w-3.5 shrink-0',
                selectedPromptId ? 'text-purple-500' : 'text-muted-foreground',
              )}
            />
            <span className="flex-1 truncate font-medium">
              {selectedPrompt ? (
                <span className="text-purple-600 dark:text-purple-400">
                  {selectedPrompt.title}
                </span>
              ) : (
                <span className="text-muted-foreground">默认系统提示词</span>
              )}
            </span>
            <ChevronDown className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[320px] sm:w-[400px]">
          <DropdownMenuLabel className="text-muted-foreground text-[11px] font-normal">
            系统提示词
          </DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => onSelect(null)}
            className={cn(
              'flex items-center gap-2',
              !selectedPromptId && 'bg-accent',
            )}
          >
            <Terminal className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
            <span className="flex-1">默认</span>
            {!selectedPromptId && (
              <Check className="h-3.5 w-3.5 text-purple-500" />
            )}
          </DropdownMenuItem>

          {prompts && prompts.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-muted-foreground text-[11px] font-normal">
                我的提示词 {isLoading && '(加载中...)'}
              </DropdownMenuLabel>
              {prompts.map((prompt) => (
                <DropdownMenuItem
                  key={prompt.id}
                  onClick={() => onSelect(prompt)}
                  className={cn(
                    'group flex items-center gap-2',
                    selectedPromptId === prompt.id && 'bg-accent',
                  )}
                >
                  <span className="flex-1 truncate">{prompt.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewPrompt(prompt)
                    }}
                    className="text-muted-foreground hover:text-foreground ml-2 rounded p-0.5 opacity-0 transition-all group-hover:opacity-100"
                    title="预览"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  {selectedPromptId === prompt.id && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-purple-500" />
                  )}
                </DropdownMenuItem>
              ))}
            </>
          )}

          {!isLoading && (!prompts || prompts.length === 0) && (
            <div className="text-muted-foreground px-2 py-3 text-center text-[11px]">
              还没有提示词。请在提示词页面创建。
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={!!previewPrompt}
        onOpenChange={(open) => {
          if (!open) setPreviewPrompt(null)
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-base">
              {previewPrompt?.title}
            </DialogTitle>
          </DialogHeader>
          {previewPrompt?.description && (
            <p className="text-muted-foreground -mt-2 text-sm">
              {previewPrompt.description}
            </p>
          )}
          <div className="bg-muted/50 max-h-[300px] overflow-y-auto rounded-lg border p-4">
            <pre className="text-muted-foreground text-xs leading-relaxed whitespace-pre-wrap">
              {previewPrompt?.prompt || '（无提示词内容）'}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function MessageBubble({
  entry,
  isLast,
  loading,
}: {
  entry: ChatEntry
  isLast: boolean
  loading: boolean
}) {
  const isUser = entry.role === 'user'
  const showCursor = isLast && !isUser && loading

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-secondary'
            : 'bg-gradient-to-br from-emerald-400 to-blue-500',
        )}
      >
        {isUser ? (
          <User className="text-secondary-foreground h-4 w-4" />
        ) : (
          <Sparkles className="h-3.5 w-3.5 text-white" />
        )}
      </div>
      <div
        className={cn(
          'rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-primary text-primary-foreground max-w-[75%] rounded-tr-md'
            : 'bg-muted/60 max-w-[85%] rounded-tl-md',
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{entry.content}</p>
        ) : (
          <>
            <MarkdownBubble content={entry.content} loading={showCursor} />
            <ThinkingBlock content={entry.thinking} />
            {entry.toolCalls.length > 0 && (
              <div className="mt-3 space-y-1">
                {entry.toolCalls.map((tc) => (
                  <ToolCallEntry key={tc.callId} tc={tc} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function AgentsPage() {
  const [entries, setEntries] = useState<ChatEntry[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT)
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (autoScroll) scrollToBottom()
  }, [entries, autoScroll, scrollToBottom])

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 80)
  }, [])

  const clearConversation = () => {
    abortControllerRef.current?.abort()
    setEntries([])
    setError(null)
    setLoading(false)
  }

  const handleSelectPrompt = (prompt: Prompt | null) => {
    if (prompt) {
      setSelectedPromptId(prompt.id)
      setSystemPrompt(prompt.prompt || DEFAULT_SYSTEM_PROMPT)
    } else {
      setSelectedPromptId(null)
      setSystemPrompt(DEFAULT_SYSTEM_PROMPT)
    }
  }

  const handleSubmit = async () => {
    if (!input.trim() || loading) return

    const userContent = input.trim()
    setInput('')
    setError(null)
    setLoading(true)
    setAutoScroll(true)

    const userEntry: ChatEntry = { role: 'user', content: userContent }
    const assistantEntry: ChatEntry = {
      role: 'assistant',
      content: '',
      thinking: '',
      toolCalls: [],
    }

    const initialEntries = [...entries, userEntry, assistantEntry]
    setEntries(initialEntries)

    const controller = new AbortController()
    abortControllerRef.current = controller

    let pendingText = ''
    let pendingThinking = ''
    let flushTimer: ReturnType<typeof setTimeout> | null = null

    const flushPending = () => {
      const text = pendingText
      const thinking = pendingThinking
      pendingText = ''
      pendingThinking = ''
      flushTimer = null

      setEntries((prev) => {
        const assistantIdx = prev.findLastIndex((e) => e.role === 'assistant')
        if (assistantIdx === -1) return prev
        const next = [...prev]
        const target = next[assistantIdx]
        if (target?.role !== 'assistant') return prev
        let changed = false
        let newContent = target.content
        let newThinking = target.thinking
        if (text) {
          newContent = target.content + text
          changed = true
        }
        if (thinking) {
          newThinking = target.thinking + thinking
          changed = true
        }
        if (!changed) return prev
        next[assistantIdx] = {
          ...target,
          content: newContent,
          thinking: newThinking,
        }
        return next
      })
    }

    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: initialEntries
            .filter(
              (e) => e.role === 'user' || (e.role === 'assistant' && e.content),
            )
            .map((e) => ({ role: e.role, content: e.content })),
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      const reader = res.body?.getReader()
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
                  flushTimer = setTimeout(flushPending, 50)
                }
                break

              case 'thinking':
                pendingThinking += event.content ?? ''
                if (!flushTimer) {
                  flushTimer = setTimeout(flushPending, 50)
                }
                break

              case 'tool_start':
                setEntries((prev) => {
                  const assistantIdx = prev.findLastIndex(
                    (e) => e.role === 'assistant',
                  )
                  if (assistantIdx === -1) return prev
                  const next = [...prev]
                  const target = next[assistantIdx]!
                  if (target.role !== 'assistant') return prev
                  const newTool: ToolCall = {
                    callId: event.callId!,
                    name: event.name!,
                    input: event.input,
                    status: 'running',
                  }
                  next[assistantIdx] = {
                    ...target,
                    toolCalls: [...target.toolCalls, newTool],
                  }
                  return next
                })
                break

              case 'tool_end':
                setEntries((prev) => {
                  const assistantIdx = prev.findLastIndex(
                    (e) => e.role === 'assistant',
                  )
                  if (assistantIdx === -1) return prev
                  const next = [...prev]
                  const target = next[assistantIdx]!
                  if (target.role !== 'assistant') return prev
                  next[assistantIdx] = {
                    ...target,
                    toolCalls: target.toolCalls.map((tc) =>
                      tc.callId === event.callId
                        ? {
                            ...tc,
                            status:
                              (event.status as 'finished' | 'error') ?? 'error',
                            output: event.output,
                            error: event.error,
                          }
                        : tc,
                    ),
                  }
                  return next
                })
                break

              case 'done':
                break

              case 'error':
                setError(event.error ?? 'Unknown error')
                break
            }
          } catch {
            // skip unparseable chunks
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      console.error(err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      if (flushTimer) {
        clearTimeout(flushTimer)
        flushPending()
      }
      setLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const isLoadingMsg = (entry: ChatEntry) =>
    loading &&
    entry.role === 'assistant' &&
    !entry.content &&
    entry.toolCalls.length === 0

  return (
    <div className="mx-auto flex h-dvh max-w-3xl flex-col px-3 pt-4 pb-3 sm:px-4 sm:pt-8 sm:pb-4">
      {/* Header */}
      <div className="mb-4 flex shrink-0 items-center gap-2 sm:mb-6 sm:gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500">
            <Wrench className="h-3.5 w-3.5 text-white" />
          </div>
          <h1 className="text-base font-semibold tracking-tight sm:text-lg">
            智能体
          </h1>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {entries.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearConversation}
              disabled={loading}
              className="text-muted-foreground hover:text-foreground h-7 gap-1 text-xs"
            >
              <Trash2 className="h-3 w-3" />
              <span className="hidden sm:inline">清空</span>
            </Button>
          )}
        </div>
      </div>

      {/* System Prompt Selector */}
      <div className="shrink-0">
        <SystemPromptSelector
          selectedPromptId={selectedPromptId}
          onSelect={handleSelectPrompt}
          defaultPrompt={DEFAULT_SYSTEM_PROMPT}
        />
      </div>

      {/* Messages */}
      <Card
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="mt-3 min-h-0 flex-1 overflow-y-auto border shadow-sm sm:mt-4"
      >
        {entries.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <div className="bg-muted/50 mb-3 flex h-14 w-14 items-center justify-center rounded-2xl">
              <Wrench className="text-muted-foreground/50 h-7 w-7" />
            </div>
            <p className="text-foreground text-sm font-medium">
              工具增强智能体对话
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              试试让我计算、查询时间或获取天气信息。
            </p>
          </div>
        ) : (
          <div className="space-y-3 px-3 py-3 sm:space-y-4 sm:px-4 sm:py-4">
            {entries.map((entry, i) => (
              <MessageBubble
                key={i}
                entry={entry}
                isLast={i === entries.length - 1}
                loading={isLoadingMsg(entry)}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </Card>

      {/* Scroll to bottom button */}
      {!autoScroll && entries.length > 0 && (
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

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Area */}
      <div className="mt-3 shrink-0 sm:mt-4">
        <Card className="border shadow-lg">
          <div className="flex items-end gap-2 p-2 sm:gap-3 sm:p-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="问我任何事 — 我可以搜索、计算等..."
              rows={2}
              disabled={loading}
              className="placeholder:text-muted-foreground/60 flex-1 resize-none bg-transparent p-2 text-sm focus:outline-none disabled:opacity-50"
            />
            <Button
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              size="icon"
              className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 text-white shadow-sm transition-all hover:shadow-md hover:brightness-105"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

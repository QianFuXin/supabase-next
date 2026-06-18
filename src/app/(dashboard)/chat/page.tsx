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
  Copy,
  Check,
  Trash2,
  Loader2,
  AlertCircle,
  Eye,
  Terminal,
} from 'lucide-react'
import { cn } from '@/utils/tailwind'
import { usePrompts } from '@/hooks/usePrompts'
import type { Prompt } from '@/types/prompts'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface StreamEvent {
  type: 'text' | 'done' | 'error'
  content?: string
  error?: string
}

const DEFAULT_SYSTEM_PROMPT = `You are a helpful AI assistant powered by Google's Gemma 4 model.
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
          {copied ? 'Copied!' : 'Copy'}
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

function MessageBubble({
  msg,
  isLast,
  loading,
}: {
  msg: Message
  isLast: boolean
  loading: boolean
}) {
  const isUser = msg.role === 'user'
  const showCursor = isLast && !isUser && loading

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-secondary'
            : 'bg-gradient-to-br from-purple-500 to-blue-600',
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
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <MarkdownBubble content={msg.content} loading={showCursor} />
        )}
      </div>
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
      <div className="mx-4 mt-3 sm:mx-6 sm:mt-4">
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
                  selectedPromptId
                    ? 'text-purple-500'
                    : 'text-muted-foreground',
                )}
              />
              <span className="flex-1 truncate font-medium">
                {selectedPrompt ? (
                  <span className="text-purple-600 dark:text-purple-400">
                    {selectedPrompt.title}
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Default System Prompt
                  </span>
                )}
              </span>
              <ChevronDown className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[320px] sm:w-[400px]">
            <DropdownMenuLabel className="text-muted-foreground text-[11px] font-normal">
              System Prompt
            </DropdownMenuLabel>

            <DropdownMenuItem
              onClick={() => onSelect(null)}
              className={cn(
                'flex items-center gap-2',
                !selectedPromptId && 'bg-accent',
              )}
            >
              <Terminal className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
              <span className="flex-1">Default</span>
              {!selectedPromptId && (
                <Check className="h-3.5 w-3.5 text-purple-500" />
              )}
            </DropdownMenuItem>

            {prompts && prompts.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-muted-foreground text-[11px] font-normal">
                  My Prompts {isLoading && '(loading...)'}
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
                      title="Preview"
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
                No prompts yet. Create one in Prompts page.
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
              {previewPrompt?.prompt || '(No prompt content)'}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
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
  }, [messages, autoScroll, scrollToBottom])

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 80)
  }, [])

  const clearConversation = () => {
    abortControllerRef.current?.abort()
    setMessages([])
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

    const newMessages: Message[] = [
      ...messages,
      { role: 'user' as const, content: userContent },
    ]
    setMessages(newMessages)

    const assistantIndex = newMessages.length
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    const controller = new AbortController()
    abortControllerRef.current = controller

    let pendingText = ''
    let flushTimer: ReturnType<typeof setTimeout> | null = null

    const flushPending = () => {
      const text = pendingText
      pendingText = ''
      flushTimer = null
      if (text) {
        setMessages((prev) => {
          const next = [...prev]
          const msg = next[assistantIndex]
          if (msg && msg.role === 'assistant') {
            next[assistantIndex] = { ...msg, content: msg.content + text }
          }
          return next
        })
      }
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          systemPrompt:
            systemPrompt === DEFAULT_SYSTEM_PROMPT ? undefined : systemPrompt,
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

  return (
    <div className="mx-auto flex h-dvh max-w-3xl flex-col px-3 pt-4 pb-3 sm:px-4 sm:pt-8 sm:pb-4">
      {/* Header */}
      <div className="mb-4 flex shrink-0 items-center gap-2 sm:mb-6 sm:gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-600">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <h1 className="text-base font-semibold tracking-tight sm:text-lg">
            Chat
          </h1>
        </div>

        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearConversation}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground ml-auto h-7 gap-1 text-xs"
          >
            <Trash2 className="h-3 w-3" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        )}
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
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <div className="bg-muted/50 mb-3 flex h-14 w-14 items-center justify-center rounded-2xl">
              <Sparkles className="text-muted-foreground/50 h-7 w-7" />
            </div>
            <p className="text-foreground text-sm font-medium">
              Start a conversation
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Your messages will build on context from previous turns.
            </p>
          </div>
        ) : (
          <div className="space-y-4 px-3 py-3 sm:space-y-5 sm:px-4 sm:py-4">
            {messages.map((msg, i) => (
              <MessageBubble
                key={i}
                msg={msg}
                isLast={i === messages.length - 1}
                loading={loading}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </Card>

      {/* Scroll to bottom button */}
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
              placeholder="Type your message..."
              rows={2}
              disabled={loading}
              className="placeholder:text-muted-foreground/60 flex-1 resize-none bg-transparent p-2 text-sm focus:outline-none disabled:opacity-50"
            />
            <Button
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              size="icon"
              className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-sm transition-all hover:shadow-md hover:brightness-105"
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

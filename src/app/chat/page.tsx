'use client'

import { useState, useRef, useEffect, useCallback, memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  User,
  Sparkles,
  Send,
  ArrowDown,
  Wrench,
  Bot,
  Brain,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

// --- Types ---------------------------------------------------------

interface ToolCall {
  callId: string
  name: string
  input: unknown
  status: 'running' | 'finished' | 'error'
  output?: unknown
  error?: string
}

interface Subagent {
  name: string
  content: string
  status: 'running' | 'completed' | 'failed'
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  thinking: string
  toolCalls: ToolCall[]
  subagents: Subagent[]
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
  thinking?: string
}

// --- Markdown Message Bubble ---------------------------------------

const MarkdownMessage = memo(function MarkdownMessage({
  content,
  loading,
}: {
  content: string
  loading: boolean
}) {
  if (loading) {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="bg-foreground/40 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:0ms]" />
        <span className="bg-foreground/40 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:150ms]" />
        <span className="bg-foreground/40 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:300ms]" />
      </span>
    )
  }

  return (
    <div className="prose dark:prose-invert prose-p:my-3 prose-p:leading-relaxed prose-li:my-0.5 prose-pre:bg-card prose-pre:border prose-pre:rounded-lg prose-pre:p-4 prose-pre:text-sm prose-code:bg-muted prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:text-xs prose-code:font-normal prose-pre:prose-code:bg-transparent prose-pre:prose-code:p-0 prose-pre:prose-code:text-sm prose-blockquote:border-l-2 prose-blockquote:border-muted-foreground/30 prose-blockquote:text-muted-foreground prose-blockquote:pl-4 prose-blockquote:my-3 prose-img:rounded-lg prose-table:text-xs prose-th:border prose-th:px-2 prose-th:py-1 prose-td:border prose-td:px-2 prose-td:py-1 prose-ol:pl-5 prose-ul:pl-5 prose-headings:mt-6 prose-headings:mb-3 prose-hr:my-6 prose-hr:border-muted-foreground/20 max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
})

// --- Tool Call Card -------------------------------------------------

function ToolCallCard({ tc }: { tc: ToolCall }) {
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
            ? 'Running...'
            : tc.status === 'finished'
              ? 'Done'
              : 'Failed'}
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
            <span className="text-muted-foreground">Input: </span>
            <code className="bg-muted rounded px-1 py-0.5 text-[11px]">
              {JSON.stringify(tc.input)}
            </code>
          </div>
          {tc.output !== undefined && (
            <div>
              <span className="text-muted-foreground">Output: </span>
              <span className="line-clamp-4">{String(tc.output)}</span>
            </div>
          )}
          {tc.error && (
            <div className="text-red-500">
              <span className="text-muted-foreground">Error: </span>
              {tc.error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// --- Subagent Card --------------------------------------------------

function SubagentCard({ sa }: { sa: Subagent }) {
  return (
    <div className="bg-card my-2 rounded-xl border text-xs">
      <div className="flex items-center gap-2 px-3 py-2">
        {sa.status === 'running' ? (
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-blue-500" />
        ) : sa.status === 'completed' ? (
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
        ) : (
          <XCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
        )}
        <Bot className="text-muted-foreground h-3 w-3 shrink-0" />
        <span className="font-medium">Subagent: {sa.name}</span>
        <span className="text-muted-foreground ml-auto">
          {sa.status === 'running'
            ? 'Running...'
            : sa.status === 'completed'
              ? 'Completed'
              : 'Failed'}
        </span>
      </div>
      {sa.content && (
        <div className="border-t px-3 py-2">
          <div className="prose prose-xs dark:prose-invert prose-p:my-2 prose-p:leading-relaxed prose-pre:bg-card prose-pre:border prose-pre:rounded-lg prose-pre:p-2 prose-pre:text-[11px] prose-code:bg-muted prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:text-[10px] prose-code:font-normal prose-pre:prose-code:bg-transparent prose-pre:prose-code:p-0 prose-headings:mt-4 prose-headings:mb-2 prose-hr:my-4 prose-hr:border-muted-foreground/20 max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {sa.content}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}

// --- Thinking Block -------------------------------------------------

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
        <span className="text-muted-foreground font-medium">Thinking</span>
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

// --- Main Page ------------------------------------------------------

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const [threadId, setThreadId] = useState(() => crypto.randomUUID())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

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

    const question = input.trim()
    setInput('')
    setLoading(true)
    setAutoScroll(true)

    const assistantMsg: Message = {
      role: 'assistant',
      content: '',
      thinking: '',
      toolCalls: [],
      subagents: [],
    }

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: question,
        thinking: '',
        toolCalls: [],
        subagents: [],
      },
      assistantMsg,
    ])

    const assistantIndex = messages.length + 1

    const updateAssistant = (fn: (msg: Message) => Message) => {
      setMessages((prev) => {
        const next = [...prev]
        next[assistantIndex] = fn({ ...next[assistantIndex]! })
        return next
      })
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, thread_id: threadId }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

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

          if (payload === '[DONE]') continue

          try {
            const event: StreamEvent = JSON.parse(payload)

            switch (event.type) {
              case 'text':
                updateAssistant((m) => ({
                  ...m,
                  content: m.content + (event.content ?? ''),
                }))
                break

              case 'thinking':
                updateAssistant((m) => ({
                  ...m,
                  thinking: m.thinking + (event.content ?? ''),
                }))
                break

              case 'tool_start':
                updateAssistant((m) => ({
                  ...m,
                  toolCalls: [
                    ...m.toolCalls,
                    {
                      callId: event.callId!,
                      name: event.name!,
                      input: event.input,
                      status: 'running',
                    },
                  ],
                }))
                break

              case 'tool_end':
                updateAssistant((m) => ({
                  ...m,
                  toolCalls: m.toolCalls.map((tc) =>
                    tc.callId === event.callId
                      ? {
                          ...tc,
                          status:
                            (event.status as ToolCall['status']) ?? 'error',
                          output: event.output,
                          error: event.error,
                        }
                      : tc,
                  ),
                }))
                break

              case 'subagent_start':
                updateAssistant((m) => ({
                  ...m,
                  subagents: [
                    ...m.subagents,
                    { name: event.name!, content: '', status: 'running' },
                  ],
                }))
                break

              case 'subagent_thinking':
                updateAssistant((m) => ({
                  ...m,
                  subagents: m.subagents.map((sa) =>
                    sa.name === event.name && sa.status === 'running'
                      ? { ...sa, content: sa.content + (event.content ?? '') }
                      : sa,
                  ),
                }))
                break

              case 'subagent_text':
                updateAssistant((m) => ({
                  ...m,
                  subagents: m.subagents.map((sa) =>
                    sa.name === event.name && sa.status === 'running'
                      ? { ...sa, content: sa.content + (event.content ?? '') }
                      : sa,
                  ),
                }))
                break

              case 'subagent_end':
                updateAssistant((m) => ({
                  ...m,
                  subagents: m.subagents.map((sa) =>
                    sa.name === event.name
                      ? {
                          ...sa,
                          status:
                            (event.status as Subagent['status']) ?? 'failed',
                        }
                      : sa,
                  ),
                }))
                break

              case 'error':
                updateAssistant((m) => ({
                  ...m,
                  content: `Error: ${event.error}`,
                }))
                break

              case 'done':
                break
            }
          } catch {
            // skip unparseable chunks
          }
        }
      }
    } catch (err) {
      console.error(err)
      updateAssistant(() => ({
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        thinking: '',
        toolCalls: [],
        subagents: [],
      }))
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const isLoadingMsg = (msg: Message) =>
    loading &&
    msg.role === 'assistant' &&
    !msg.content &&
    msg.toolCalls.length === 0

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col px-4 pt-8 pb-4">
      {/* Header */}
      <div className="mb-6 flex shrink-0 items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 shadow-sm">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">AI Chat</h1>
          <p className="text-muted-foreground text-xs">
            DeepAgent — Planning, Tools, Subagents
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <input
            value={threadId}
            onChange={(e) => {
              setThreadId(e.target.value)
              setMessages([])
            }}
            placeholder="Thread ID"
            className="bg-muted/50 text-muted-foreground focus:ring-primary/30 w-32 rounded-lg border px-2 py-1 font-mono text-[10px] focus:ring-1 focus:outline-none"
          />
          <button
            onClick={() => {
              setThreadId(crypto.randomUUID())
              setMessages([])
            }}
            className="text-muted-foreground hover:text-foreground text-[10px] transition-colors"
          >
            New
          </button>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-muted-foreground text-xs">Online</span>
        </div>
      </div>

      {/* Messages */}
      <Card
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto border shadow-sm"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <div className="from-muted to-muted/50 mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br shadow-inner">
              <Sparkles className="text-muted-foreground/60 h-10 w-10" />
            </div>
            <h2 className="mb-2 text-xl font-semibold tracking-tight">
              Start a conversation
            </h2>
            <p className="text-muted-foreground max-w-sm text-sm leading-relaxed text-balance">
              The AI agent can plan with todos, use filesystem tools, and spawn
              subagents for complex tasks. Ask me anything!
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {[
                'Plan a trip to Tokyo for 5 days',
                'Compare TypeScript and Python with code examples',
                'Write a short story about a robot learning to paint',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-full border px-3.5 py-1.5 text-xs transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 px-2 pb-4">
            {messages.map((msg, i) => (
              <div key={i}>
                <div
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      msg.role === 'user'
                        ? 'bg-secondary'
                        : 'bg-gradient-to-br from-emerald-400 to-blue-500'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="text-secondary-foreground h-4 w-4" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-white" />
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
                      <>
                        <MarkdownMessage
                          content={msg.content}
                          loading={isLoadingMsg(msg)}
                        />

                        {/* Thinking */}
                        <ThinkingBlock content={msg.thinking} />

                        {/* Tool calls */}
                        {msg.toolCalls.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {msg.toolCalls.map((tc) => (
                              <ToolCallCard key={tc.callId} tc={tc} />
                            ))}
                          </div>
                        )}

                        {/* Subagents */}
                        {msg.subagents.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {msg.subagents.map((sa) => (
                              <SubagentCard key={sa.name} sa={sa} />
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              </div>
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

      {/* Input Area */}
      <div className="mt-4 shrink-0">
        <Card className="border shadow-lg">
          <div className="flex items-end gap-3 p-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
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
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
        <p className="text-muted-foreground/50 mt-2 text-center text-[10px]">
          Press{' '}
          <kbd className="bg-muted rounded px-1 py-0.5 text-[10px] font-medium">
            Enter
          </kbd>{' '}
          to send ·{' '}
          <kbd className="bg-muted rounded px-1 py-0.5 text-[10px] font-medium">
            Shift
          </kbd>{' '}
          +{' '}
          <kbd className="bg-muted rounded px-1 py-0.5 text-[10px] font-medium">
            Enter
          </kbd>{' '}
          for new line
        </p>
      </div>
    </div>
  )
}

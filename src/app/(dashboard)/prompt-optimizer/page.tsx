'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Send, Bot, User, AlertCircle, Sparkles, ArrowDown } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function PromptOptimizerPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoScroll, setAutoScroll] = useState(true)

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

    const userMessage = input.trim()
    setInput('')
    setError(null)
    setLoading(true)
    setAutoScroll(true)

    const newMessages: Message[] = [
      ...messages,
      { role: 'user' as const, content: userMessage },
    ]
    setMessages(newMessages)

    try {
      const response = await fetch('/api/prompt-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.content },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
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

  return (
    <div className="mx-auto flex h-dvh max-w-3xl flex-col px-3 pt-4 pb-3 sm:px-4 sm:pt-8 sm:pb-4">
      <div className="mb-4 flex shrink-0 items-center gap-2 sm:mb-6 sm:gap-3">
        <h1 className="text-base font-semibold tracking-tight sm:text-lg">
          Prompt Optimizer
        </h1>
      </div>

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
            {messages.map((msg, index) => (
              <div
                key={index}
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
                    <div className="prose dark:prose-invert prose-p:my-2 prose-p:leading-relaxed prose-pre:my-2 prose-code:text-xs prose-headings:mt-4 prose-headings:mb-2 prose-blockquote:border-l-2 prose-blockquote:border-muted-foreground/30 prose-blockquote:pl-4 prose-blockquote:my-3 prose-li:my-0.5 max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-muted/60 flex items-center gap-1 rounded-2xl rounded-tl-md px-4 py-3 text-sm">
                  <span className="bg-foreground/40 h-1.5 w-1.5 animate-bounce rounded-full" />
                  <span className="bg-foreground/40 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:150ms]" />
                  <span className="bg-foreground/40 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:300ms]" />
                </div>
              </div>
            )}
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
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Send, Loader2, Bot, User, AlertCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  role: 'user' | 'assistant'
  content: string | Array<{ type: string; text?: string }>
}

export default function GemmaDemoPage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setError(null)
    setLoading(true)

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])

    try {
      const response = await fetch('/api/gemma-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
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
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Gemma 4 Demo</h1>
        <p className="text-muted-foreground mx-auto mb-4 max-w-lg">
          A simple demo of LangChain&apos;s ChatGoogleGenerativeAI integration
          using the gemma-4-26b-a4b-it model with API key authentication.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Model: gemma-4-26b-a4b-it
          </Badge>
          <Badge variant="outline" className="text-xs">
            Auth: API Key
          </Badge>
        </div>
      </div>

      {/* Main Chat Card */}
      <Card className="border shadow-lg">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5 text-purple-500" />
            Chat with Gemma 4
          </CardTitle>
          <CardDescription>
            Ask questions and get responses powered by Google&apos;s Gemma 4
            model
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {/* Messages Area */}
          <div className="max-h-[500px] min-h-[300px] overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex h-[300px] flex-col items-center justify-center text-center">
                <div className="bg-muted mb-4 rounded-full p-4">
                  <Bot className="text-muted-foreground h-8 w-8" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Start a conversation by typing a message below
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {[
                    'Explain quantum computing',
                    'Write a haiku about AI',
                    'What are the benefits of TypeScript?',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground rounded-full px-3 py-1.5 text-xs transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
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
                          : 'bg-gradient-to-br from-purple-500 to-blue-600'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <User className="text-secondary-foreground h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-md'
                          : 'bg-muted prose dark:prose-invert prose-p:my-2 prose-p:leading-relaxed prose-pre:my-2 prose-code:text-xs rounded-tl-md'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {typeof msg.content === 'string'
                            ? msg.content
                            : Array.isArray(msg.content)
                              ? msg.content
                                  .filter(
                                    (
                                      part,
                                    ): part is { type: string; text: string } =>
                                      typeof part === 'object' &&
                                      part !== null &&
                                      'text' in part,
                                  )
                                  .map((part) => part.text)
                                  .join('')
                              : String(msg.content)}
                        </ReactMarkdown>
                      ) : (
                        <p className="whitespace-pre-wrap">
                          {typeof msg.content === 'string'
                            ? msg.content
                            : Array.isArray(msg.content)
                              ? msg.content
                                  .filter(
                                    (
                                      part,
                                    ): part is { type: string; text: string } =>
                                      typeof part === 'object' &&
                                      part !== null &&
                                      'text' in part,
                                  )
                                  .map((part) => part.text)
                                  .join('')
                              : String(msg.content)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-600">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-muted flex items-center gap-1 rounded-2xl rounded-tl-md px-4 py-3 text-sm">
                      <span className="bg-foreground/40 h-1.5 w-1.5 animate-bounce rounded-full" />
                      <span className="bg-foreground/40 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:150ms]" />
                      <span className="bg-foreground/40 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:300ms]" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mx-4 mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex items-end gap-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={2}
                disabled={loading}
                className="min-h-[80px] flex-1 resize-none"
              />
              <Button
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-md transition-all hover:shadow-lg"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-muted-foreground/60 mt-2 text-center text-xs">
              Press Enter to send · Shift + Enter for new line
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Info Section */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">API Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs leading-relaxed">
              This demo uses LangChain&apos;s{' '}
              <code className="bg-muted rounded px-1 py-0.5 text-[10px]">
                @langchain/google-genai
              </code>{' '}
              package with the ChatGoogleGenerativeAI class. Authentication is
              handled via the GOOGLE_API_KEY environment variable.
            </p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Model Info</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs leading-relaxed">
              <strong>gemma-4-26b-a4b-it</strong> is a 26 billion parameter
              model in Google&apos;s Gemma 4 series. It supports text generation
              with a context window suitable for most conversational tasks.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

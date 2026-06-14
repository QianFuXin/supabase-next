'use client'

import { useState, useEffect } from 'react'
import {
  Sparkles,
  Brain,
  Zap,
  Shield,
  ArrowRight,
  MessageSquare,
  Bot,
  Cpu,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const features = [
  {
    icon: Brain,
    title: 'Advanced Reasoning',
    description:
      'Complex multi-step reasoning with planning and tool use for sophisticated problem-solving.',
    gradient: 'from-emerald-400 to-blue-500',
  },
  {
    icon: Zap,
    title: 'Real-time Streaming',
    description:
      'Experience lightning-fast responses with Server-Sent Events for seamless AI interactions.',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description:
      'Built-in authentication with Supabase and Row Level Security for data protection.',
    gradient: 'from-violet-400 to-purple-500',
  },
  {
    icon: Bot,
    title: 'Subagent Orchestration',
    description:
      'Intelligent task decomposition with specialized subagents for parallel execution.',
    gradient: 'from-cyan-400 to-blue-500',
  },
]

const demoMessages = [
  {
    role: 'user',
    content: 'Help me plan a product launch for our new AI assistant',
  },
  {
    role: 'assistant',
    content:
      "I'll break this down into phases. First, let me research the market landscape and competitor positioning...",
  },
  { role: 'user', content: 'What about the technical architecture?' },
  {
    role: 'assistant',
    content:
      'For the technical stack, I recommend Next.js for the frontend with Supabase for real-time capabilities...',
  },
]

export default function Home() {
  const [currentMessage, setCurrentMessage] = useState(0)
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % demoMessages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (currentMessage === 0) return

    const timer = setTimeout(() => {
      setIsTyping(true)
    }, 0)

    const hideTimer = setTimeout(() => {
      setIsTyping(false)
    }, 1500)

    return () => {
      clearTimeout(timer)
      clearTimeout(hideTimer)
    }
  }, [currentMessage])

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/2 -right-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-16 text-center md:py-24">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 via-blue-500 to-violet-500 shadow-2xl shadow-emerald-500/20">
          <Sparkles className="h-12 w-12 text-white" />
        </div>

        <Badge variant="secondary" className="mb-6 gap-2">
          <Cpu className="h-3 w-3" />
          Powered by Gemini AI
        </Badge>

        <h1 className="mb-6 text-3xl leading-tight font-bold tracking-tight text-balance sm:text-5xl md:text-7xl">
          <span className="bg-gradient-to-r from-emerald-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
            Intelligent Agents
          </span>
          <br />
          Built for the Future
        </h1>

        <p className="text-muted-foreground mb-8 max-w-2xl text-base leading-relaxed text-balance sm:mb-10 sm:text-lg md:text-xl">
          Create powerful AI agents with advanced reasoning, tool use, and
          subagent orchestration. Built with Gemini for complex problem-solving
          tasks.
        </p>

        <div className="mb-10 flex flex-col items-center gap-4 sm:mb-16 sm:flex-row">
          <Link href="/deep-agent">
            <Button size="lg" className="gap-2 px-8">
              Start Building
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button variant="outline" size="lg" className="gap-2 px-8">
              <MessageSquare className="h-4 w-4" />
              Try Demo
            </Button>
          </Link>
        </div>

        <div className="relative w-full max-w-4xl">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-400/20 via-blue-500/20 to-violet-500/20 blur-xl" />
          <div className="bg-background/80 relative rounded-2xl border p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-muted-foreground ml-2 text-sm">
                DeepAgent Chat
              </span>
            </div>
            <div className="space-y-4 text-left">
              {demoMessages.slice(0, currentMessage + 1).map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    {i === currentMessage &&
                      isTyping &&
                      msg.role === 'assistant' && (
                        <div className="mt-2 flex gap-1">
                          <div
                            className="bg-muted-foreground/50 h-2 w-2 animate-bounce rounded-full"
                            style={{ animationDelay: '0ms' }}
                          />
                          <div
                            className="bg-muted-foreground/50 h-2 w-2 animate-bounce rounded-full"
                            style={{ animationDelay: '150ms' }}
                          />
                          <div
                            className="bg-muted-foreground/50 h-2 w-2 animate-bounce rounded-full"
                            style={{ animationDelay: '300ms' }}
                          />
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <section className="bg-muted/30 relative border-t py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mb-12 text-center md:mb-16">
            <h2 className="mb-4 text-2xl font-bold md:text-4xl">
              Built for Complex Reasoning
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-base md:text-lg">
              Our AI agents combine advanced reasoning with tool use to tackle
              sophisticated tasks
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group bg-background/50 relative overflow-hidden rounded-xl border p-6 backdrop-blur-sm transition-all hover:shadow-lg"
              >
                <div
                  className={`mb-4 inline-flex rounded-lg bg-gradient-to-br ${feature.gradient} p-2`}
                >
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <Badge variant="outline" className="mb-4">
                Technical Architecture
              </Badge>
              <h2 className="mb-4 text-2xl font-bold md:mb-6 md:text-4xl">
                Full-Stack AI Platform
              </h2>
              <p className="text-muted-foreground mb-6 text-base md:mb-8 md:text-lg">
                Built with modern technologies for performance, security, and
                scalability.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 mt-1 rounded-full p-1">
                    <div className="bg-primary h-2 w-2 rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-medium">Next.js 16 App Router</h4>
                    <p className="text-muted-foreground text-sm">
                      Server Components, Server Actions, and streaming SSR
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 mt-1 rounded-full p-1">
                    <div className="bg-primary h-2 w-2 rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-medium">Gemini AI Integration</h4>
                    <p className="text-muted-foreground text-sm">
                      Advanced reasoning with tool use and subagent
                      orchestration
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 mt-1 rounded-full p-1">
                    <div className="bg-primary h-2 w-2 rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-medium">Supabase Backend</h4>
                    <p className="text-muted-foreground text-sm">
                      Authentication, database, and real-time subscriptions
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-emerald-400/10 to-blue-500/10 blur-xl" />
              <div className="bg-background/80 relative rounded-2xl border p-6 backdrop-blur-xl md:p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                      <Brain className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <div className="font-medium">Planning Agent</div>
                      <div className="text-muted-foreground text-sm">
                        Task decomposition & strategy
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 h-4 border-l-2 border-dashed border-emerald-500/30" />
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                      <Zap className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-medium">Execution Engine</div>
                      <div className="text-muted-foreground text-sm">
                        Tool use & parallel processing
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 h-4 border-l-2 border-dashed border-blue-500/30" />
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                      <Bot className="h-5 w-5 text-violet-500" />
                    </div>
                    <div>
                      <div className="font-medium">Subagent Network</div>
                      <div className="text-muted-foreground text-sm">
                        Specialized worker agents
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-t py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center md:px-6">
          <h2 className="mb-4 text-2xl font-bold md:mb-6 md:text-4xl">
            Ready to Build Intelligent Agents?
          </h2>
          <p className="text-muted-foreground mx-auto mb-6 max-w-2xl text-base md:mb-8 md:text-lg">
            Start creating powerful AI agents with Gemini. No setup required.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link href="/deep-agent">
              <Button size="lg" className="gap-2 px-6 md:px-8">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button variant="outline" size="lg" className="px-6 md:px-8">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-6 sm:flex-row sm:justify-between md:px-6 md:py-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">gent</span>
          </div>
          <p className="text-muted-foreground text-center text-xs sm:text-sm">
            Built with Next.js, Supabase & Gemini AI
          </p>
        </div>
      </footer>
    </div>
  )
}

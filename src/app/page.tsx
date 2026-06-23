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
    title: '高级推理',
    description: '支持复杂多步骤推理，结合规划与工具调用，实现高难度问题求解。',
    gradient: 'from-emerald-400 to-blue-500',
  },
  {
    icon: Zap,
    title: '实时流式传输',
    description:
      '基于 Server-Sent Events 实现极速响应，带来流畅的 AI 交互体验。',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    icon: Shield,
    title: '企业级安全',
    description:
      '内置 Supabase 认证与行级安全策略（RLS），全方位保护数据安全。',
    gradient: 'from-violet-400 to-purple-500',
  },
  {
    icon: Bot,
    title: '子智能体编排',
    description: '智能任务分解，通过专用子智能体并行执行，提升处理效率。',
    gradient: 'from-cyan-400 to-blue-500',
  },
]

const demoMessages = [
  {
    role: 'user',
    content: '帮我规划一下新 AI 助手的产品发布方案',
  },
  {
    role: 'assistant',
    content: '我将分几个阶段来规划。首先，让我调研市场格局和竞争对手定位...',
  },
  { role: 'user', content: '技术架构方面怎么考虑？' },
  {
    role: 'assistant',
    content:
      '技术栈方面，我推荐前端使用 Next.js，配合 Supabase 实现实时能力...',
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
          <Cpu className="h-3 w-3" />由 Gemini AI 驱动
        </Badge>

        <h1 className="mb-6 text-3xl leading-tight font-bold tracking-tight text-balance sm:text-5xl md:text-7xl">
          <span className="bg-gradient-to-r from-emerald-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
            智能体
          </span>
          <br />
          面向未来而构建
        </h1>

        <p className="text-muted-foreground mb-8 max-w-2xl text-base leading-relaxed text-balance sm:mb-10 sm:text-lg md:text-xl">
          创建强大的 AI 智能体，具备高级推理、工具调用和子智能体编排能力。 基于
          Gemini 构建，专为复杂问题求解而设计。
        </p>

        <div className="mb-10 flex flex-col items-center gap-4 sm:mb-16 sm:flex-row">
          <Link href="/deep-agent">
            <Button size="lg" className="gap-2 px-8">
              开始构建
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button variant="outline" size="lg" className="gap-2 px-8">
              <MessageSquare className="h-4 w-4" />
              体验演示
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
                DeepAgent 对话
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
              专为复杂推理而生
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-base md:text-lg">
              我们的 AI 智能体将高级推理与工具调用相结合，应对各种复杂任务
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
                技术架构
              </Badge>
              <h2 className="mb-4 text-2xl font-bold md:mb-6 md:text-4xl">
                全栈 AI 平台
              </h2>
              <p className="text-muted-foreground mb-6 text-base md:mb-8 md:text-lg">
                基于现代技术栈构建，兼顾性能、安全与可扩展性。
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 mt-1 rounded-full p-1">
                    <div className="bg-primary h-2 w-2 rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-medium">Next.js 16 App Router</h4>
                    <p className="text-muted-foreground text-sm">
                      服务器组件、服务器操作与流式 SSR
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 mt-1 rounded-full p-1">
                    <div className="bg-primary h-2 w-2 rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-medium">Gemini AI 集成</h4>
                    <p className="text-muted-foreground text-sm">
                      高级推理能力，支持工具调用与子智能体编排
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 mt-1 rounded-full p-1">
                    <div className="bg-primary h-2 w-2 rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-medium">Supabase 后端</h4>
                    <p className="text-muted-foreground text-sm">
                      认证、数据库与实时订阅
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
                      <div className="font-medium">规划智能体</div>
                      <div className="text-muted-foreground text-sm">
                        任务分解与策略制定
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 h-4 border-l-2 border-dashed border-emerald-500/30" />
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                      <Zap className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-medium">执行引擎</div>
                      <div className="text-muted-foreground text-sm">
                        工具调用与并行处理
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 h-4 border-l-2 border-dashed border-blue-500/30" />
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                      <Bot className="h-5 w-5 text-violet-500" />
                    </div>
                    <div>
                      <div className="font-medium">子智能体网络</div>
                      <div className="text-muted-foreground text-sm">
                        专用工作智能体
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
            准备好构建智能体了吗？
          </h2>
          <p className="text-muted-foreground mx-auto mb-6 max-w-2xl text-base md:mb-8 md:text-lg">
            立即使用 Gemini 创建强大的 AI 智能体，无需额外配置。
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link href="/deep-agent">
              <Button size="lg" className="gap-2 px-6 md:px-8">
                免费开始
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button variant="outline" size="lg" className="px-6 md:px-8">
                创建账户
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
            基于 Next.js、Supabase 和 Gemini AI 构建
          </p>
        </div>
      </footer>
    </div>
  )
}

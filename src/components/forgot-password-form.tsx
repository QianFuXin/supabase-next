'use client'

import { cn } from '@/utils/tailwind'
import { createClient } from '@/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useState } from 'react'

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })
      if (error) throw error
      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      {success ? (
        <Card className="relative overflow-hidden border-0 shadow-lg shadow-black/5 dark:shadow-black/20">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
          <CardHeader className="space-y-1 pt-8 pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight">
              查看邮箱
            </CardTitle>
            <CardDescription className="text-sm">
              密码重置说明已发送
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm leading-relaxed">
              如果您使用邮箱和密码注册，很快将收到一封密码重置邮件。
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="relative overflow-hidden border-0 shadow-lg shadow-black/5 dark:shadow-black/20">
          <div className="via-foreground/20 absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent to-transparent" />
          <CardHeader className="space-y-1 pt-8 pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight">
              重置密码
            </CardTitle>
            <CardDescription className="text-sm">
              输入您的邮箱，我们将发送重置链接
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-medium">
                    邮箱
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10"
                  />
                </div>
                {error && (
                  <p className="bg-destructive/5 text-destructive rounded-md p-3 text-xs font-medium">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  className="h-10 w-full"
                  disabled={isLoading}
                >
                  {isLoading ? '发送中...' : '发送重置链接'}
                </Button>
              </div>
              <div className="text-muted-foreground mt-6 text-center text-sm">
                记得密码？{' '}
                <Link
                  href="/auth/login"
                  className="text-foreground font-medium underline-offset-4 hover:underline"
                >
                  登录
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

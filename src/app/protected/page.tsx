import { redirect } from 'next/navigation'
import { createClient } from '@/supabase/server'
import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function UserDetails() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims) {
    redirect('/auth/login')
  }

  return JSON.stringify(data.claims, null, 2)
}

function UserDetailsSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="bg-muted h-3 w-3/4 rounded" />
      <div className="bg-muted h-3 w-1/2 rounded" />
      <div className="bg-muted h-3 w-2/3 rounded" />
    </div>
  )
}

export default function ProtectedPage() {
  return (
    <div className="flex w-full flex-1 flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Welcome back to your account
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden border-0 shadow-md shadow-black/5 dark:shadow-black/10">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          <CardHeader className="pt-6 pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Active</p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              You are signed in
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-md shadow-black/5 dark:shadow-black/10">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
          <CardHeader className="pt-6 pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Auth Provider
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Supabase</p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Email and password
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-md shadow-black/5 sm:col-span-2 lg:col-span-1 dark:shadow-black/10">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
          <CardHeader className="pt-6 pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Protection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">RLS Enabled</p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Row level security active
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md shadow-black/5 dark:shadow-black/10">
        <CardHeader className="pt-6 pb-4">
          <CardTitle className="text-base font-semibold">
            User details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted/50 max-h-48 overflow-auto rounded-lg p-4 font-mono text-xs leading-relaxed">
            <Suspense fallback={<UserDetailsSkeleton />}>
              <UserDetails />
            </Suspense>
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}

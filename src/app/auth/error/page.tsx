import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Suspense } from 'react'

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <>
      {params?.error ? (
        <p className="text-muted-foreground text-sm">
          Code error: {params.error}
        </p>
      ) : (
        <p className="text-muted-foreground text-sm">
          An unspecified error occurred.
        </p>
      )}
    </>
  )
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  return (
    <div className="relative flex min-h-svh w-full flex-col items-center justify-center p-6 md:p-10">
      <div className="bg-dot-pattern pointer-events-none absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="bg-foreground text-background flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold">
              N
            </span>
            <span>NextSupabase</span>
          </Link>
        </div>
        <Card className="relative overflow-hidden border-0 shadow-lg shadow-black/5 dark:shadow-black/20">
          <div className="via-destructive/30 absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent to-transparent" />
          <CardHeader className="space-y-1 pt-8 pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense>
              <ErrorContent searchParams={searchParams} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

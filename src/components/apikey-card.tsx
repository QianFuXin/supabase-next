'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2 } from 'lucide-react'
import type { ApiKey } from '@/types/apikeys'

interface ApiKeyCardProps {
  apikey: ApiKey
  onEdit: (apikey: ApiKey) => void
  onDelete: (id: string) => void
  isDeleting?: boolean
}

export function ApiKeyCard({
  apikey,
  onEdit,
  onDelete,
  isDeleting,
}: ApiKeyCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isExpired =
    apikey.expires_at && new Date(apikey.expires_at) < new Date()

  return (
    <Card className="group relative overflow-hidden border-0 shadow-lg shadow-black/5 transition-all hover:shadow-xl dark:shadow-black/20">
      <div className="via-foreground/20 absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent to-transparent" />
      <CardHeader className="space-y-1 pt-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg leading-tight font-semibold tracking-tight">
                {apikey.name}
              </CardTitle>
              <Badge
                variant={
                  apikey.is_active && !isExpired ? 'default' : 'secondary'
                }
              >
                {apikey.is_active && !isExpired ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <CardDescription className="mt-1 text-xs">
              Created {formatDate(apikey.created_at)}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(apikey)}
              disabled={isDeleting}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive h-8 w-8"
              onClick={() => onDelete(apikey.id)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <code className="bg-muted block rounded px-3 py-2 font-mono text-sm break-all">
            {apikey.key}
          </code>
          <div className="text-muted-foreground flex items-center gap-4 text-xs">
            <span>Last used: {formatDate(apikey.last_used_at)}</span>
            {apikey.expires_at && (
              <span className={isExpired ? 'text-destructive' : ''}>
                Expires: {formatDate(apikey.expires_at)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

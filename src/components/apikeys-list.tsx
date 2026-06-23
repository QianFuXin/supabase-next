'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ApiKeyCard } from './apikey-card'
import { ApiKeyForm } from './apikey-form'
import { ConfirmDialog } from './confirm-dialog'
import {
  useApiKeys,
  useCreateApiKey,
  useUpdateApiKey,
  useDeleteApiKey,
} from '@/hooks/useApiKeys'
import type {
  ApiKey,
  CreateApiKeyInput,
  UpdateApiKeyInput,
} from '@/types/apikeys'

export function ApiKeysList() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingApiKey, setEditingApiKey] = useState<ApiKey | null>(null)
  const [deletingApiKeyId, setDeletingApiKeyId] = useState<string | null>(null)

  const { data: apikeys, isLoading, error } = useApiKeys()
  const createApiKey = useCreateApiKey()
  const updateApiKey = useUpdateApiKey()
  const deleteApiKey = useDeleteApiKey()

  const deletingApiKey = deletingApiKeyId
    ? apikeys?.find((k) => k.id === deletingApiKeyId)
    : null

  const handleCreateClick = () => {
    setEditingApiKey(null)
    setIsFormOpen(true)
  }

  const handleEditClick = (apikey: ApiKey) => {
    setEditingApiKey(apikey)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setDeletingApiKeyId(id)
  }

  const handleConfirmDelete = () => {
    if (deletingApiKeyId) {
      deleteApiKey.mutate(deletingApiKeyId, {
        onSuccess: () => setDeletingApiKeyId(null),
      })
    }
  }

  const handleFormSubmit = (data: CreateApiKeyInput | UpdateApiKeyInput) => {
    if ('id' in data) {
      updateApiKey.mutate(data as UpdateApiKeyInput, {
        onSuccess: () => setIsFormOpen(false),
      })
    } else {
      createApiKey.mutate(data as CreateApiKeyInput, {
        onSuccess: () => setIsFormOpen(false),
      })
    }
  }

  const isSubmitting = createApiKey.isPending || updateApiKey.isPending

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p className="text-destructive text-center">
          加载 API 密钥失败：{error.message}
        </p>
        <Button onClick={() => window.location.reload()}>重试</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            API 密钥
          </h1>
          <p className="text-muted-foreground text-sm">
            {apikeys?.length || 0} {apikeys?.length === 1 ? '个密钥' : '个密钥'}
          </p>
        </div>
        <Button onClick={handleCreateClick} className="shrink-0 gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">新建 API 密钥</span>
          <span className="sm:hidden">新建</span>
        </Button>
      </div>

      {apikeys && apikeys.length > 0 ? (
        <div className="grid gap-4">
          {apikeys.map((apikey) => (
            <ApiKeyCard
              key={apikey.id}
              apikey={apikey}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              isDeleting={deleteApiKey.isPending}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
          <div className="text-center">
            <p className="text-lg font-medium">还没有 API 密钥</p>
            <p className="text-muted-foreground text-sm">
              创建您的第一条 API 密钥开始使用
            </p>
          </div>
          <Button
            onClick={handleCreateClick}
            variant="outline"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            创建 API 密钥
          </Button>
        </div>
      )}

      <ApiKeyForm
        key={editingApiKey?.id ?? 'create'}
        apikey={editingApiKey}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        open={!!deletingApiKeyId}
        onOpenChange={(open) => {
          if (!open) setDeletingApiKeyId(null)
        }}
        title="删除 API 密钥"
        description={
          deletingApiKey
            ? `确定要删除"${deletingApiKey.name}"吗？所有使用此密钥的系统将立即失去访问权限。此操作不可撤销。`
            : '确定要删除此 API 密钥吗？此操作不可撤销。'
        }
        confirmText="删除"
        onConfirm={handleConfirmDelete}
        isLoading={deleteApiKey.isPending}
      />
    </div>
  )
}

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
          Failed to load API keys: {error.message}
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground text-sm">
            {apikeys?.length || 0} {apikeys?.length === 1 ? 'key' : 'keys'}
          </p>
        </div>
        <Button onClick={handleCreateClick} className="gap-2">
          <Plus className="h-4 w-4" />
          New API Key
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
            <p className="text-lg font-medium">No API keys yet</p>
            <p className="text-muted-foreground text-sm">
              Create your first API key to get started
            </p>
          </div>
          <Button
            onClick={handleCreateClick}
            variant="outline"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create API Key
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
        title="Delete API key"
        description={
          deletingApiKey
            ? `Are you sure you want to delete "${deletingApiKey.name}"? All systems using this key will lose access immediately. This action cannot be undone.`
            : 'Are you sure you want to delete this API key? This action cannot be undone.'
        }
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        isLoading={deleteApiKey.isPending}
      />
    </div>
  )
}

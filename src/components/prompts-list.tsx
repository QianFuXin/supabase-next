'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PromptCard } from './prompt-card'
import { PromptForm } from './prompt-form'
import { ConfirmDialog } from './confirm-dialog'
import {
  usePrompts,
  useCreatePrompt,
  useUpdatePrompt,
  useDeletePrompt,
} from '@/hooks/usePrompts'
import type {
  Prompt,
  CreatePromptInput,
  UpdatePromptInput,
} from '@/types/prompts'

export function PromptsList() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [deletingPromptId, setDeletingPromptId] = useState<string | null>(null)

  const { data: prompts, isLoading, error } = usePrompts()
  const createPrompt = useCreatePrompt()
  const updatePrompt = useUpdatePrompt()
  const deletePrompt = useDeletePrompt()

  const deletingPrompt = deletingPromptId
    ? prompts?.find((p) => p.id === deletingPromptId)
    : null

  const handleCreateClick = () => {
    setEditingPrompt(null)
    setIsFormOpen(true)
  }

  const handleEditClick = (prompt: Prompt) => {
    setEditingPrompt(prompt)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setDeletingPromptId(id)
  }

  const handleConfirmDelete = () => {
    if (deletingPromptId) {
      deletePrompt.mutate(deletingPromptId, {
        onSuccess: () => setDeletingPromptId(null),
      })
    }
  }

  const handleFormSubmit = (data: CreatePromptInput | UpdatePromptInput) => {
    if ('id' in data) {
      updatePrompt.mutate(data as UpdatePromptInput, {
        onSuccess: () => setIsFormOpen(false),
      })
    } else {
      createPrompt.mutate(data as CreatePromptInput, {
        onSuccess: () => setIsFormOpen(false),
      })
    }
  }

  const isSubmitting = createPrompt.isPending || updatePrompt.isPending

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
          加载提示词失败: {error.message}
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
            我的提示词
          </h1>
          <p className="text-muted-foreground text-sm">
            {prompts?.length || 0} 个提示词
          </p>
        </div>
        <Button onClick={handleCreateClick} className="shrink-0 gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">新建提示词</span>
          <span className="sm:hidden">新建</span>
        </Button>
      </div>

      {prompts && prompts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              isDeleting={deletePrompt.isPending}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
          <div className="text-center">
            <p className="text-lg font-medium">还没有提示词</p>
            <p className="text-muted-foreground text-sm">
              创建您的第一个提示词开始使用
            </p>
          </div>
          <Button
            onClick={handleCreateClick}
            variant="outline"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            创建提示词
          </Button>
        </div>
      )}

      <PromptForm
        key={editingPrompt?.id ?? 'create'}
        prompt={editingPrompt}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        open={!!deletingPromptId}
        onOpenChange={(open) => {
          if (!open) setDeletingPromptId(null)
        }}
        title="删除提示词"
        description={
          deletingPrompt
            ? `确定要删除"${deletingPrompt.title}"？此操作不可撤销。`
            : '确定要删除此提示词？此操作不可撤销。'
        }
        confirmText="删除"
        onConfirm={handleConfirmDelete}
        isLoading={deletePrompt.isPending}
      />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type {
  Prompt,
  CreatePromptInput,
  UpdatePromptInput,
} from '@/types/prompts'

interface PromptFormProps {
  prompt?: Prompt | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreatePromptInput | UpdatePromptInput) => void
  isSubmitting?: boolean
  initialPromptContent?: string
}

export function PromptForm({
  prompt,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  initialPromptContent,
}: PromptFormProps) {
  const isEditing = !!prompt
  const [title, setTitle] = useState(() => prompt?.title ?? '')
  const [description, setDescription] = useState(
    () => prompt?.description ?? '',
  )
  const [promptContent, setPromptContent] = useState(
    () => prompt?.prompt ?? initialPromptContent ?? '',
  )
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('标题不能为空')
      return
    }

    if (isEditing && prompt) {
      onSubmit({
        id: prompt.id,
        title: title.trim(),
        description: description.trim() || undefined,
        prompt: promptContent.trim() || undefined,
      })
    } else {
      onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        prompt: promptContent.trim() || undefined,
      })
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? '编辑提示词' : '创建提示词'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? '编辑您的提示词信息。'
              : '填写以下表单创建新的提示词。'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入提示词标题"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">简介</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="输入简介（可选）"
                rows={3}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="prompt">提示词</Label>
              <Textarea
                id="prompt"
                value={promptContent}
                onChange={(e) => setPromptContent(e.target.value)}
                placeholder="输入提示词内容（可选）"
                rows={8}
                disabled={isSubmitting}
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditing
                  ? '保存中...'
                  : '创建中...'
                : isEditing
                  ? '保存更改'
                  : '创建提示词'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

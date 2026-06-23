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
import type { Note, CreateNoteInput, UpdateNoteInput } from '@/types/notes'

interface NoteFormProps {
  note?: Note | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateNoteInput | UpdateNoteInput) => void
  isSubmitting?: boolean
}

export function NoteForm({
  note,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: NoteFormProps) {
  const isEditing = !!note
  const [title, setTitle] = useState(() => note?.title ?? '')
  const [content, setContent] = useState(() => note?.content ?? '')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('标题为必填项')
      return
    }

    if (isEditing && note) {
      onSubmit({
        id: note.id,
        title: title.trim(),
        content: content.trim() || undefined,
      })
    } else {
      onSubmit({
        title: title.trim(),
        content: content.trim() || undefined,
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
          <DialogTitle>{isEditing ? '编辑笔记' : '创建笔记'}</DialogTitle>
          <DialogDescription>
            {isEditing ? '编辑您的笔记详情。' : '填写以下表单创建新笔记。'}
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
                placeholder="输入笔记标题"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">内容</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="输入笔记内容（可选）"
                rows={6}
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
                  : '创建笔记'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

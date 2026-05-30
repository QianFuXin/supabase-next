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
      setError('Title is required')
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
          <DialogTitle>{isEditing ? 'Edit Note' : 'Create Note'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Edit your note details below.'
              : 'Create a new note by filling out the form below.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter note content (optional)"
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
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditing
                  ? 'Saving...'
                  : 'Creating...'
                : isEditing
                  ? 'Save Changes'
                  : 'Create Note'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

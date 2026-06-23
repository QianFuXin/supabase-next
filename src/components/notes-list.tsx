'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NoteCard } from './note-card'
import { NoteForm } from './note-form'
import { ConfirmDialog } from './confirm-dialog'
import {
  useNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
} from '@/hooks/useNotes'
import type { Note, CreateNoteInput, UpdateNoteInput } from '@/types/notes'

export function NotesList() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null)

  const { data: notes, isLoading, error } = useNotes()
  const createNote = useCreateNote()
  const updateNote = useUpdateNote()
  const deleteNote = useDeleteNote()

  const deletingNote = deletingNoteId
    ? notes?.find((n) => n.id === deletingNoteId)
    : null

  const handleCreateClick = () => {
    setEditingNote(null)
    setIsFormOpen(true)
  }

  const handleEditClick = (note: Note) => {
    setEditingNote(note)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setDeletingNoteId(id)
  }

  const handleConfirmDelete = () => {
    if (deletingNoteId) {
      deleteNote.mutate(deletingNoteId, {
        onSuccess: () => setDeletingNoteId(null),
      })
    }
  }

  const handleFormSubmit = (data: CreateNoteInput | UpdateNoteInput) => {
    if ('id' in data) {
      updateNote.mutate(data as UpdateNoteInput, {
        onSuccess: () => setIsFormOpen(false),
      })
    } else {
      createNote.mutate(data as CreateNoteInput, {
        onSuccess: () => setIsFormOpen(false),
      })
    }
  }

  const isSubmitting = createNote.isPending || updateNote.isPending

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
          加载笔记失败：{error.message}
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
            我的笔记
          </h1>
          <p className="text-muted-foreground text-sm">
            {notes?.length || 0} {notes?.length === 1 ? '条笔记' : '条笔记'}
          </p>
        </div>
        <Button onClick={handleCreateClick} className="shrink-0 gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">新建笔记</span>
          <span className="sm:hidden">新建</span>
        </Button>
      </div>

      {notes && notes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              isDeleting={deleteNote.isPending}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
          <div className="text-center">
            <p className="text-lg font-medium">还没有笔记</p>
            <p className="text-muted-foreground text-sm">
              创建您的第一条笔记开始使用
            </p>
          </div>
          <Button
            onClick={handleCreateClick}
            variant="outline"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            创建笔记
          </Button>
        </div>
      )}

      <NoteForm
        key={editingNote?.id ?? 'create'}
        note={editingNote}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        open={!!deletingNoteId}
        onOpenChange={(open) => {
          if (!open) setDeletingNoteId(null)
        }}
        title="删除笔记"
        description={
          deletingNote
            ? `确定要删除"${deletingNote.title}"吗？此操作不可撤销。`
            : '确定要删除此笔记吗？此操作不可撤销。'
        }
        confirmText="删除"
        onConfirm={handleConfirmDelete}
        isLoading={deleteNote.isPending}
      />
    </div>
  )
}

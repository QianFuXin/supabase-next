'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NoteCard } from './note-card'
import { NoteForm } from './note-form'
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

  const { data: notes, isLoading, error } = useNotes()
  const createNote = useCreateNote()
  const updateNote = useUpdateNote()
  const deleteNote = useDeleteNote()

  const handleCreateClick = () => {
    setEditingNote(null)
    setIsFormOpen(true)
  }

  const handleEditClick = (note: Note) => {
    setEditingNote(note)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    deleteNote.mutate(id)
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
          Failed to load notes: {error.message}
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Notes</h1>
          <p className="text-muted-foreground text-sm">
            {notes?.length || 0} {notes?.length === 1 ? 'note' : 'notes'}
          </p>
        </div>
        <Button onClick={handleCreateClick} className="gap-2">
          <Plus className="h-4 w-4" />
          New Note
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
            <p className="text-lg font-medium">No notes yet</p>
            <p className="text-muted-foreground text-sm">
              Create your first note to get started
            </p>
          </div>
          <Button
            onClick={handleCreateClick}
            variant="outline"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Note
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
    </div>
  )
}

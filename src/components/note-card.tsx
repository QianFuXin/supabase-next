'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import type { Note } from '@/types/notes'

interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
  isDeleting?: boolean
}

export function NoteCard({
  note,
  onEdit,
  onDelete,
  isDeleting,
}: NoteCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card className="group relative overflow-hidden border-0 shadow-lg shadow-black/5 transition-all hover:shadow-xl dark:shadow-black/20">
      <div className="via-foreground/20 absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent to-transparent" />
      <CardHeader className="space-y-1 pt-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg leading-tight font-semibold tracking-tight">
              {note.title}
            </CardTitle>
            <CardDescription className="mt-1 text-xs">
              {formatDate(note.created_at)}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(note)}
              disabled={isDeleting}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive h-8 w-8"
              onClick={() => onDelete(note.id)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {note.content && (
        <CardContent className="pt-0">
          <p className="text-muted-foreground line-clamp-3 text-sm">
            {note.content}
          </p>
        </CardContent>
      )}
    </Card>
  )
}

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
import { Checkbox } from '@/components/ui/checkbox'
import type {
  ApiKey,
  CreateApiKeyInput,
  UpdateApiKeyInput,
} from '@/types/apikeys'

interface ApiKeyFormProps {
  apikey?: ApiKey | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateApiKeyInput | UpdateApiKeyInput) => void
  isSubmitting?: boolean
}

export function ApiKeyForm({
  apikey,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: ApiKeyFormProps) {
  const isEditing = !!apikey
  const [name, setName] = useState(() => apikey?.name ?? '')
  const [key, setKey] = useState(() => apikey?.key ?? '')
  const [expiresAt, setExpiresAt] = useState(() => {
    if (apikey?.expires_at) {
      return new Date(apikey.expires_at).toISOString().slice(0, 16)
    }
    return ''
  })
  const [isActive, setIsActive] = useState(() => apikey?.is_active ?? true)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    if (!isEditing && !key.trim()) {
      setError('API Key is required')
      return
    }

    if (isEditing && apikey) {
      onSubmit({
        id: apikey.id,
        name: name.trim(),
        is_active: isActive,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      })
    } else {
      onSubmit({
        name: name.trim(),
        key: key.trim(),
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : undefined,
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
          <DialogTitle>
            {isEditing ? 'Edit API Key' : 'Create API Key'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Edit your API key details below.'
              : 'Create a new API key by filling out the form below.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter API key name"
                disabled={isSubmitting}
              />
            </div>
            {!isEditing && (
              <div className="grid gap-2">
                <Label htmlFor="key">API Key</Label>
                <Input
                  id="key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Enter your API key"
                  disabled={isSubmitting}
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="expires_at">Expiration Date (Optional)</Label>
              <Input
                id="expires_at"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            {isEditing && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(checked === true)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            )}
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
                  : 'Create API Key'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

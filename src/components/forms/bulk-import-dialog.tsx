'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2, Upload } from 'lucide-react'
import { bulkImportBrands } from '@/actions/brands'
import { bulkImportCategories } from '@/actions/categories'
import { toast } from 'sonner'

interface BulkImportDialogProps {
  type: 'brands' | 'categories'
}

export function BulkImportDialog({ type }: BulkImportDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [textValue, setTextValue] = useState('')

  const handleImport = async () => {
    if (!textValue.trim()) {
      toast.error('Please enter at least one name')
      return
    }

    setIsImporting(true)
    try {
      // Split by newlines or commas
      const names = textValue
        .split(/[\n,]/)
        .map(n => n.trim())
        .filter(n => n)

      const result = type === 'brands'
        ? await bulkImportBrands(names)
        : await bulkImportCategories(names)

      toast.success(`Imported ${result.imported} ${type}${result.skipped > 0 ? `, ${result.skipped} skipped (duplicates)` : ''}`)
      setOpen(false)
      setTextValue('')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to import ${type}`)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Import {type === 'brands' ? 'Brands' : 'Categories'}</DialogTitle>
          <DialogDescription>
            Enter names separated by new lines or commas. Duplicates will be skipped.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="names">Names (one per line or comma-separated)</Label>
            <Textarea
              id="names"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder={`Enter ${type === 'brands' ? 'brand' : 'category'} names...\nExample:\nName 1\nName 2\nName 3`}
              rows={8}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

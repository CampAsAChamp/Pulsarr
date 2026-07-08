import { zodResolver } from '@hookform/resolvers/zod'
import type { ValueGroupFieldType } from '@root/schemas/value-groups/value-groups.schema'
import { Check, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useValueGroups } from '@/features/content-router/hooks/useValueGroups'

// Status type for tracking the dialog state
type SaveStatus = 'idle' | 'loading' | 'success' | 'error'

const GroupNameFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'Name is required' })
    .max(100, { message: 'Name must be at most 100 characters' }),
})

type GroupNameFormValues = z.infer<typeof GroupNameFormSchema>

interface SaveValueGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fieldType: ValueGroupFieldType
  values: Array<string | number>
  tmdbRegion?: string
  onSuccess: () => void
}

/**
 * Displays a modal dialog for saving the currently picked values as a named,
 * reusable group for a condition field type (e.g. genre, user, certification).
 *
 * @param open - Whether the dialog is visible
 * @param onOpenChange - Invoked when the dialog's open state changes
 * @param fieldType - The condition field type this group belongs to
 * @param values - The current selection to save
 * @param tmdbRegion - The TMDB region the values were picked under (streaming services only)
 * @param onSuccess - Invoked after the group is successfully saved
 */
export function SaveValueGroupDialog({
  open,
  onOpenChange,
  fieldType,
  values,
  tmdbRegion,
  onSuccess,
}: SaveValueGroupDialogProps) {
  const { createGroup } = useValueGroups(fieldType)

  const form = useForm<GroupNameFormValues>({
    resolver: zodResolver(GroupNameFormSchema),
    defaultValues: { name: '' },
  })

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  useEffect(() => {
    if (open) {
      form.reset({ name: '' })
      setSaveStatus('idle')
    }
  }, [open, form])

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && saveStatus !== 'loading') {
      form.reset()
      setSaveStatus('idle')
    }

    if (saveStatus !== 'loading') {
      onOpenChange(newOpen)
    }
  }

  const handleSubmit = async (formValues: GroupNameFormValues) => {
    setSaveStatus('loading')

    try {
      const minimumLoadingTime = new Promise((resolve) =>
        setTimeout(resolve, 500),
      )

      await Promise.all([
        createGroup(formValues.name, values, tmdbRegion),
        minimumLoadingTime,
      ])

      toast.success(`Group "${formValues.name}" saved successfully`)
      setSaveStatus('success')

      setTimeout(() => {
        handleOpenChange(false)
        onSuccess()
      }, 250)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to save group',
      )
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 500)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => {
          if (saveStatus === 'loading') {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={(e) => {
          if (saveStatus === 'loading') {
            e.preventDefault()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Save as Reusable Group
          </DialogTitle>
          <DialogDescription>
            Give this selection a name so you can reuse it on other routes.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Group Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Kids Genres"
                      disabled={saveStatus !== 'idle'}
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="neutral"
                onClick={() => handleOpenChange(false)}
                disabled={saveStatus !== 'idle'}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveStatus !== 'idle'}
                className="min-w-[100px] flex items-center justify-center gap-2"
              >
                {saveStatus === 'loading' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : saveStatus === 'success' ? (
                  <>
                    <Check className="h-4 w-4" />
                    Saved!
                  </>
                ) : (
                  'Save Group'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

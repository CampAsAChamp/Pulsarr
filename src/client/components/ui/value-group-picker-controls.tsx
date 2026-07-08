import type { ValueGroupFieldType } from '@root/schemas/value-groups/value-groups.schema'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { SaveValueGroupDialog } from '@/components/ui/save-value-group-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useValueGroups } from '@/features/content-router/hooks/useValueGroups'
import { useConfigStore } from '@/stores/configStore'

interface ValueGroupPickerControlsProps {
  fieldType: ValueGroupFieldType
  values: unknown
  onLoadGroup: (values: Array<string | number>) => void
  disabled?: boolean
}

/**
 * Adds "save current selection as a reusable group" and "load a saved group"
 * controls next to an In/Not-in multi-select picker.
 *
 * Saved groups are scoped to a single field type (e.g. genre, user,
 * certification, seriesStatus, movieStatus, streamingServices) so a group
 * saved for one field never appears when picking values for another.
 *
 * @param fieldType - The condition field type this picker is for
 * @param values - The picker's current selection, used when saving a new group
 * @param onLoadGroup - Invoked with a saved group's values when the user loads it
 * @param disabled - If true, disables both controls
 */
export function ValueGroupPickerControls({
  fieldType,
  values,
  onLoadGroup,
  disabled = false,
}: ValueGroupPickerControlsProps) {
  const { groups, fetchGroups } = useValueGroups(fieldType)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const tmdbRegion = useConfigStore((state) => state.config?.tmdbRegion)

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  const normalizedValues: Array<string | number> = Array.isArray(values)
    ? values.filter(
        (v): v is string | number =>
          typeof v === 'string' || typeof v === 'number',
      )
    : typeof values === 'string' || typeof values === 'number'
      ? [values]
      : []

  const isStreaming = fieldType === 'streamingServices'
  const saveDisabled = disabled || normalizedValues.length === 0

  return (
    <>
      <div className="flex gap-2 items-center shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="noShadow"
              size="icon"
              onClick={() => setShowSaveDialog(true)}
              disabled={saveDisabled}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Save current selection as a reusable group</p>
          </TooltipContent>
        </Tooltip>

        {groups.length > 0 && (
          <Select
            value=""
            onValueChange={(groupId) => {
              const group = groups.find((g) => g.id.toString() === groupId)
              if (group) {
                onLoadGroup(group.values)
              }
            }}
            disabled={disabled}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Load saved group" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id.toString()}>
                  {isStreaming && group.tmdb_region
                    ? `${group.name} (${group.tmdb_region})`
                    : group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <SaveValueGroupDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        fieldType={fieldType}
        values={normalizedValues}
        tmdbRegion={isStreaming ? tmdbRegion : undefined}
        onSuccess={fetchGroups}
      />
    </>
  )
}

export default ValueGroupPickerControls

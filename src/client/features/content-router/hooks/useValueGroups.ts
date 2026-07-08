import type {
  CreateValueGroupResponse,
  GetValueGroupsResponse,
  ValueGroup,
  ValueGroupFieldType,
} from '@root/schemas/value-groups/value-groups.schema'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

/**
 * React hook for managing saved value groups for a specific condition field type.
 *
 * Provides state and functions to fetch, create, and delete reusable groups of
 * picked values (e.g. saved genre or user selections) scoped to one field type.
 *
 * @param fieldType - The condition field type these groups belong to (e.g. "genre", "user").
 * @returns An object containing the current groups, loading state, and functions for managing groups.
 */
export function useValueGroups(fieldType: ValueGroupFieldType) {
  const [groups, setGroups] = useState<ValueGroup[]>([])
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Fetch all saved groups for this field type
   */
  const fetchGroups = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        api(`/v1/value-groups?field_type=${fieldType}`),
      )

      if (!response.ok) {
        throw new Error('Failed to fetch saved groups')
      }

      const data: GetValueGroupsResponse = await response.json()
      setGroups(data.groups)
      return data.groups
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      toast.error(`Failed to fetch saved groups: ${errorMessage}`)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [fieldType])

  /**
   * Save the current selection as a new named group
   */
  const createGroup = useCallback(
    async (
      name: string,
      values: Array<string | number>,
      tmdbRegion?: string,
    ) => {
      const response = await fetch(api('/v1/value-groups'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          field_type: fieldType,
          values,
          tmdb_region: tmdbRegion,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || 'Failed to save group')
      }

      const data: CreateValueGroupResponse = await response.json()
      setGroups((prevGroups) =>
        [...prevGroups, data.group].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      )
      return data.group
    },
    [fieldType],
  )

  /**
   * Delete a saved group
   */
  const deleteGroup = useCallback(async (id: number) => {
    try {
      const response = await fetch(api(`/v1/value-groups/${id}`), {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete saved group')
      }

      setGroups((prevGroups) => prevGroups.filter((group) => group.id !== id))
      toast.success('Saved group deleted')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      toast.error(`Failed to delete saved group: ${errorMessage}`)
      throw err
    }
  }, [])

  return {
    groups,
    isLoading,
    fetchGroups,
    createGroup,
    deleteGroup,
  }
}

import type { ValueGroup } from '@schemas/value-groups/value-groups.schema.js'

declare module '@services/database.service.js' {
  interface DatabaseService {
    /**
     * Creates a new saved value group
     * @param data - The group's name, field type, values, and optional TMDB region
     * @returns Promise resolving to the created value group
     */
    createValueGroup(data: {
      name: string
      field_type: string
      values: Array<string | number>
      tmdb_region?: string
    }): Promise<ValueGroup>

    /**
     * Retrieves saved value groups, optionally filtered by field type
     * @param fieldType - If provided, only groups for this field type are returned
     * @returns Promise resolving to an array of value groups
     */
    getValueGroups(fieldType?: string): Promise<ValueGroup[]>

    /**
     * Deletes a saved value group by id
     * @param id - The value group's id
     * @returns Promise resolving to true if deleted, false if not found
     */
    deleteValueGroup(id: number): Promise<boolean>
  }
}

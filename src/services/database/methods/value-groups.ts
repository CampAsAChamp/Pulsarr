import type { ValueGroup } from '@schemas/value-groups/value-groups.schema.js'
import type { DatabaseService } from '@services/database.service.js'

interface ValueGroupRow {
  id: number
  name: string
  field_type: string
  values: string
  tmdb_region: string | null
  created_at: string
  updated_at: string
}

function formatValueGroup(
  this: DatabaseService,
  row: ValueGroupRow,
): ValueGroup {
  return {
    id: row.id,
    name: row.name,
    field_type: row.field_type as ValueGroup['field_type'],
    values: this.safeJsonParse(row.values, [], 'value_group.values'),
    tmdb_region: row.tmdb_region,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

/**
 * Creates a new saved value group for a given field type.
 *
 * @param data - The group's name, field type, values, and optional TMDB region
 * @returns The newly created value group
 */
export async function createValueGroup(
  this: DatabaseService,
  data: {
    name: string
    field_type: string
    values: Array<string | number>
    tmdb_region?: string
  },
): Promise<ValueGroup> {
  const [row] = await this.knex('value_groups')
    .insert({
      name: data.name,
      field_type: data.field_type,
      values: JSON.stringify(data.values),
      tmdb_region: data.tmdb_region ?? null,
      created_at: this.timestamp,
      updated_at: this.timestamp,
    })
    .returning('*')

  return formatValueGroup.call(this, row)
}

/**
 * Retrieves saved value groups, optionally filtered by field type.
 *
 * @param fieldType - If provided, only groups for this field type are returned
 * @returns An array of value groups ordered by name
 */
export async function getValueGroups(
  this: DatabaseService,
  fieldType?: string,
): Promise<ValueGroup[]> {
  const query = this.knex('value_groups').orderBy('name', 'asc')

  if (fieldType) {
    query.where('field_type', fieldType)
  }

  const rows = await query
  return rows.map((row: ValueGroupRow) => formatValueGroup.call(this, row))
}

/**
 * Deletes a saved value group by id.
 *
 * @param id - The value group's id
 * @returns True if a group was found and deleted; false otherwise
 */
export async function deleteValueGroup(
  this: DatabaseService,
  id: number,
): Promise<boolean> {
  const result = await this.knex('value_groups').where('id', id).delete()

  return result > 0
}

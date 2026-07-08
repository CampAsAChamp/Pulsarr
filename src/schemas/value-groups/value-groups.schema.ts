import { ErrorSchema } from '@root/schemas/common/error.schema.js'
import { z } from 'zod'

export const ValueGroupFieldTypeSchema = z.enum([
  'genre',
  'user',
  'certification',
  'seriesStatus',
  'movieStatus',
  'streamingServices',
])

// Common Value Group Schema
const ValueGroupSchema = z.object({
  id: z.number(),
  name: z.string(),
  field_type: ValueGroupFieldTypeSchema,
  values: z.array(z.union([z.string(), z.number()])),
  tmdb_region: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

// Create Value Group Schema
export const CreateValueGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'Name is required' })
    .max(100, { error: 'Name must be at most 100 characters' }),
  field_type: ValueGroupFieldTypeSchema,
  values: z
    .array(z.union([z.string(), z.number()]))
    .min(1, { error: 'At least one value is required' }),
  tmdb_region: z.string().optional(),
})

export const CreateValueGroupResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  group: ValueGroupSchema,
})

// Get Value Groups Schema
export const GetValueGroupsQuerySchema = z.object({
  field_type: ValueGroupFieldTypeSchema.optional(),
})

export const GetValueGroupsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  groups: z.array(ValueGroupSchema),
})

// Delete Value Group Schema
export const DeleteValueGroupParamsSchema = z.object({
  id: z.coerce.number(),
})

export const DeleteValueGroupResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
})

// Exported inferred types
export type ValueGroupFieldType = z.infer<typeof ValueGroupFieldTypeSchema>
export type ValueGroup = z.infer<typeof ValueGroupSchema>
export type CreateValueGroup = z.infer<typeof CreateValueGroupSchema>
export type CreateValueGroupResponse = z.infer<
  typeof CreateValueGroupResponseSchema
>
export type GetValueGroupsQuery = z.infer<typeof GetValueGroupsQuerySchema>
export type GetValueGroupsResponse = z.infer<
  typeof GetValueGroupsResponseSchema
>
export type DeleteValueGroupParams = z.infer<
  typeof DeleteValueGroupParamsSchema
>
export type DeleteValueGroupResponse = z.infer<
  typeof DeleteValueGroupResponseSchema
>

// Re-export shared error schema with domain-specific alias
export { ErrorSchema as ValueGroupErrorSchema }
export type ValueGroupError = z.infer<typeof ErrorSchema>

import {
  CreateValueGroupResponseSchema,
  CreateValueGroupSchema,
  DeleteValueGroupParamsSchema,
  GetValueGroupsQuerySchema,
  GetValueGroupsResponseSchema,
  ValueGroupErrorSchema,
} from '@schemas/value-groups/value-groups.schema.js'
import { logRouteError } from '@utils/route-errors.js'
import type { FastifyPluginAsyncZodOpenApi } from 'fastify-zod-openapi'

const plugin: FastifyPluginAsyncZodOpenApi = async (fastify) => {
  // Create Value Group
  fastify.post(
    '/value-groups',
    {
      schema: {
        summary: 'Create value group',
        operationId: 'createValueGroup',
        description:
          'Save a named, reusable group of picked values for a condition field type',
        body: CreateValueGroupSchema,
        response: {
          201: CreateValueGroupResponseSchema,
          400: ValueGroupErrorSchema,
          500: ValueGroupErrorSchema,
        },
        tags: ['Value Groups'],
      },
    },
    async (request, reply) => {
      try {
        const group = await fastify.db.createValueGroup(request.body)

        reply.status(201)
        return {
          success: true,
          message: 'Value group created successfully',
          group,
        }
      } catch (error) {
        logRouteError(fastify.log, request, error, {
          message: 'Failed to create value group',
        })
        return reply.internalServerError('Failed to create value group')
      }
    },
  )

  // Get Value Groups
  fastify.get(
    '/value-groups',
    {
      schema: {
        summary: 'Get value groups',
        operationId: 'getValueGroups',
        description:
          'Retrieve saved value groups, optionally filtered by field type',
        querystring: GetValueGroupsQuerySchema,
        response: {
          200: GetValueGroupsResponseSchema,
          500: ValueGroupErrorSchema,
        },
        tags: ['Value Groups'],
      },
    },
    async (request, reply) => {
      try {
        const groups = await fastify.db.getValueGroups(request.query.field_type)

        return {
          success: true,
          message: 'Value groups retrieved successfully',
          groups,
        }
      } catch (error) {
        logRouteError(fastify.log, request, error, {
          message: 'Failed to retrieve value groups',
        })
        return reply.internalServerError('Failed to retrieve value groups')
      }
    },
  )

  // Delete Value Group
  fastify.delete(
    '/value-groups/:id',
    {
      schema: {
        summary: 'Delete value group',
        operationId: 'deleteValueGroup',
        description: 'Delete a saved value group by ID',
        params: DeleteValueGroupParamsSchema,
        response: {
          204: { type: 'null', description: 'No Content' },
          404: ValueGroupErrorSchema,
          500: ValueGroupErrorSchema,
        },
        tags: ['Value Groups'],
      },
    },
    async (request, reply) => {
      try {
        const result = await fastify.db.deleteValueGroup(request.params.id)

        if (!result) {
          return reply.notFound('Value group not found')
        }

        reply.status(204)
        return
      } catch (error) {
        logRouteError(fastify.log, request, error, {
          message: 'Failed to delete value group',
        })
        return reply.internalServerError('Failed to delete value group')
      }
    },
  )
}

export default plugin

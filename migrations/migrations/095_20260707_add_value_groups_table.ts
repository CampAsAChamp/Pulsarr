import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  const isPostgres = knex.client.config.client === 'pg'

  await knex.schema.createTable('value_groups', (table) => {
    table.increments('id').primary()
    table.string('name').notNullable()
    table.string('field_type').notNullable()

    if (isPostgres) {
      table
        .specificType('values', 'jsonb')
        .notNullable()
        .defaultTo(knex.raw("'[]'::jsonb"))
    } else {
      table.json('values').notNullable().defaultTo('[]')
    }

    table.string('tmdb_region').nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())

    table.unique(['name', 'field_type'])
    table.index('field_type')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('value_groups')
}

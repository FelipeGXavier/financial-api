import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTableIfNotExists("accounts", builder => {
    builder.increments("id").primary()
    builder.uuid("guid").notNullable().defaultTo(knex.raw("uuid_generate_v4()"))
    builder.string("name", 150).notNullable()
    builder.string("email", 100).notNullable().unique()
    builder.string("password", 150).notNullable()
    builder.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("accounts")
}

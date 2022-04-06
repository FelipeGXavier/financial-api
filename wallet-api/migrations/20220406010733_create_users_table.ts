import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTableIfNotExists("users", builder => {
    builder.increments("id")
    builder.string("cpf", 11).notNullable().unique()
    builder.integer("account_id").notNullable()
    builder.foreign("account_id").references("id").inTable("accounts")
    builder.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("users")
}

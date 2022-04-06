import { Knex } from "knex"
import { randomUUID } from "crypto"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTableIfNotExists("wallets", builder => {
    builder.increments("id").primary()
    builder.uuid("guid").notNullable().unique().defaultTo(randomUUID())
    builder.integer("amount")
    builder.integer("account_id").notNullable()
    builder.foreign("account_id").references("id").inTable("accounts")
    builder.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("wallets")
}

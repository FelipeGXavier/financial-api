import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTableIfNotExists("wallets", builder => {
    builder.increments("id").primary()
    builder.uuid("guid").notNullable().defaultTo(knex.raw("uuid_generate_v4()"))
    builder.bigInteger("amount").defaultTo(0).notNullable()
    builder.integer("account_id").notNullable()
    builder.foreign("account_id").references("id").inTable("accounts")
    builder.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("wallets")
}

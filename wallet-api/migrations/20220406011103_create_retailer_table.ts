import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTableIfNotExists("retailers", builder => {
    builder.increments("id")
    builder.string("cnpj", 14).notNullable().unique()
    builder.integer("account_id").notNullable()
    builder.integer("wallet_id").notNullable()
    builder.foreign("account_id").references("id").inTable("accounts")
    builder.foreign("wallet_id").references("id").inTable("wallets")
    builder.unique(["account_id", "wallet_id"])
    builder.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("retailers")
}

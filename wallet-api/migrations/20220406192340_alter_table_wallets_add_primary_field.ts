import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("wallets", builder => {
    builder.boolean("primary_wallet").defaultTo(true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table("wallets", builder => {
    builder.dropColumn("primary_wallet")
  })
}

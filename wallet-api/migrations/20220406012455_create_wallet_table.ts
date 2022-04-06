import { Knex } from "knex"
import { randomUUID } from "crypto"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTableIfNotExists("wallet_transactions", builder => {
    builder.increments("id").primary()
    builder.uuid("guid").notNullable().unique().defaultTo(randomUUID())
    builder.bigInteger("amount").notNullable()
    builder.timestamp("transaction_date").notNullable().defaultTo(knex.fn.now())
    builder
      .enum("state", ["pending", "finished", "failed", "rejected"])
      .notNullable()
      .defaultTo("pending")
    builder.integer("payer_wallet_id").notNullable()
    builder.integer("payee_wallet_id").notNullable()
    builder.foreign("payer_wallet_id").references("id").inTable("wallets")
    builder.foreign("payee_wallet_id").references("id").inTable("wallets")
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("wallet_transactions")
}

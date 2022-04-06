import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.raw(
    `ALTER TABLE wallets ADD CONSTRAINT primary_wallet_true_or_null CHECK(primary_wallet);
     ALTER TABLE wallets ADD CONSTRAINT primary_wallet_only_1_true UNIQUE(account_id, primary_wallet);`
  )
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(
    `ALTER TABLE wallets DROP CONTRAINT primary_wallet_true_or_null;
     ALTER TABLE wallets DROP CONTRAINT primary_wallet_only_1_true;`
  )
}

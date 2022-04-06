import { Knex } from "knex"
import * as bcrypt from "bcrypt"

export async function seed(knex: Knex): Promise<void> {
  const password = await bcrypt.hash("password", 10)
  const accountId = (
    (await knex("accounts")
      .insert({
        name: "Virgulino Souza",
        email: "virgulino@example.com",
        password: password,
      })
      .returning("id")) as Array<number>
  )[0]

  const walletId = (
    (await knex("wallets")
      .insert({
        account_id: accountId,
        primary_wallet: true,
      })
      .returning("id")) as Array<number>
  )[0]

  await knex("retailers").insert({
    cnpj: "0000000000000",
    account_id: accountId,
    wallet_id: walletId,
  })
}

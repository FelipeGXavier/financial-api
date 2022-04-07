import faker from "@faker-js/faker"
import * as bcrypt from "bcrypt"
import { Knex } from "knex"

export async function seed(knex: Knex): Promise<void> {
  const password = await bcrypt.hash("password", 10)
  const accountId = (
    (await knex("accounts")
      .insert({
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: password,
      })
      .returning("id")) as Array<number>
  )[0]

  await knex("users").insert({
    cpf: Math.floor(100000 + Math.random() * 90000000000),
    account_id: accountId,
  })

  await knex("wallets").insert({ account_id: accountId, primary_wallet: true })
}

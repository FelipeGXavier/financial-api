import { Account, NamedAccountFields } from "../src/customer/domain/account"

const env = "development"

import config from "../config/knexfile"
import knex from "knex"

const connection = knex(config[env])

async function test() {
  const accountData = await connection("accounts")
    .select<NamedAccountFields>("name", "email", "password", "id", "guid")
    .first()
  console.log(new Account(accountData as NamedAccountFields).getGuid())
}

test()

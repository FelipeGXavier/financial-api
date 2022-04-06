const env = "development"

import config from "../config/knexfile"
import knex from "knex"

const connection = knex(config[env])

async function test() {
  console.log(await connection.select(connection.raw("1")).first())
}

test()

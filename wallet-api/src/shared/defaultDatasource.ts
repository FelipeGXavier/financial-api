const env = process.env.NODE_ENV || "development"

import config from "../../config/knexfile"
import knex, { Knex } from "knex"
import { promisify } from "./promisfy"

export const connection = knex(config[env as "development" | "production"])

export class DefaultDatasource {
  constructor(private readonly connection: Knex) {}
}

export const databaseTransactionCtx = async (): Promise<Knex.Transaction> => {
  return (await promisify(
    connection.transaction.bind(connection)
  )) as Knex.Transaction
}

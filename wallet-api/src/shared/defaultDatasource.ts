const env = "development"

import config from "../../config/knexfile"
import knex, { Knex } from "knex"

export const connection = knex(config[env])

export class DefaultDatasource {
  constructor(private readonly connection: Knex) {}
}

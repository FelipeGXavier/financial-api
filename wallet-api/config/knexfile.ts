// Update with your config settings.

export default {
  development: {
    client: "postgresql",
    connection: {
      database: "test",
      user: "postgres",
      password: "postgres",
      port: 5433,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
      extension: "ts",
      loadExtensions: [".ts"],
      directory: "../migrations",
    },
    seeds: {
      directory: "../seeds",
    },
  },

  production: {
    client: "postgresql",
    connection: {
      database: "demo",
      user: "postgres",
      password: "postgres",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
      extension: "ts",
      loadExtensions: [".ts"],
      directory: "../migrations",
    },
    seeds: {
      directory: "../seeds",
    },
  },
}

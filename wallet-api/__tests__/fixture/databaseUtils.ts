import { connection } from "@/shared/defaultDatasource"
import path from "path"

export const createSchemaAndMigrate = async () => {
  await connection.raw(`
      CREATE OR REPLACE
      FUNCTION fresh() RETURNS void AS $$
      BEGIN
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON
      SCHEMA public TO postgres;
      GRANT ALL ON
      SCHEMA public TO public;
      END;
      $$ LANGUAGE 'plpgsql';
   `)
  //Recreate schema
  await connection.raw(`SELECT fresh();`)
  // Migrate
  await connection.migrate.latest({
    directory: path.join(__dirname, "../../migrations"),
  })
}

export const clearAllTables = async () => {
  await connection.raw(`
    CREATE OR REPLACE FUNCTION truncate_tables() RETURNS void AS $$
    DECLARE
    statements CURSOR FOR
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public';
    BEGIN
        FOR stmt IN statements LOOP
            EXECUTE 'TRUNCATE TABLE ' || quote_ident(stmt.tablename) || ' CASCADE;';
        END LOOP;
    END;
    $$ LANGUAGE plpgsql;
  `)
  await connection.raw(`SELECT truncate_tables();`)
}

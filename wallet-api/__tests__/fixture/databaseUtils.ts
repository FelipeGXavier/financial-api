import { connection } from "@/shared/defaultDatasource"
import path from "path"
import * as bcrypt from "bcrypt"
import faker from "@faker-js/faker"
import { TransactionState } from "@/transaction/domain/transactionState"

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

type UserRetailerData = {
  userGuid: string
  userAccountId: number
  retailerGuid: string
  retailerAccountId: number
  userWalletId: number
  retailerWalletId: number
}

export const createUserRetailerWithWallet = async (walletAmounts: {
  userWalletAmount: number
  retailerWalletAmount: number
}): Promise<UserRetailerData> => {
  const userPassword = await bcrypt.hash("password", 10)
  const retailerPassword = await bcrypt.hash("password", 10)
  type AccountGuidId = {
    id: number
    guid: string
  }
  const userAccountId = (
    (await connection("accounts")
      .insert({
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: userPassword,
      })
      .returning(["id", "guid"])) as AccountGuidId[]
  )[0]
  const retailerAccountId = (
    (await connection("accounts")
      .insert({
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: retailerPassword,
      })
      .returning(["id", "guid"])) as AccountGuidId[]
  )[0]
  await connection("users").insert({
    cpf: Math.floor(100000 + Math.random() * 90000000000),
    account_id: userAccountId.id,
  })
  await connection("retailers").insert({
    cnpj: Math.floor(100000 + Math.random() * 90000000000000),
    account_id: retailerAccountId.id,
  })
  const userWalletId = (
    (await connection("wallets")
      .insert({
        account_id: userAccountId.id,
        primary_wallet: true,
        amount: walletAmounts.userWalletAmount,
      })
      .returning("id")) as number[]
  )[0]
  const retailerWalletId = (
    (await connection("wallets")
      .insert({
        account_id: retailerAccountId.id,
        primary_wallet: true,
        amount: walletAmounts.retailerWalletAmount,
      })
      .returning("id")) as number[]
  )[0]
  return {
    userGuid: userAccountId.guid,
    userAccountId: userAccountId.id,
    retailerGuid: retailerAccountId.guid,
    retailerAccountId: retailerAccountId.id,
    userWalletId,
    retailerWalletId,
  }
}

type TransactionRecord = {
  id: number
  amount: number
  state: TransactionState
}

export const getTransactionRecord = (
  payerWalletId: number,
  payeeWalletId: number
): Promise<TransactionRecord[]> => {
  return connection("wallet_transactions")
    .select<TransactionRecord[]>("id", "amount", "state")
    .where({ payer_wallet_id: payerWalletId, payee_wallet_id: payeeWalletId })
}

export const getWalletData = (
  walletId: number
): Promise<{ amount: number; account_id: number } | undefined> => {
  return connection("wallets")
    .select<{ amount: number; account_id: number }>("amount", "account_id")
    .where({ id: walletId })
    .first()
}

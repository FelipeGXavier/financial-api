import { Wallet } from "@/transaction/domain/wallet"
import { WalletRepository } from "@/transaction/infra/contracts/walletRepository"
import { Knex } from "knex"
import { Amount } from "@/transaction/domain/valueobject/amount"
import { TransactionState } from "../../domain/transactionState"

export class WalletRepositoryImpl implements WalletRepository {
  private readonly table = "wallets"

  constructor(private readonly connection: Knex) {}

  async findPrimaryWalletByAccountId(
    accountId: number
  ): Promise<Wallet | null> {
    const walletContent = await this.connection(this.table)
      .select(
        "id",
        "guid",
        "amount",
        "account_id",
        "primary_wallet",
        this.connection.raw(`
      (CASE 
        WHEN (
        SELECT
          count(*)
        FROM
          retailers r
        WHERE
          r.id = wallets.account_id
        ) > 0 THEN 'retailer'
        ELSE 'user'
      END) AS "account_type"`)
      )
      .innerJoin("accounts", "wallets.account_id", "=", "accounts.id")
      .where("account_id", accountId)
      .andWhere("primary_wallet", true)
      .first()
    if (walletContent) {
      return new Wallet({
        id: walletContent.id,
        guid: walletContent.guid,
        account: walletContent.account_id,
        amount: Amount.of(parseInt(walletContent.amount)),
        primaryWallet: true,
        accountType: walletContent.account_type,
      })
    }
    return null
  }

  async findPrimaryWalletByAccountGuid(
    accountGuid: string
  ): Promise<Wallet | null> {
    const userId = (
      await this.connection("accounts").where("guid", accountGuid).pluck("id")
    )[0]
    if (!userId) {
      return null
    }
    const walletContent = await this.connection(this.table)
      .select(
        "wallets.id",
        "wallets.guid",
        "wallets.amount",
        "wallets.account_id",
        "wallets.primary_wallet",
        this.connection.raw(`
      (CASE 
        WHEN (
        SELECT
          count(*)
        FROM
          retailers
        WHERE
          retailers.account_id = wallets.account_id
        ) > 0 THEN 'retailer'
        ELSE 'user'
      END) AS "account_type"`)
      )
      .innerJoin("accounts", "wallets.account_id", "=", "accounts.id")
      .where("account_id", userId)
      .andWhere("primary_wallet", true)
      .first()
    if (walletContent) {
      return new Wallet({
        id: walletContent.id,
        guid: walletContent.guid,
        account: walletContent.account_id,
        amount: Amount.of(parseInt(walletContent.amount)),
        primaryWallet: true,
        accountType: walletContent.account_type,
      })
    }
    return null
  }

  async updateWalletAmount(
    wallet: Wallet,
    trx?: Knex.Transaction
  ): Promise<number> {
    if (trx != null && trx != undefined) {
      return trx(this.table)
        .update({
          amount: wallet.getValue(),
        })
        .where("guid", wallet.getGuid())
    }
    return Promise.reject(0)
  }

  async saveWalletTransactionRegister(
    amount: number,
    payerId: number,
    payeeId: number,
    trx?: Knex.Transaction
  ): Promise<number | undefined> {
    return (
      await this.connection("wallet_transactions")
        .insert({
          amount,
          state: TransactionState.Pending,
          payer_wallet_id: payerId,
          payee_wallet_id: payeeId,
        })
        .returning("id")
    )[0] as number
  }

  async updateWalletTransactionState(
    transactionId: number,
    state: TransactionState,
    trx?: Knex.Transaction
  ): Promise<void> {
    if (trx != null && trx != undefined) {
      await trx("wallet_transactions")
        .update({ state })
        .where("id", transactionId)
    } else {
      await this.connection("wallet_transactions")
        .update({ state })
        .where("id", transactionId)
    }
  }
}

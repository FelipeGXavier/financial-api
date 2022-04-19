import { Wallet } from "@/transaction/domain/wallet"
import { WalletRepository } from "@/transaction/infra/contracts/walletRepository"
import { Knex } from "knex"
import { Amount } from "@/transaction/domain/valueobject/amount"

export class WalletRepositoryImpl implements WalletRepository {
  private readonly table = "wallets"

  constructor(private readonly connection: Knex) {}

  async findPrimaryWalletByAccountId(
    accountId: number
  ): Promise<Wallet | null> {
    const walletContent = await this.connection(this.table)
      .select("guid", "amount", "account_id", "primary_wallet")
      .where("account_id", accountId)
      .andWhere("primary_wallet", true)
      .first()
    if (walletContent) {
      return new Wallet({
        guid: walletContent.guid,
        account: walletContent.account_id,
        amount: Amount.of(parseInt(walletContent.amount)),
        primaryWallet: true,
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
      .select("guid", "amount", "account_id", "primary_wallet")
      .where("account_id", userId)
      .andWhere("primary_wallet", true)
      .first()
    if (walletContent) {
      return new Wallet({
        guid: walletContent.guid,
        account: walletContent.account_id,
        amount: Amount.of(parseInt(walletContent.amount)),
        primaryWallet: true,
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
}

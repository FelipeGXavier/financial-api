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
}

import { Wallet } from "@/transaction/domain/wallet"
import { Knex } from "knex"

export interface WalletRepository {
  findPrimaryWalletByAccountId: (accountId: number) => Promise<Wallet | null>
  findPrimaryWalletByAccountGuid: (
    accountGuid: string
  ) => Promise<Wallet | null>
  updateWalletAmount: (
    wallet: Wallet,
    ctx?: Knex.Transaction
  ) => Promise<number>
}

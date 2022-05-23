import { Wallet } from "@/transaction/domain/wallet"
import { Knex } from "knex"
import { TransactionState } from "@/transaction/domain/transactionState"

export interface WalletRepository {
  findPrimaryWalletByAccountId: (accountId: number) => Promise<Wallet | null>
  findPrimaryWalletByAccountGuid: (
    accountGuid: string
  ) => Promise<Wallet | null>
  updateWalletAmount: (
    wallet: Wallet,
    ctx?: Knex.Transaction
  ) => Promise<number>
  saveWalletTransactionRegister: (
    amount: number,
    payerId: number,
    payeeId: number,
    trx?: Knex.Transaction
  ) => Promise<number[] | undefined>
  updateWalletTransactionState: (
    transactionId: number,
    state: TransactionState,
    trx?: Knex.Transaction
  ) => Promise<void>
}

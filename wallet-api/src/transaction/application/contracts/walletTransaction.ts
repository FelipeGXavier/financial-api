import { TransactionRequest } from "@/transaction/infra/web/types/transactionRequest"

export interface WalletTransaction {
  walletTransaction: (transaction: TransactionRequest) => any
}

import { Wallet } from "@/transaction/domain/wallet"

export interface WalletRepository {
  findPrimaryWalletByAccountId: (accountId: number) => Promise<Wallet | null>
}

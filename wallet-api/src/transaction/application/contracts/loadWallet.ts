import { Wallet } from "@/transaction/domain/wallet"

export interface LoadWallet {
  loadWalletByAccountId: (accountGuid: string) => Promise<Wallet>
  loadWalletById: (accountGuid: string, walletGuid: string) => Promise<Wallet>
}

import { Wallet } from "@/transaction/domain/wallet"
import { LoadWallet } from "@/transaction/application/contracts/loadWallet"
import { AccountRepository } from "@/customer/infra/contracts/accountRepository"
import { WalletRepository } from "@/transaction/infra/contracts/walletRepository"

export class LoadWalletService implements LoadWallet {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly walletRepository: WalletRepository
  ) {}

  async loadWalletByAccountId(accountGuid: string): Promise<Wallet> {
    const user = await this.accountRepository.findAccountByGuid(accountGuid)
    if (!user) {
      throw new Error("LoadWalletService User not found error")
    }
    const wallet = await this.walletRepository.findPrimaryWalletByAccountId(
      user.getId()
    )
    if (!wallet) {
      throw new Error("LoadWalletService Wallet not found error")
    }
    return wallet
  }

  loadWalletById(accountGuid: string, walletGuid: string): Promise<Wallet> {
    return Promise.reject(null)
  }
}

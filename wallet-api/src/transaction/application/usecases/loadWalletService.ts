import { Wallet } from "@/transaction/domain/wallet"
import { LoadWallet } from "@/transaction/application/contracts/loadWallet"
import { AccountRepository } from "@/customer/infra/contracts/accountRepository"
import { WalletRepository } from "@/transaction/infra/contracts/walletRepository"
import { CustomDomainError } from "@/transaction/errors/customError"
import { Either, left, right } from "@/shared/either"

export class LoadWalletService implements LoadWallet {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly walletRepository: WalletRepository
  ) {}

  async loadWalletByAccountId(
    accountGuid: string
  ): Promise<Either<CustomDomainError, Wallet>> {
    const user = await this.accountRepository.findAccountByGuid(accountGuid)
    if (!user) {
      return left(new CustomDomainError("User not found from given user guid"))
    }
    const wallet = await this.walletRepository.findPrimaryWalletByAccountId(
      user.getId()
    )
    if (!wallet) {
      return left(
        new CustomDomainError("Primary wallet not found from given user guid")
      )
    }
    return right(wallet)
  }

  loadWalletById(accountGuid: string, walletGuid: string): Promise<Wallet> {
    return Promise.reject(null)
  }
}

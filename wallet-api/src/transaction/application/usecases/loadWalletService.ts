import { Wallet } from "@/transaction/domain/wallet"
import { LoadWallet } from "@/transaction/application/contracts/loadWallet"
import { AccountRepository } from "@/customer/infra/contracts/accountRepository"
import { WalletRepository } from "@/transaction/infra/contracts/walletRepository"
import { Either, left, right } from "@/shared/either"
import { CustomDomainError } from "@/shared/errors/customError"
import { WalletDataResponse } from "@/transaction/infra/web/types/out/walletDataResponse"

export class LoadWalletService implements LoadWallet {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly walletRepository: WalletRepository,
    private readonly presenter: (wallet: Wallet) => WalletDataResponse
  ) {}

  async loadWalletByAccountGuid(
    accountGuid: string
  ): Promise<Either<CustomDomainError, WalletDataResponse>> {
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
    return right(this.presenter(wallet))
  }
}

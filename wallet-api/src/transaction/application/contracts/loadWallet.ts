import { Either } from "@/shared/either"
import { Wallet } from "@/transaction/domain/wallet"
import { CustomDomainError } from "@/transaction/errors/customError"

export interface LoadWallet {
  loadWalletByAccountId: (
    accountGuid: string
  ) => Promise<Either<CustomDomainError, Wallet>>
  loadWalletById: (accountGuid: string, walletGuid: string) => Promise<Wallet>
}

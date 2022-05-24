import { Either } from "@/shared/either"
import { CustomDomainError } from "@/shared/errors/customError"
import { WalletDataResponse } from "@/transaction/infra/web/types/out/walletDataResponse"

export interface LoadWallet {
  loadWalletByAccountGuid: (
    accountGuid: string
  ) => Promise<Either<CustomDomainError, WalletDataResponse>>
}

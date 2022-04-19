import { TransactionRequest } from "@/transaction/infra/web/types/transactionRequest"
import { WalletTransaction } from "@/transaction/application/contracts/walletTransaction"
import { WalletRepository } from "@/transaction/infra/contracts/walletRepository"
import { Either, left, right } from "@/shared/either"
import { CustomDomainError } from "@/shared/errors/customError"
import { Amount } from "@/transaction/domain/valueobject/amount"
import { connection } from "@/shared/defaultDatasource"
import { Knex } from "knex"
import { promisify } from "@/shared/promisfy"
import { Wallet } from "@/transaction/domain/wallet"

export class WalletTransactionService implements WalletTransaction {
  constructor(private readonly walletRepository: WalletRepository) {}

  public async walletTransaction(
    transaction: TransactionRequest
  ): Promise<Either<CustomDomainError, true>> {
    const walletsOrError = await this.loadTransactionWallets(transaction)
    if (walletsOrError instanceof CustomDomainError) {
      return left(walletsOrError)
    }
    const transactionResult = walletsOrError.payer.deposit(
      Amount.of(transaction.value),
      walletsOrError.payee
    )
    if (transactionResult.isRight()) {
      // Database transaction context
      const transactionCtx = (await promisify(
        connection.transaction.bind(connection)
      )) as Knex.Transaction
      try {
        const updatedWallets = transactionResult.value
        const savePayerWallet = await this.walletRepository.updateWalletAmount(
          updatedWallets[0],
          transactionCtx
        )
        const savePayeeWallet = await this.walletRepository.updateWalletAmount(
          updatedWallets[1],
          transactionCtx
        )
        if (savePayeeWallet && savePayerWallet) {
          transactionCtx.commit()
          return right(true)
        } else {
          transactionCtx.rollback()
          return left(
            new CustomDomainError("An error occurred while updating wallets")
          )
        }
      } catch (err) {
        console.log(err)
        transactionCtx.rollback()
        return left(
          new CustomDomainError(
            "An internal error occurred while handling wallets"
          )
        )
      }
    }
    return left(transactionResult.value)
  }

  private async loadTransactionWallets(
    transaction: TransactionRequest
  ): Promise<CustomDomainError | { payer: Wallet; payee: Wallet }> {
    const payerWallet =
      await this.walletRepository.findPrimaryWalletByAccountGuid(
        transaction.payer
      )
    if (!payerWallet) {
      return new CustomDomainError("Payer wallet not found")
    }
    const payeeWallet =
      await this.walletRepository.findPrimaryWalletByAccountGuid(
        transaction.payee
      )
    if (!payeeWallet) {
      return new CustomDomainError("Payee wallet not found")
    }
    return { payer: payeeWallet, payee: payeeWallet }
  }
}

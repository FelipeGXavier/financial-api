import { TransactionRequest } from "@/transaction/infra/web/types/transactionRequest"
import { WalletTransaction } from "@/transaction/application/contracts/walletTransaction"
import { WalletRepository } from "@/transaction/infra/contracts/walletRepository"
import { Either, left, right } from "@/shared/either"
import { CustomDomainError } from "@/shared/errors/customError"
import { Amount } from "@/transaction/domain/valueobject/amount"
import { databaseTransactionCtx } from "@/shared/defaultDatasource"
import { Wallet } from "@/transaction/domain/wallet"
import { PayeePayerNewWallet } from "@/transaction/domain/wallet"
import { Knex } from "knex"
import { TransactionState } from "../../domain/transactionState"

export class WalletTransactionService implements WalletTransaction {
  constructor(private readonly walletRepository: WalletRepository) {}

  public async walletTransaction(
    transaction: TransactionRequest
  ): Promise<Either<CustomDomainError, true>> {
    const walletsOrError = await this.loadTransactionWallets(transaction)
    if (walletsOrError instanceof CustomDomainError) {
      return left(walletsOrError)
    }
    const transactionId =
      await this.walletRepository.saveWalletTransactionRegister(
        Amount.of(transaction.value).getAmount(),
        walletsOrError.payer.getId(),
        walletsOrError.payee.getId()
      )
    if (!transactionId) {
      return left(
        new CustomDomainError("Error while starting transaction process")
      )
    }
    const transactionResult = walletsOrError.payer.deposit(
      Amount.of(transaction.value),
      walletsOrError.payee
    )
    let errorMessage = ""
    if (transactionResult.isRight()) {
      // Retrieve database transaction context
      const transactionCtx = await databaseTransactionCtx()
      try {
        const updatedWallets = transactionResult.value
        if (await this.saveWallets(updatedWallets, transactionCtx)) {
          await this.walletRepository.updateWalletTransactionState(
            transactionId,
            TransactionState.Finished
          )
          transactionCtx.commit()
          return right(true)
        }
        transactionCtx.rollback()
        errorMessage = "An error occurred while updating wallets"
      } catch (err) {
        errorMessage = "An internal error occurred while handling wallet"
        transactionCtx.rollback()
      }
    } else {
      errorMessage = transactionResult.value.message
    }
    await this.walletRepository.updateWalletTransactionState(
      transactionId,
      TransactionState.Failed
    )
    return left(new CustomDomainError(errorMessage))
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
    return { payer: payerWallet, payee: payeeWallet }
  }

  private async saveWallets(
    wallets: PayeePayerNewWallet,
    transactionCtx: Knex.Transaction
  ) {
    const savePayerWallet = await this.walletRepository.updateWalletAmount(
      wallets[0],
      transactionCtx
    )
    const savePayeeWallet = await this.walletRepository.updateWalletAmount(
      wallets[1],
      transactionCtx
    )
    if (savePayeeWallet && savePayerWallet) {
      return true
    }
    return false
  }
}

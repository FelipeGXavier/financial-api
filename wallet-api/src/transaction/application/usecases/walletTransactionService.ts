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
import { TransactionState } from "@/transaction/domain/transactionState"
import { isCustomError, headOrUndefined } from "@/shared/util"
import { FraudCheckService } from "@/transaction/infra/service/fraudCheckServiceMock"
import { SendTransactionMessage } from "@/transaction/infra/service/sendTransactionMessageMock"
import Logger from "@/shared/logger"

export class WalletTransactionService implements WalletTransaction {
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly sendTransactionMessage: SendTransactionMessage,
    private readonly transactionValidionService: FraudCheckService
  ) {}

  public async walletTransaction(
    transaction: TransactionRequest
  ): Promise<Either<CustomDomainError, true>> {
    const walletsOrError = await this.loadTransactionWallets(transaction)
    if (isCustomError(walletsOrError)) {
      return left(walletsOrError)
    }
    const transactionId = headOrUndefined(
      await this.walletRepository.saveWalletTransactionRegister(
        Amount.of(transaction.value).getAmount(),
        walletsOrError.payer.getId(),
        walletsOrError.payee.getId()
      )
    )
    if (!transactionId) {
      Logger.error(`Error while starting transaction ${transaction}`)
      return left(
        new CustomDomainError("Error while starting transaction process")
      )
    }
    if (!(await this.isValidTransaction(transactionId))) {
      Logger.info(`Transaction #${transactionId} was rejected`)
      return left(new CustomDomainError("Transaction was rejected"))
    }
    const transactionResult = walletsOrError.payer.deposit(
      Amount.of(transaction.value),
      walletsOrError.payee
    )
    const transactionInsert = await this.handleTransaction(
      transactionResult,
      transactionId
    )
    if (isCustomError(transactionInsert)) {
      await this.walletRepository.updateWalletTransactionState(
        transactionId,
        TransactionState.Failed
      )
      return left(transactionInsert)
    }
    // TODO: This pending promise prevent jest tests to finish
    this.sendTransactionMessage.sendMessage(transactionId)
    return right(true)
  }

  private async handleTransaction(
    transactionResult: Either<CustomDomainError, PayeePayerNewWallet>,
    transactionId: number
  ): Promise<true | CustomDomainError> {
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
          return true
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
    Logger.warn(
      `Error while handling transaction #${transactionId} `,
      errorMessage
    )
    return new CustomDomainError(errorMessage)
  }

  private async isValidTransaction(transactionId: number): Promise<boolean> {
    const result = await this.transactionValidionService.checkTransaction()
    if (!result) {
      await this.walletRepository.updateWalletTransactionState(
        transactionId,
        TransactionState.Rejected
      )
      return false
    }
    return true
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
    if (payerWallet.walletOwnerIsRetailer()) {
      return new CustomDomainError("Payer must not be a retailer")
    }
    return { payer: payerWallet, payee: payeeWallet }
  }

  private async saveWallets(
    wallets: PayeePayerNewWallet,
    transactionCtx: Knex.Transaction
  ): Promise<boolean> {
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

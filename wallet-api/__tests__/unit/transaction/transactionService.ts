import { mock, mockReset } from "jest-mock-extended"
import { WalletRepository } from "@/transaction/infra/contracts/walletRepository"
import { WalletTransactionService } from "@/transaction/application/usecases/walletTransactionService"
import { randomUUID } from "crypto"
import { CustomDomainError } from "@/shared/errors/customError"
import { AccountType } from "@/customer/domain/accountType"
import { Wallet } from "@/transaction/domain/wallet"
import { FraudCheckService } from "@/transaction/infra/service/fraudCheckServiceMock"
import { SendTransactionMessage } from "@/transaction/infra/service/sendTransactionMessageMock"
import { builderWalletUserType } from "__tests__/fixture/builderFixture"

// Mocks
const mockWalletRepository = mock<WalletRepository>()
const mockTransactionValidationService = mock<FraudCheckService>()
const mockTransactionMessageHandler = mock<SendTransactionMessage>()
const transactionService = new WalletTransactionService(
  mockWalletRepository,
  mockTransactionMessageHandler,
  mockTransactionValidationService
)

// Object helpers
const payerGuid = randomUUID()
const payeeGuid = randomUUID()
const input = {
  value: 1,
  payer: payerGuid,
  payee: payeeGuid,
}

describe("TransactionService", () => {
  beforeEach(() => {
    mockReset(mockWalletRepository)
    mockReset(mockTransactionMessageHandler)
    mockReset(mockTransactionValidationService)
  })
  test("Payer wallet not found should return error", async () => {
    setupMockFindWalletMethod(payerGuid, Promise.resolve(null))
    setupMockFindWalletMethod(
      payeeGuid,
      Promise.resolve(builderWalletUserType(AccountType.Retailer, 1, 1))
    )
    const payerWalletNotFound = await transactionService.walletTransaction(
      input
    )
    expect(payerWalletNotFound.isLeft()).toBeTruthy()
    expect(payerWalletNotFound.value).toEqual(
      new CustomDomainError("Payer wallet not found")
    )
  })

  test("Payee wallet not found should return error", async () => {
    setupMockFindWalletMethod(payeeGuid, Promise.resolve(null))
    setupMockFindWalletMethod(
      payerGuid,
      Promise.resolve(builderWalletUserType(AccountType.Retailer, 1, 1))
    )
    const payeeWalletNotFound = await transactionService.walletTransaction(
      input
    )
    expect(payeeWalletNotFound.isLeft()).toBeTruthy()
    expect(payeeWalletNotFound.value).toEqual(
      new CustomDomainError("Payee wallet not found")
    )
  })

  test("Payer as retailer should return error", async () => {
    setupMockFindWalletMethod(
      payeeGuid,
      Promise.resolve(builderWalletUserType(AccountType.Retailer, 1, 1))
    )
    setupMockFindWalletMethod(
      payerGuid,
      Promise.resolve(builderWalletUserType(AccountType.Retailer, 2, 2))
    )
    const payeeWalletNotFound = await transactionService.walletTransaction(
      input
    )
    expect(payeeWalletNotFound.isLeft()).toBeTruthy()
    expect(payeeWalletNotFound.value).toEqual(
      new CustomDomainError("Payer must not be a retailer")
    )
  })

  test("Problem while starting transaction should return error", async () => {
    setupMockFindWalletMethod(
      payerGuid,
      Promise.resolve(builderWalletUserType(AccountType.User, 1, 1))
    )
    setupMockFindWalletMethod(
      payeeGuid,
      Promise.resolve(builderWalletUserType(AccountType.Retailer, 2, 2))
    )
    mockWalletRepository.saveWalletTransactionRegister
      .calledWith(input.value, 1, 2)
      .mockReturnValue(Promise.resolve(undefined))
    const result = await transactionService.walletTransaction(input)
    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toEqual(
      new CustomDomainError("Error while starting transaction process")
    )
    expect(mockWalletRepository.saveWalletTransactionRegister).toBeCalledTimes(
      1
    )
    expect(mockWalletRepository.saveWalletTransactionRegister).toBeCalledWith(
      1,
      1,
      2
    )
  })

  test("Transaction rejected should return error", async () => {
    // Prepare
    setupMockFindWalletMethod(
      payerGuid,
      Promise.resolve(builderWalletUserType(AccountType.User, 1, 1, true, 10))
    )
    setupMockFindWalletMethod(
      payeeGuid,
      Promise.resolve(builderWalletUserType(AccountType.Retailer, 2, 2))
    )
    mockTransactionValidationService.checkTransaction.mockReturnValue(
      Promise.resolve(false)
    )
    mockWalletRepository.saveWalletTransactionRegister.mockReturnValue(
      Promise.resolve(1)
    )
    // Execute
    const result = await transactionService.walletTransaction(input)
    // Assert
    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toEqual(
      new CustomDomainError("Transaction was rejected")
    )
    expect(mockTransactionValidationService.checkTransaction).toBeCalledTimes(1)
  })

  test("Payer without necessary amount in wallet should return error", async () => {
    setupMockFindWalletMethod(
      payerGuid,
      Promise.resolve(builderWalletUserType(AccountType.User, 1, 1, true, 0))
    )
    setupMockFindWalletMethod(
      payeeGuid,
      Promise.resolve(builderWalletUserType(AccountType.Retailer, 2, 2))
    )
    mockTransactionValidationService.checkTransaction.mockReturnValue(
      Promise.resolve(true)
    )
    mockWalletRepository.saveWalletTransactionRegister.mockReturnValue(
      Promise.resolve(1)
    )
    // Execute
    const result = await transactionService.walletTransaction(input)
    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toEqual(
      new CustomDomainError(
        "Payer doesn't have the necessary amount to exchange"
      )
    )
  })

  test("Problem while updating wallet state should return error", async () => {
    setupMockFindWalletMethod(
      payerGuid,
      Promise.resolve(builderWalletUserType(AccountType.User, 1, 1, true, 10))
    )
    setupMockFindWalletMethod(
      payeeGuid,
      Promise.resolve(builderWalletUserType(AccountType.Retailer, 2, 2))
    )
    mockTransactionValidationService.checkTransaction.mockReturnValue(
      Promise.resolve(true)
    )
    mockWalletRepository.saveWalletTransactionRegister.mockReturnValue(
      Promise.resolve(1)
    )
    // Execute
    const result = await transactionService.walletTransaction(input)
    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toEqual(
      new CustomDomainError("An error occurred while updating wallets")
    )
  })

  test("Valid transaction", async () => {
    setupMockFindWalletMethod(
      payerGuid,
      Promise.resolve(builderWalletUserType(AccountType.User, 1, 1, true, 10))
    )
    setupMockFindWalletMethod(
      payeeGuid,
      Promise.resolve(builderWalletUserType(AccountType.Retailer, 2, 2))
    )
    mockTransactionValidationService.checkTransaction.mockReturnValue(
      Promise.resolve(true)
    )
    mockWalletRepository.saveWalletTransactionRegister.mockReturnValue(
      Promise.resolve(1)
    )
    mockWalletRepository.updateWalletAmount.mockReturnValue(Promise.resolve(1))
    const result = await transactionService.walletTransaction(input)
    expect(result.isRight()).toBeTruthy()
    expect(mockWalletRepository.updateWalletAmount).toBeCalledTimes(2)
    expect(mockTransactionMessageHandler.sendMessage).toBeCalledTimes(1)
  })
})

const setupMockFindWalletMethod = (
  withGuid: string,
  withReturn: Promise<Wallet | null>
) => {
  mockWalletRepository.findPrimaryWalletByAccountGuid
    .calledWith(withGuid)
    .mockReturnValue(withReturn)
}

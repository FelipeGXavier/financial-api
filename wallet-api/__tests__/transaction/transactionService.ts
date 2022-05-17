import { mock, mockClear } from "jest-mock-extended"
import { WalletRepository } from "@/transaction/infra/contracts/walletRepository"
import { WalletTransactionService } from "@/transaction/application/usecases/walletTransactionService"
import { randomUUID } from "crypto"
import { CustomDomainError } from "@/shared/errors/customError"
import { builderWalletUserType } from "../fixture/builderFixture"
import { AccountType } from "@/customer/domain/accountType"
import { Wallet } from "@/transaction/domain/wallet"

const mockWalletRepository = mock<WalletRepository>()
const transactionService = new WalletTransactionService(mockWalletRepository)

describe("TransactionService", () => {
  beforeEach(() => {
    mockClear(mockWalletRepository)
  })
  test("Payer wallet not found should return error", async () => {
    const payerGuid = randomUUID()
    const payeeGuid = randomUUID()
    setupMockFindWalletMethod(payerGuid, Promise.resolve(null))
    setupMockFindWalletMethod(
      payeeGuid,
      Promise.resolve(builderWalletUserType(AccountType.Retailer, 1, 1))
    )
    const payerWalletNotFound = await transactionService.walletTransaction({
      value: 1,
      payer: payerGuid,
      payee: payeeGuid,
    })
    expect(payerWalletNotFound.isLeft()).toBeTruthy()
    expect(payerWalletNotFound.value).toEqual(
      new CustomDomainError("Payer wallet not found")
    )
  })

  test("Payee wallet not found should return error", async () => {
    const payerGuid = randomUUID()
    const payeeGuid = randomUUID()
    setupMockFindWalletMethod(payeeGuid, Promise.resolve(null))
    setupMockFindWalletMethod(
      payerGuid,
      Promise.resolve(builderWalletUserType(AccountType.Retailer, 1, 1))
    )
    const payeeWalletNotFound = await transactionService.walletTransaction({
      value: 1,
      payer: payerGuid,
      payee: payeeGuid,
    })
    expect(payeeWalletNotFound.isLeft()).toBeTruthy()
    expect(payeeWalletNotFound.value).toEqual(
      new CustomDomainError("Payee wallet not found")
    )
  })

  test("Payer as retailer should return error", async () => {
    const payerGuid = randomUUID()
    const payeeGuid = randomUUID()
    setupMockFindWalletMethod(
      payeeGuid,
      Promise.resolve(builderWalletUserType(AccountType.Retailer, 1, 1))
    )
    setupMockFindWalletMethod(
      payerGuid,
      Promise.resolve(builderWalletUserType(AccountType.Retailer, 2, 2))
    )
    const payeeWalletNotFound = await transactionService.walletTransaction({
      value: 1,
      payer: payerGuid,
      payee: payeeGuid,
    })
    expect(payeeWalletNotFound.isLeft()).toBeTruthy()
    expect(payeeWalletNotFound.value).toEqual(
      new CustomDomainError("Payer must not be a retailer")
    )
  })

  test("Error while starting transaction should return error", async () => {
    const payerGuid = randomUUID()
    const payeeGuid = randomUUID()
    setupMockFindWalletMethod(
      payerGuid,
      Promise.resolve(builderWalletUserType(AccountType.User, 1, 1))
    )
    setupMockFindWalletMethod(
      payeeGuid,
      Promise.resolve(builderWalletUserType(AccountType.Retailer, 2, 2))
    )
    const input = {
      value: 1,
      payer: payerGuid,
      payee: payeeGuid,
    }
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

  test("Transaction rejected", () => {})
})

const setupMockFindWalletMethod = (
  withGuid: string,
  withReturn: Promise<Wallet | null>
) => {
  mockWalletRepository.findPrimaryWalletByAccountGuid
    .calledWith(withGuid)
    .mockReturnValue(withReturn)
}

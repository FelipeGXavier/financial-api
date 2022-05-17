import { Amount } from "@/transaction/domain/valueobject/amount"
import { randomUUID } from "crypto"
import { PayeePayerNewWallet, Wallet } from "@/transaction/domain/wallet"
import { AccountType } from "@/customer/domain/accountType"
import { CustomDomainError } from "@/shared/errors/customError"

describe("Wallet entity", () => {
  test("wallet owner type", () => {
    const retailer = builderWalletUserType(AccountType.Retailer, 1, 1)
    const user = builderWalletUserType(AccountType.User, 1, 1)
    expect(retailer.walletOwnerIsRetailer()).toBeTruthy()
    expect(retailer.walletOwnerIsUser()).toBeFalsy()
    expect(user.walletOwnerIsUser()).toBeTruthy()
    expect(user.walletOwnerIsRetailer()).toBeFalsy()
  })

  test("wallet amount", () => {
    const wallet = builderWalletUserType(AccountType.User, 1, 1, true, 10)
    expect(wallet.amountExchangeIsAvailable(Amount.of(9))).toBeTruthy()
    expect(wallet.amountExchangeIsAvailable(Amount.of(10))).toBeTruthy()
    expect(wallet.amountExchangeIsAvailable(Amount.of(11))).toBeFalsy()
  })

  test("wallet invalid amount", () => {
    expect(() =>
      builderWalletUserType(AccountType.User, 1, 1, true, -1)
    ).toThrow("Illegal amount value")
  })

  test("deposit without necessary amount", () => {
    const payer = builderWalletUserType(AccountType.User, 1, 1, true, 10)
    const payee = builderWalletUserType(AccountType.Retailer, 2, 2, true, 0)
    const result = payer.deposit(Amount.of(11), payee)
    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toEqual(
      new CustomDomainError(
        "Payer doesn't have the necessary amount to exchange"
      )
    )
  })

  test("deposit amount", () => {
    const payer = builderWalletUserType(AccountType.User, 1, 1, true, 10)
    const payee = builderWalletUserType(AccountType.Retailer, 2, 2, true, 1)
    const deposit = payer.deposit(Amount.of(10), payee)
    const payerWalletResult = (deposit.value as PayeePayerNewWallet)[0]
    const payeeWalletResult = (deposit.value as PayeePayerNewWallet)[1]
    expect(deposit.isRight()).toBeTruthy()
    expect(deposit.value).toHaveLength(2)
    expect(payerWalletResult).toEqual(
      builderWalletUserType(AccountType.User, 1, 1, true, 0, payer.getGuid())
    )
    expect(payeeWalletResult).toEqual(
      builderWalletUserType(
        AccountType.Retailer,
        2,
        2,
        true,
        11,
        payee.getGuid()
      )
    )
  })

  test("deposit must not mutate input wallets", () => {
    const payer = builderWalletUserType(AccountType.User, 1, 1, true, 99)
    const payerCopy = structuredClone(payer)
    const payee = builderWalletUserType(AccountType.Retailer, 2, 2, true, 1)
    const payeeCopy = structuredClone(payee)
    payer.deposit(Amount.of(1), payee)
    expect(payer).toEqual(payerCopy)
    expect(payee).toEqual(payeeCopy)
  })
})

const builderWalletUserType = (
  type: AccountType,
  id: number,
  account: number,
  primary: boolean = true,
  amount: number = 0,
  guid: string = randomUUID()
) => {
  return new Wallet({
    account,
    accountType: type,
    guid,
    primaryWallet: primary,
    amount: Amount.of(amount),
    id,
  })
}

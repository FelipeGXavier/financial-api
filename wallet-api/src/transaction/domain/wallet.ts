import { Amount } from "./valueobject/amount"
import { right, left, Either } from "@/shared/either"
import { CustomDomainError } from "@/shared/errors/customError"
import { AccountType } from "@/customer/domain/accountType"

export interface NamedWalletFields {
  id: number
  primaryWallet: boolean
  guid: string
  account: number
  amount: Amount
  accountType: AccountType
}

export type PayeePayerNewWallet = [payer: Wallet, payee: Wallet]
export class Wallet {
  private readonly id: number
  private readonly primaryWallet: boolean
  private readonly guid: string
  private readonly account: number
  private readonly amount: Amount
  private readonly accountType: AccountType

  constructor(parameters: NamedWalletFields) {
    this.primaryWallet = parameters.primaryWallet
    this.guid = parameters.guid
    this.account = parameters.account
    this.amount = parameters.amount
    this.id = parameters.id
    this.accountType = parameters.accountType
  }

  public deposit(
    depositValue: Amount,
    payeeWallet: Wallet
  ): Either<CustomDomainError, PayeePayerNewWallet> {
    if (this.amountExchangeIsAvailable(depositValue)) {
      const resultPayerAmount = Amount.of(
        this.getValue() - depositValue.getAmount()
      )
      const resultPayeeAmount = Amount.of(
        payeeWallet.getValue() + depositValue.getAmount()
      )
      // Avoid side effects creating new wallet instances as result
      const resultPayerWallet = new Wallet({
        primaryWallet: this.primaryWallet,
        guid: this.guid,
        account: this.account,
        amount: resultPayerAmount,
        id: this.getId(),
        accountType: this.accountType,
      })
      const resultPayeeWallet = new Wallet({
        primaryWallet: this.primaryWallet,
        guid: payeeWallet.getGuid(),
        account: payeeWallet.account,
        amount: resultPayeeAmount,
        id: payeeWallet.getId(),
        accountType: payeeWallet.accountType,
      })
      return right([resultPayerWallet, resultPayeeWallet])
    }
    return left(
      new CustomDomainError(
        "Payer doesn't have the necessary amount to exchange"
      )
    )
  }

  public amountExchangeIsAvailable(amountExchange: Amount) {
    return this.amount.getAmount() >= amountExchange.getAmount()
  }

  public getValue(): number {
    return this.amount.getAmount()
  }

  public getGuid(): string {
    return this.guid
  }

  public getId(): number {
    return this.id
  }

  public isPrimaryWallet(): boolean {
    return this.primaryWallet
  }

  public walletOwnerIsRetailer(): boolean {
    return this.accountType == AccountType.Retailer
  }

  public walletOwnerIsUser(): boolean {
    return this.accountType == AccountType.User
  }
}

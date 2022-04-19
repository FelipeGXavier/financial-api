import { Amount } from "./valueobject/amount"
import { right, left, Either } from "@/shared/either"
import { CustomDomainError } from "@/shared/errors/customError"

export interface NamedWalletFields {
  primaryWallet: boolean
  guid: string
  account: number
  amount: Amount
}

export type PayeePayerNewWallet = [payer: Wallet, payee: Wallet]
export class Wallet {
  private readonly primaryWallet: boolean
  private readonly guid: string
  private readonly account: number
  private readonly amount: Amount

  constructor(parameters: NamedWalletFields) {
    this.primaryWallet = parameters.primaryWallet
    this.guid = parameters.guid
    this.account = parameters.account
    this.amount = parameters.amount
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
      })
      const resultPayeeWallet = new Wallet({
        primaryWallet: this.primaryWallet,
        guid: payeeWallet.getGuid(),
        account: this.account,
        amount: resultPayeeAmount,
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
}

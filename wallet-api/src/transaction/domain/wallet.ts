import { Account } from "customer/domain/account"
import { Amount } from "./vo/amount"

interface NamedWalletFields {
  primaryWallet: boolean
  guid: string
  account: Account
  amount: Amount
}

export class Wallet {
  private readonly primaryWallet: boolean
  private readonly guid: string
  private readonly account: Account
  private readonly amount: Amount

  constructor(parameters: NamedWalletFields) {
    this.primaryWallet = parameters.primaryWallet
    this.guid = parameters.guid
    this.account = parameters.account
    this.amount = parameters.amount
  }
}

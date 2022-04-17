import { Amount } from "./valueobject/amount"

export interface NamedWalletFields {
  primaryWallet: boolean
  guid: string
  account: number
  amount: Amount
}

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
}

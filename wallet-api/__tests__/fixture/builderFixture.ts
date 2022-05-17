import { AccountType } from "@/customer/domain/accountType"
import { Amount } from "@/transaction/domain/valueobject/amount"
import { Wallet } from "@/transaction/domain/wallet"
import { randomUUID } from "crypto"

export const builderWalletUserType = (
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

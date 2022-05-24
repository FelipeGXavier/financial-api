import { AccountType } from "@/customer/domain/accountType"

export type WalletDataResponse = {
  primaryWallet: boolean
  guid: string
  amount: number
  id: number
  accountType: AccountType
}

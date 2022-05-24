import { AccountType } from "@/customer/domain/accountType"
import { Wallet } from "@/transaction/domain/wallet"
import { WalletDataResponse } from "@/transaction/infra/web/types/out/walletDataResponse"

const formatWalletData = (wallet: Wallet): WalletDataResponse => {
  return {
    accountType: wallet.walletOwnerIsUser()
      ? AccountType.User
      : AccountType.Retailer,
    guid: wallet.getGuid(),
    id: wallet.getId(),
    amount: wallet.getValue(),
    primaryWallet: wallet.isPrimaryWallet(),
  }
}

export const formatter = { format: formatWalletData }
